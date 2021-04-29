import { doWarn } from '~/logging';
import {
  PriceMessage,
  DerefContext,
  DerefMessagePayloadOf,
  broadcastMessageToIframes,
} from '~/page-handlers/messages';
import {
  IndexSearch,
  isIndexSearch,
  UnvalidatedIndexSearch,
} from '~/price-indexer/index-key';
import {
  getHourlyPrice,
  getRegion,
  mapTenancyString,
  PageHandler,
  urlMatchesRegex,
  makeDerefExtensionContainer,
} from './common';

const getEc2Iframe = (): HTMLIFrameElement | null => {
  const iframe = document.getElementById('instance-lx-gwt-frame');
  if (!(iframe instanceof HTMLIFrameElement)) {
    doWarn('Expected element is not an iframe');
    return null;
  }
  return iframe;
};

const getContentOfElement = (cssSelector: string): string | null =>
  getEc2Iframe()?.contentDocument?.querySelector(cssSelector)?.textContent ??
  null;

const getInstanceSearchFromReviewPage = (): IndexSearch | null => {
  const tenancyString = getContentOfElement(
    '.lx-IQ > tbody:nth-child(1) > tr:nth-child(13) > td:nth-child(2) > div:nth-child(1)',
  )?.split(' - ')[0];
  const search: UnvalidatedIndexSearch = {
    operatingSystem: 'Linux',
    preInstalledSw: 'NA',
    location: getRegion(),
    instanceType: getContentOfElement(
      '#gwt-debug-liwReviewInstanceTypeTable > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(1)',
    ),
    tenancy: tenancyString ? mapTenancyString(tenancyString) : null,
  };

  return isIndexSearch(search) ? search : null;
};

const getInstanceSearchFromInstanceSelectionPage = (): IndexSearch | null => {
  const search: UnvalidatedIndexSearch = {
    operatingSystem: 'Linux',
    preInstalledSw: 'NA',
    location: getRegion(),
    instanceType:
      getContentOfElement('span.gwt-InlineLabel:nth-child(2)')?.split(' ')[0] ??
      null,
    tenancy: 'Shared', // The user hasn't yet selected a tenancy so assume Shared.
  };
  return isIndexSearch(search) ? search : null;
};

const getDerefContainer = async (context: DerefContext) => {
  const ec2Iframe = getEc2Iframe();
  const parent = ec2Iframe?.contentDocument?.querySelector('.lx-A-');
  return makeDerefExtensionContainer({ routeKey: 'priceBar', context, parent });
};

export const ec2InstanceWizard: PageHandler = {
  conditions: [
    urlMatchesRegex(
      /.*console.aws.amazon.com\/ec2\/v2\/home?.*#LaunchInstanceWizard:/,
    ),
  ],
  async handler(context) {
    if (window.self !== window.top) {
      return;
    }

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

    const derefContainer = await getDerefContainer(context);

    if (derefContainer) {
      const payload: DerefMessagePayloadOf<PriceMessage> = {
        hourlyCost: hourlyPrice,
        type: instanceSearch.instanceType,
        lastUpdatedAt: null,
      };

      broadcastMessageToIframes({ type: 'price', payload });
    }
  },
};
