import { pageHandlers } from './page-handlers';
import initContentScript from '~/init-content-script';
import webextensionApi from '~/lib/extension-api/webextension-api';
import { NavContext } from '~/page-handlers/messages';
import { Linkifier } from './linkify';
import { arnToWebUrl } from '@deref/arn2web';

interface Result {
  start: number;
  end: number;
  url: string;
  text: string;
}

const matcher = {
  *match(text: string): IterableIterator<Result> {
    let i = 0;
    while (true) {
      const start = text.indexOf('arn:', i);
      if (start === -1) {
        break;
      }
      let end = text.indexOf(' ', start);
      if (end === -1) {
        end = text.length;
      }
      i = end;
      const url = arnToWebUrl(text);
      if (!url) {
        // TODO: Somehow report failure to the user.
        return;
      }
      yield {
        start,
        end,
        text: text.substring(start, end),
        url,
      };
    }
  },
};

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

  const linkifier = new Linkifier(document.body, { matcher: matcher });

  linkifier.on('complete', (elapse) => {
    console.log(`finished in ${elapse}ms`);
  });
  linkifier.on('error', (err) => {
    console.log('failed with error:', err);
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

    linkifier.start();

    await Promise.all(
      activePageHandlers.map(async (handler) => handler.handler(derefContext)),
    );
    await asyncSleep(1000);
  }
};

void main();
