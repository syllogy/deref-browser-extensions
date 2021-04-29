import { pageHandlers } from './page-handlers';
import initContentScript from '~/init-content-script';
import webextensionApi from '~/lib/extension-api/webextension-api';
import { NavContext } from '~/page-handlers/messages';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  // eslint-disable-next-line prefer-const -- updateDerefContext is mutable.
  let { derefContext, updateDerefContext } = await initContentScript({
    extensionApi: webextensionApi,
    onUpdateDerefContext: (context) => {
      derefContext = context;
    },
  });

  while (true) {
    const activePageHandlers = pageHandlers.filter((handler) => {
      return handler.conditions.every((c) => c({ url: document.URL }));
    });

    let navContext: NavContext | null = null;
    for (const handler of activePageHandlers) {
      const handlerNavContext =
        (await handler.navContextUpdater?.(derefContext.navContext)) ?? null;
      if (handlerNavContext) {
        navContext = handlerNavContext;
        break;
      }
    }

    if (navContext !== derefContext.navContext) {
      updateDerefContext({ navContext });
    }

    await Promise.all(
      activePageHandlers.map(async (handler) => handler.handler(derefContext)),
    );
    await asyncSleep(1000);
  }
};

void main();
