import { browser } from 'webextension-polyfill-ts';
import {
  getIndexKey,
  IndexSearch,
  regionNameMap,
} from '~/price-indexer/index-key';
import { DerefContext, NavContext } from '~/page-handlers/messages';
import {
  MakeDerefContainerOptions,
  makeDerefContainer,
} from '~/page-handlers/utils';

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
  navContextUpdater?: (
    prevNavContext: NavContext | null,
  ) => Promise<NavContext | void> | NavContext | void;
  handler: (context: DerefContext) => Promise<void> | void;
}

export const getRegionCode = (): string => {
  // TODO: Validate the result.
  return new URL(document.URL).host.split('.')[0];
};

export const getRegion = () => {
  const regionCode = getRegionCode();
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

type MakeDerefExtensionContainerOptions = Omit<
  MakeDerefContainerOptions,
  'src'
>;

export const makeDerefExtensionContainer = async (
  opts: MakeDerefExtensionContainerOptions,
): Promise<HTMLIFrameElement | null> => {
  return makeDerefContainer({
    ...opts,
    src: browser.runtime.getURL('./assets/iframe-index.html'),
  });
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
