import { browser } from 'webextension-polyfill-ts';
import initBackgroundScript from '~/init-background-script';
import webextensionApi from '~/lib/extension-api/webextension-api';
import createAuth0Client from '@auth0/auth0-spa-js';

initBackgroundScript({
  extensionApi: webextensionApi,
  auth0: () => {
    return createAuth0Client({
      domain: 'deref.us.auth0.com',
      client_id: '9KLuebquJDhIPzm1qFwULoyGVr2g01z2',
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
