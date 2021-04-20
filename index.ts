import { browser } from 'webextension-polyfill-ts';
import { doWarn } from './logging';
import {
  getIndexKey,
  IndexSearch,
  isIndexSearch,
  regionNameMap,
  UnvalidatedIndexSearch,
} from './price-indexer/index-key';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const getEc2Iframe = (): HTMLIFrameElement | null => {
  const iframe = document.getElementById('instance-lx-gwt-frame');
  if (!(iframe instanceof HTMLIFrameElement)) {
    doWarn('Expected element is not an iframe');
    return null;
  }
  return iframe;
};

const getRegion = () => {
  const regionCode = new URL(document.URL).host.split('.')[0];
  return (regionNameMap as Record<string, string>)[regionCode] ?? null;
};

const getContentOfElement = (cssSelector: string): string | null =>
  getEc2Iframe()?.contentDocument?.querySelector(cssSelector)?.textContent ??
  null;

const getInstanceSearchFromReviewPage = (): IndexSearch | null => {
  const search: UnvalidatedIndexSearch = {
    operatingSystem: 'Linux',
    preInstalledSw: 'NA',
    location: getRegion(),
    instanceType: getContentOfElement(
      '#gwt-debug-liwReviewInstanceTypeTable > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(1)',
    ),
    tenancy:
      getContentOfElement(
        '.lx-IQ > tbody:nth-child(1) > tr:nth-child(13) > td:nth-child(2) > div:nth-child(1)',
      )?.split(' - ')[0] ?? null,
  };

  return isIndexSearch(search) ? search : null;
};

const getInstanceSearchFromInstanceSelectionPage = (): IndexSearch | null => {
  console.log('getting from instance selection');
  const search: UnvalidatedIndexSearch = {
    operatingSystem: 'Linux',
    preInstalledSw: 'NA',
    location: getRegion(),
    instanceType:
      getContentOfElement('span.gwt-InlineLabel:nth-child(2)')?.split(' ')[0] ??
      null,
    tenancy: 'Shared', // The user hasn't yet selected a tenancy so assume Shared.
  };
  console.log(search);

  return isIndexSearch(search) ? search : null;
};

let priceIndex: Record<string, number | null> | null = null;
const getHourlyPrice = async (search: IndexSearch): Promise<number | null> => {
  if (!priceIndex) {
    const url = browser.runtime.getURL('./assets/price-index.json');
    const json = await (await fetch(url)).text();
    priceIndex = JSON.parse(json) as Record<string, number>;
  }

  // The below information isn't embedded anywhere on the page for MacOS
  // instances. mac1.metal is the only available MacOS instance type.
  if (search.instanceType === 'mac1.metal') {
    search.instanceType = 'mac1';
    search.tenancy = 'Host';
  }
  return priceIndex[getIndexKey(search)];
};

export interface InstanceInfo {
  type: string;
  hourlyCost: number;
}

const getDerefContainer = async (): Promise<HTMLIFrameElement> => {
  const derefContainerId = 'deref-container';
  const ec2Iframe = getEc2Iframe();
  const existingDiv = ec2Iframe?.contentDocument?.getElementById(
    derefContainerId,
  );
  if (existingDiv) {
    if (!(existingDiv instanceof HTMLIFrameElement)) {
      throw new Error('Expected element is not a div');
    }
    return existingDiv;
  }

  const parentDiv = ec2Iframe?.contentDocument?.querySelector('.lx-A-');
  if (!parentDiv) {
    throw new Error('Parent div not found');
  }
  const derefContainer = document.createElement('iframe');
  derefContainer.id = derefContainerId;
  derefContainer.style.height = '33px';
  derefContainer.style.minWidth = '550px';
  derefContainer.style.border = '0';
  derefContainer.src = browser.runtime.getURL('./assets/price.html');
  derefContainer.onload = () => void displayPrice();
  parentDiv.append(derefContainer);
  return derefContainer;
};

const displayPrice = async () => {
  const instanceSearch =
    getInstanceSearchFromReviewPage() ??
    getInstanceSearchFromInstanceSelectionPage();
  if (!instanceSearch) {
    return;
  }

  const hourlyPrice = await getHourlyPrice(instanceSearch);
  if (!hourlyPrice) {
    return;
  }

  const derefContainer = await getDerefContainer();
  if (!derefContainer.contentWindow) {
    doWarn('Deref container has no contentWindow');
    return;
  }

  const info: InstanceInfo = {
    hourlyCost: hourlyPrice,
    type: instanceSearch.instanceType,
  };
  derefContainer.contentWindow.postMessage(info, '*');
};

const main = async () => {
  while (true) {
    await displayPrice();
    await asyncSleep(1000);
  }
};

void main();
