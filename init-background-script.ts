import { ExtensionApi } from '~/lib/extension-api/api';
import { Auth0Client, User } from '@auth0/auth0-spa-js';
import { AuthenticatedUser } from '~/lib/extension-api/messages';
import { arnToUrl } from '~/lib/navigation';

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

  extensionApi.omnibox.setDefaultSuggestion({
    description: 'Enter an ARN',
  });

  extensionApi.omnibox.onInputEntered.addListener((text, disposition) => {
    if (!text.startsWith('arn:')) {
      return;
    }
    const url = arnToUrl(text);
    if (!url) {
      // TODO: Somehow report failure to the user.
      return;
    }
    switch (disposition) {
      case 'currentTab':
        extensionApi.tabs.update({ url });
        break;
      case 'newForegroundTab':
        extensionApi.tabs.create({ url });
        break;
      case 'newBackgroundTab':
        extensionApi.tabs.create({ url, active: false });
        break;
    }
  });
};

export default initBackgroundScript;
