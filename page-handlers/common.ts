import { browser } from 'webextension-polyfill-ts';
import {
  getIndexKey,
  IndexSearch,
  regionNameMap,
} from '~/price-indexer/index-key';
import { postMessageToIframe, DerefContext } from '~/page-handlers/messages';
import { RouteKey, getRoute } from '~/components/routes';
import { doWarn } from '~/logging';

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
  handler: (context: DerefContext) => Promise<void> | void;
}

export const conditionsAreMet = (conditions: ConditionFn[]): boolean =>
  conditions.every((c) => c({ url: document.URL }));

export const doPageHandler = async (
  { conditions, handler }: PageHandler,
  context: DerefContext,
) => {
  if (conditionsAreMet(conditions)) {
    await handler(context);
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

interface MakeDerefContainerOptions {
  routeKey: RouteKey;
  parent?: Element | null;
  context: DerefContext;
  style?: Partial<CSSStyleDeclaration>;
}

const getDerefContainerId = (routeKey: RouteKey) => `deref-${routeKey}`;

export const makeDerefContainer = async ({
  routeKey,
  parent,
  context,
  style,
}: MakeDerefContainerOptions): Promise<HTMLIFrameElement | null> => {
  const elementId = getDerefContainerId(routeKey);

  if (!parent) {
    doWarn(`No parent found for ${routeKey}`);
    return null;
  }

  const existing = parent.querySelector(`#${elementId}`);
  if (existing) {
    return existing as HTMLIFrameElement;
  }

  const derefContainer = document.createElement('iframe');
  derefContainer.id = `deref-${routeKey}`;
  derefContainer.className = 'deref-container';
  derefContainer.style.border = '0';
  derefContainer.style.display = 'block';
  derefContainer.src = browser.runtime.getURL(
    `./assets/iframe-index.html?route=${routeKey}`,
  );

  const route = getRoute(routeKey);
  for (const [key, value] of Object.entries(route.style)) {
    derefContainer.style[key as any] = value as string;
  }
  for (const [key, value] of Object.entries(style ?? {})) {
    derefContainer.style[key as any] = value as string;
  }

  parent.append(derefContainer);

  return await new Promise((resolve) => {
    derefContainer.addEventListener('load', (event) => {
      postMessageToIframe(derefContainer, { type: 'init', payload: context });
      resolve(derefContainer);
    });
  });
};

export const findDerefContainerForRoute = (routeKey: RouteKey) => {
  const id = getDerefContainerId(routeKey);
  return findDerefContainers(document).find((iframe) => iframe.id === id);
};

export const findDerefContainers = (
  document: Document | null,
  depth = 2,
): HTMLIFrameElement[] => {
  if (!document || depth === 0) {
    return [];
  }
  const iframes: HTMLIFrameElement[] = [];
  document.querySelectorAll('iframe').forEach((iframe) => {
    if (iframe.className === 'deref-container') {
      iframes.push(iframe);
    } else {
      iframes.push(...findDerefContainers(iframe.contentDocument, depth - 1));
    }
  });
  return iframes;
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
