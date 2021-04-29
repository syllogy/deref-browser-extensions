import { getCloudTrailEvents } from '~/lib/cloudtrail/client';
import { getCloudTrailXsrfToken } from '~/lib/cloudtrail/xsrf';
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
  getRegionCode,
} from './common';

const getEc2Iframe = (): HTMLIFrameElement | null => {
  const iframe = document.getElementById('compute-react-frame');
  if (!iframe) {
    return null;
  }
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

const getDerefContainer = async (
  context: DerefContext,
): Promise<HTMLIFrameElement | null> => {
  const ec2Iframe = getEc2Iframe();
  const parent = ec2Iframe?.contentDocument?.querySelector(
    'h4.awsui-util-ml-m',
  );
  return makeDerefExtensionContainer({ routeKey: 'priceBar', context, parent });
};

export const ec2InstanceList: PageHandler = {
  conditions: [
    urlMatchesRegex(/.*console.aws.amazon.com\/ec2\/v2\/home?.*#Instances:/),
  ],
  navContextUpdater: (prevNavContext) => {
    // Instance id has an icon next to it - seems hard to extract only the text part.
    const instanceIdContent = getLabelledValue('label-for-Instance ID');
    const instanceIdParts = instanceIdContent?.split(/\s/);
    const instanceId = instanceIdParts?.[instanceIdParts.length - 1];

    if (instanceId) {
      if (
        prevNavContext?.type === 'ec2Instance' &&
        prevNavContext.data.instanceId === instanceId
      ) {
        return prevNavContext;
      }
      return {
        type: 'ec2Instance',
        data: {
          instanceId,
        },
      };
    }
  },
  async handler(context) {
    if (window.self !== window.top) {
      return;
    }

    const instanceSearch = getInstanceSearch();
    if (!instanceSearch) {
      return;
    }

    const hourlyPrice = await getHourlyPrice(instanceSearch);
    if (!hourlyPrice) {
      return;
    }

    const instanceId = getLabelledValue('label-for-Instance ID')
      ?.split(/\s+/)
      .pop()
      ?.trim();
    if (!instanceId) {
      doWarn('No instance ID found');
      return;
    }

    const xsrfToken = await getCloudTrailXsrfToken();
    if (!xsrfToken) {
      doWarn('Cloudtrail XSRF token not found');
      return;
    }
    const region = getRegionCode();
    let lastUpdated: null | { at: Date; by: string } = null;
    for await (const event of getCloudTrailEvents({
      region,
      lookupField: 'ResourceName',
      lookupValue: instanceId,
      xsrfToken,
    })) {
      lastUpdated =
        !lastUpdated || lastUpdated.at.getTime() < event.eventTime
          ? { at: new Date(event.eventTime), by: event.username }
          : lastUpdated;
    }

    await getDerefContainer(context);

    const payload: DerefMessagePayloadOf<PriceMessage> = {
      hourlyCost: hourlyPrice,
      type: instanceSearch.instanceType,
      lastUpdated,
    };

    broadcastMessageToIframes({ type: 'price', payload });
  },
};
