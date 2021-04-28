import { ExtensionApi } from '~/lib/extension-api/api';
import { Auth0Client, User } from '@auth0/auth0-spa-js';
import { AuthenticatedUser } from '~/lib/extension-api/messages';
import { browser, WebRequest } from 'webextension-polyfill-ts';
import { doWarn } from '~/logging';

interface InitBackgroundScriptConfig {
  extensionApi: ExtensionApi;
  auth0: () => Promise<Auth0Client>;
  login: (auth0: Auth0Client) => Promise<void>;
  logout: (auth0: Auth0Client) => Promise<void>;
}

const initBackgroundScript = ({
  extensionApi,
  ...config
}: InitBackgroundScriptConfig) => {
  let auth0: Auth0Client | null = null;
  const getAuth0 = async (): Promise<Auth0Client> => {
    return auth0 ?? config.auth0();
  };

  const getAuthenticatedUser = (
    auth0User: User | undefined,
  ): AuthenticatedUser | null => {
    return (auth0User as AuthenticatedUser) ?? null;
  };

  extensionApi.addListener('init', async (payload) => {
    auth0 = await getAuth0();
    const auth0User = await auth0.getUser();
    return getAuthenticatedUser(auth0User);
  });

  extensionApi.addListener('login', async (payload) => {
    const auth0 = await getAuth0();
    await config.login(auth0);
    const auth0User = await auth0.getUser();
    return getAuthenticatedUser(auth0User);
  });

  extensionApi.addListener('logout', async (payload) => {
    const auth0 = await getAuth0();
    await config.logout(auth0);
  });

  extensionApi.addListener(
    'frameOptionsException',
    async (_payload, context) => {
      const tabId = context?.tabId;
      if (!tabId) {
        doWarn('No tab ID set');
        return;
      }

      const isFirefox = (window as any).browser && browser.runtime;

      const listener = (info: WebRequest.OnHeadersReceivedDetailsType) => {
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
      };

      // FIXME: This completely removes security for the AWS console. It needs to
      // be scoped to the specific tab and probably to a specific request.
      browser.webRequest.onHeadersReceived.addListener(
        listener,
        { urls: ['*://*.aws.amazon.com/*'], types: ['sub_frame'], tabId },

        // Modern Chrome needs "extraHeaders" to access these headers but Firefox
        // forbids it.
        isFirefox
          ? ['blocking', 'responseHeaders']
          : ['blocking', 'responseHeaders', 'extraHeaders'],
      );
    },
  );
};

export default initBackgroundScript;
