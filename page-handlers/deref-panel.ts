import { doWarn } from '~/logging';
import {
  doPageHandler,
  makeDerefContainer,
  PageHandler,
  urlMatchesRegex,
} from './common';
import { browser } from 'webextension-polyfill-ts';
import { DerefContext } from '~/page-handlers/messages';

const getDerefContainer = async (
  context: DerefContext,
): Promise<HTMLIFrameElement> => {
  const panelId = 'deref-panel';
  const existingPanel = document.getElementById(panelId);
  if (existingPanel) {
    if (!(existingPanel instanceof HTMLIFrameElement)) {
      throw new Error('Expected element is not an iframe');
    }
    return existingPanel;
  }

  const panel = makeDerefContainer(panelId, context);
  panel.src = browser.runtime.getURL('./assets/deref-panel.html');
  panel.style.position = 'fixed';
  panel.style.top = '41px';
  panel.style.right = '0';
  panel.style.width = '200px';
  panel.style.height = '100px';
  panel.style.zIndex = '100';
  panel.style.display = 'none';

  document.body.append(panel);
  return panel;
};

export const derefPanel: PageHandler = {
  conditions: [urlMatchesRegex(/.*console.aws.amazon.com/)],
  async handler(context) {
    const derefContainer = await getDerefContainer(context);
    derefContainer.onload = () => doPageHandler(this, context);
    if (!derefContainer.contentWindow) {
      doWarn('Deref container has no contentWindow');
      return;
    }
  },
};
