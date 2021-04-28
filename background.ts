import { browser } from 'webextension-polyfill-ts';
import initBackgroundScript from '~/init-background-script';
import webextensionApi from '~/lib/extension-api/webextension-api';
import createAuth0Client from '@auth0/auth0-spa-js';
import { doWarn } from '~/logging';

initBackgroundScript({
  extensionApi: webextensionApi,
  auth0: () => {
    return createAuth0Client({
      domain: 'deref-extension.us.auth0.com',
      client_id: 'Kfo7nyY4PXggtS4r3vFOiaJnAAO0A2pP',
      scope: 'email',
      cacheLocation: 'localstorage',
      redirect_uri: browser.identity.getRedirectURL(),
    });
  },
  login: async (auth0) => {
    const authorizeUrl = await auth0.buildAuthorizeUrl();
    const callbackUrl = await browser.identity.launchWebAuthFlow({
      url: authorizeUrl,
      interactive: true,
    });
    await auth0.handleRedirectCallback(callbackUrl);
  },
  logout: async (auth0) => {
    const logoutUrl = auth0.buildLogoutUrl({
      // Any allowed returnTo works.
      returnTo: 'https://deref.io',
    });
    auth0.logout({ localOnly: true });

    // Have to logout in the same scope as login, but this will cause a new login window to open unless interactive =
    // false and we catch the exception.
    try {
      await browser.identity.launchWebAuthFlow({
        url: logoutUrl,
        interactive: false,
      });
    } catch (e: unknown) {
      // Ignore.
    }
  },
});

const isFirefox = (window as any).browser && browser.runtime;

// FIXME: This completely removes security for the AWS console. It needs to
// be scoped to the specific tab and probably to a specific request.
browser.webRequest.onHeadersReceived.addListener(
  (info) => {
    const headers = info.responseHeaders;
    if (!headers) {
      doWarn('No headers in response');
      return info;
    }

    for (let i = headers.length - 1; i >= 0; --i) {
      const header = headers[i].name.toLowerCase();
      if (header == 'x-frame-options' || header == 'frame-options') {
        headers.splice(i, 1); // Remove header.
      }
    }
    return { responseHeaders: headers };
  },
  { urls: ['*://*.aws.amazon.com/*'] },

  // Modern Chrome needs "extraHeaders" to access these headers but Firefox
  // forbids it.
  isFirefox
    ? ['blocking', 'responseHeaders']
    : ['blocking', 'responseHeaders', 'extraHeaders'],
);
