import { browser } from 'webextension-polyfill-ts';
import { doWarn } from '~/logging';
import {
  getIndexKey,
  IndexSearch,
  regionNameMap,
} from '~/price-indexer/index-key';

export interface InstanceInfo {
  type: string;
  hourlyCost: number;
}

export interface Context {
  url: string;
}
export type ConditionFn = (ctx: Context) => boolean;

export const urlMatchesRegex = (url: RegExp): ConditionFn => {
  return (ctx): boolean => {
    return url.test(ctx.url);
  };
};

export interface PageHandler {
  conditions: ConditionFn[];
  handler: () => Promise<void> | void;
}

export const conditionsAreMet = (conditions: ConditionFn[]): boolean =>
  conditions.every((c) => c({ url: document.URL }));

export const doPageHandler = async ({ conditions, handler }: PageHandler) => {
  if (conditionsAreMet(conditions)) {
    await handler();
  }
};

export const getRegion = () => {
  const regionCode = new URL(document.URL).host.split('.')[0];
  return (regionNameMap as Record<string, string>)[regionCode] ?? null;
};

let priceIndex: Record<string, number | null> | null = null;
export const getHourlyPrice = async (
  search: IndexSearch,
): Promise<number | null> => {
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

export const makeDerefContainer = (id: string): HTMLIFrameElement => {
  const derefContainer = document.createElement('iframe');
  derefContainer.id = id;
  derefContainer.style.border = '0';
  derefContainer.src = browser.runtime.getURL('./assets/price.html');
  return derefContainer;
};

export const mapTenancyString = (tenancyString: string): string | null => {
  if (tenancyString === 'dedicated') {
    return 'Dedicated';
  }
  if (
    tenancyString.toLowerCase().includes('default') ||
    tenancyString.toLowerCase().startsWith('shared')
  ) {
    return 'Shared';
  }
  return null;
};

export const postMessageToIframe = (iframe: HTMLIFrameElement, data: any) => {
  if (!iframe.contentWindow) {
    doWarn('IFrame has no content window');
    return;
  }
  iframe.contentWindow.postMessage({ isDerefMessage: true, data }, '*');
};

export const unwrapMessageToIframe = (message: any): unknown | null => {
  if (message.isDerefMessage) {
    return message.data;
  }
  return null;
};
