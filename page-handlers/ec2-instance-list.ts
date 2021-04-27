import { doWarn } from '~/logging';
import {
  postMessageToIframe,
  PriceMessage,
  DerefContext,
  DerefMessagePayloadOf,
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
  makeDerefContainer,
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

  return isIndexSearch(search) ? search : null;
};

const getDerefContainer = async (context: DerefContext) => {
  const ec2Iframe = getEc2Iframe();
  const parent = ec2Iframe?.contentDocument?.querySelector(
    'h4.awsui-util-ml-m',
  );
  return makeDerefContainer({ routeKey: 'priceBar', context, parent });
};

export const ec2InstanceList: PageHandler = {
  conditions: [
    urlMatchesRegex(/.*console.aws.amazon.com\/ec2\/v2\/home?.*#Instances:/),
  ],
  async handler(context) {
    const instanceSearch = getInstanceSearch();
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
      };

      postMessageToIframe(derefContainer, { type: 'price', payload });
    }
  },
};
