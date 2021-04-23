import { doWarn } from '~/logging';
import { DerefContext } from '~/page-handlers/messages';
import {
  doPageHandler,
  makeDerefContainer,
  PageHandler,
  urlMatchesRegex,
} from './common';
import { browser } from 'webextension-polyfill-ts';

const getNavHeader = (): HTMLElement | null => {
  return document.getElementById('awsc-nav-header');
};

const getDerefContainer = async (
  context: DerefContext,
): Promise<HTMLIFrameElement> => {
  const buttonId = 'deref-button';
  const navHeader = getNavHeader();
  if (!navHeader) {
    throw new Error('Nav header not found');
  }
  const existingButton = navHeader.ownerDocument.getElementById(buttonId);
  if (existingButton) {
    if (!(existingButton instanceof HTMLIFrameElement)) {
      throw new Error('Expected element is not an iframe');
    }
    return existingButton;
  }

  const button = makeDerefContainer(buttonId, context);
  button.src = browser.runtime.getURL('./assets/deref-button.html');
  button.style.height = '36px';
  button.style.width = '60px';
  button.style.display = 'block';
  navHeader.append(button);
  return button;
};

export const derefButton: PageHandler = {
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
