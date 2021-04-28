// Basically common.ts but no dependency on webextension-polyfill-ts.

import { postMessageToIframe, DerefContext } from '~/page-handlers/messages';
import { RouteKey, getRoute } from '~/components/routes';
import { doWarn } from '~/logging';

export interface MakeDerefContainerOptions {
  routeKey: RouteKey;
  src: string;
  parent?: Element | null;
  context: DerefContext;
}

const getDerefContainerId = (routeKey: RouteKey) => `deref-${routeKey}`;

export const makeDerefContainer = async ({
  routeKey,
  src,
  parent,
  context,
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
  derefContainer.src = `${src}?route=${routeKey}`;

  const route = getRoute(routeKey);
  applyStyleDeclaration(derefContainer, route.style(context));

  parent.append(derefContainer);

  return await new Promise((resolve) => {
    derefContainer.addEventListener('load', (event) => {
      postMessageToIframe(derefContainer, { type: 'init', payload: context });
      resolve(derefContainer);
    });
  });
};

export const applyStyleDeclaration = (
  element: HTMLElement,
  style?: Partial<CSSStyleDeclaration>,
) => {
  if (!style) {
    return;
  }
  for (const [key, value] of Object.entries(style)) {
    element.style[key as any] = value as string;
  }
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
