import { ExtensionApi } from '~/lib/extension-api/api';
import { Auth0Client } from '@auth0/auth0-spa-js';
import { AuthenticatedUser } from '~/lib/extension-api/messages';
import { initOmnibox } from '~/lib/omnibox';

// TODO: Tokens do not currently expire, but when we introduce expirations, the check will go here.
const isTokenExpired = (apiToken: string) => false;

const localStorageTokenKey = 'deref:api-token';
const getApiToken = async (
  auth0: Auth0Client,
  auth0UserId: string,
): Promise<string | null> => {
  const cachedToken = localStorage.getItem(localStorageTokenKey);
  if (cachedToken !== null && !isTokenExpired(cachedToken)) {
    return cachedToken;
  }

  const accessToken = await auth0.getTokenSilently();
  const loginRes = await fetch('https://extension.deref.io/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken,
      // XXX: For now, a user is its own tenant. We should use another mechanism for determining tenant.
      tenantId: auth0UserId,
    }),
  });
  if (loginRes.status > 299) {
    return null;
  }

  const { token } = await loginRes.json();
  localStorage.setItem(localStorageTokenKey, token);

  return token;
};

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

  const getAuthenticatedUser = async (
    auth0: Auth0Client,
  ): Promise<AuthenticatedUser | null> => {
    const auth0User = await auth0.getUser();
    if (
      auth0User === undefined ||
      auth0User.email === undefined ||
      auth0User.sub === undefined
    ) {
      return null;
    }

    const apiToken = await getApiToken(auth0, auth0User.sub);
    if (apiToken === null) {
      return null;
    }

    return {
      email: auth0User.email,
      apiToken,
    };
  };

  const logout = async (auth0: Auth0Client): Promise<void> => {
    localStorage.removeItem(localStorageTokenKey);
    await config.logout(auth0);
  };

  extensionApi.addListener('init', async payload => {
    auth0 = await getAuth0();
    return await getAuthenticatedUser(auth0);
  });

  extensionApi.addListener('login', async payload => {
    const auth0 = await getAuth0();
    await config.login(auth0);
    return await getAuthenticatedUser(auth0);
  });

  extensionApi.addListener('logout', async payload => {
    const auth0 = await getAuth0();
    await logout(auth0);
  });

  initOmnibox(extensionApi);
};

export default initBackgroundScript;
