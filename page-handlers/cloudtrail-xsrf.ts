import { doWarn } from '~/logging';
import { isIframe, PageHandler, urlMatchesRegex } from '~/page-handlers/common';
import { makeDerefMessage } from '~/page-handlers/messages';

export const cloudTrailXsrf: PageHandler = {
  conditions: [
    isIframe,
    urlMatchesRegex(/.*console.aws.amazon.com\/cloudtrail\/.*/),
  ],
  async handler() {
    const preloadElement = document.getElementById('preload');
    if (!preloadElement) {
      doWarn('No preloadElement found');
      return;
    }
    const val = preloadElement.getAttribute('data-xsrf-token');
    if (!val) {
      doWarn('No XSRF attribute found');
      return;
    }

    const { token }: { token: string | undefined } = JSON.parse(val);
    if (!token) {
      doWarn('No token in XSRF attribute');
      return;
    }

    window.top.postMessage(
      makeDerefMessage({ payload: { token }, type: 'token' }),
      '*',
    );
  },
};
