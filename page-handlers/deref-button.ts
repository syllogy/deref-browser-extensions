import { doWarn } from '~/logging';
import { postMessageToIframe } from '~/page-handlers/messages';
import {
  IndexSearch,
  isIndexSearch,
  UnvalidatedIndexSearch,
} from '~/price-indexer/index-key';
import {
  doPageHandler,
  getHourlyPrice,
  getRegion,
  InstanceInfo,
  makeDerefContainer,
  mapTenancyString,
  PageHandler,
  urlMatchesRegex,
} from './common';
import { browser } from 'webextension-polyfill-ts';

const getNavHeader = (): HTMLElement | null => {
  return document.getElementById('awsc-nav-header');
};

const getDerefContainer = async (): Promise<HTMLIFrameElement> => {
  const buttonId = 'deref-button';
  const navHeader = getNavHeader();
  if (!navHeader) {
    throw new Error('Nav header not found');
  }
  const existingButton = navHeader.ownerDocument.getElementById(
    buttonId
  );
  if (existingButton) {
    if (!(existingButton instanceof HTMLIFrameElement)) {
      throw new Error('Expected element is not an iframe');
    }
    return existingButton;
  }

  const button = makeDerefContainer(buttonId);
  button.src = browser.runtime.getURL('./assets/deref-button.html');
  button.style.height = '36px';
  button.style.width = '60px';
  button.style.display = 'block';
  navHeader.append(button);
  return button;
};

export const derefButton: PageHandler = {
  conditions: [
    urlMatchesRegex(/.*console.aws.amazon.com/),
  ],
  async handler() {
    const derefContainer = await getDerefContainer();
    derefContainer.onload = () => doPageHandler(this);
    if (!derefContainer.contentWindow) {
      doWarn('Deref container has no contentWindow');
      return;
    }
  },
};
