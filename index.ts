import { pageHandlers } from './page-handlers';
import { doPageHandler } from './page-handlers/common';
import initContentScript from '~/init-content-script';
import webextensionApi from '~/lib/extension-api/webextension-api';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  let derefContext = await initContentScript(webextensionApi, (context) => {
    derefContext = context;
  });

  while (true) {
    await Promise.all(
      pageHandlers.map((handler) => doPageHandler(handler, derefContext)),
    );
    await asyncSleep(1000);
  }
};

void main();
