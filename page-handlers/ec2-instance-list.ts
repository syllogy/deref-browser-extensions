import { doWarn } from '~/logging';
import {
  IndexSearch,
  isIndexSearch,
  UnvalidatedIndexSearch,
} from '~/price-indexer/index-key';
import {
  doPageHandler,
  getHourlyPrice,
  getRegion,
  InstanceInfo,
  makeDerefContainer,
  mapTenancyString,
  PageHandler,
  urlMatchesRegex,
} from './common';

const getEc2Iframe = (): HTMLIFrameElement | null => {
  const iframe = document.getElementById('compute-react-frame');
  if (!(iframe instanceof HTMLIFrameElement)) {
    doWarn('Expected element is not an iframe');
    return null;
  }
  return iframe;
};

const getContentOfElement = (cssSelector: string): string | null =>
  getEc2Iframe()?.contentDocument?.querySelector(cssSelector)?.textContent ??
  null;

const getLabelledValue = (labelName: string): string | null =>
  getContentOfElement(`[data-analytics="${labelName}"] ~ div`);

const getInstanceSearch = (): IndexSearch | null => {
  const tenancyString = getLabelledValue('label-for-details_Tenancy');
  const search: UnvalidatedIndexSearch = {
    operatingSystem: 'Linux',
    preInstalledSw: 'NA',
    location: getRegion(),
    instanceType: getLabelledValue('label-for-Instance type'),
    tenancy: tenancyString ? mapTenancyString(tenancyString) : null,
  };

  console.log(search);

  return isIndexSearch(search) ? search : null;
};

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

  const parentDiv = ec2Iframe?.contentDocument?.querySelector(
    'h4.awsui-util-ml-m',
  );
  if (!parentDiv) {
    throw new Error('Parent div not found');
  }
  const derefContainer = makeDerefContainer(derefContainerId);
  derefContainer.style.height = '33px';
  derefContainer.style.minWidth = '550px';
  derefContainer.style.display = 'block';
  parentDiv.append(derefContainer);
  return derefContainer;
};

export const ec2InstanceList: PageHandler = {
  conditions: [
    urlMatchesRegex(/.*console.aws.amazon.com\/ec2\/v2\/home?.*#Instances:/),
  ],
  async handler() {
    const instanceSearch = getInstanceSearch();
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
  },
};
