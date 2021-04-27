import { browser } from 'webextension-polyfill-ts';
import createAuth0Client, { Auth0Client, User } from '@auth0/auth0-spa-js';
import {
  addExtensionMessageListener,
  AuthenticatedUser,
} from '~/extension-messages';

const initAuth0 = async (): Promise<Auth0Client> => {
  return createAuth0Client({
    domain: 'deref-extension.us.auth0.com',
    client_id: 'Kfo7nyY4PXggtS4r3vFOiaJnAAO0A2pP',
    redirect_uri: browser.identity.getRedirectURL(),
    scope: 'email',
    cacheLocation: 'localstorage',
  });
};

let auth0: Auth0Client | null = null;
const getAuth0 = async (): Promise<Auth0Client> => {
  return auth0 ?? initAuth0();
};

const getAuthenticatedUser = (
  auth0User: User | undefined,
): AuthenticatedUser | null => {
  return (auth0User as AuthenticatedUser) ?? null;
};

addExtensionMessageListener('init', async (payload) => {
  auth0 = await getAuth0();
  const auth0User = await auth0.getUser();
  return getAuthenticatedUser(auth0User);
});

addExtensionMessageListener('login', async (payload) => {
  const auth0 = await getAuth0();
  const authorizeUrl = await auth0.buildAuthorizeUrl();
  const callbackUrl = await browser.identity.launchWebAuthFlow({
    url: authorizeUrl,
    interactive: true,
  });
  await auth0.handleRedirectCallback(callbackUrl);
  const auth0User = await auth0.getUser();
  return getAuthenticatedUser(auth0User);
});

addExtensionMessageListener('logout', async (payload) => {
  const auth0 = await getAuth0();
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
});
