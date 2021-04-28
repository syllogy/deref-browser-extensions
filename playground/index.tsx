import React from 'react';
import ReactDOM from 'react-dom';
import Playground from '~/playground/components/Playground';
import initContentScript from '~/init-content-script';
import mockextensionApi from '~/lib/extension-api/mockextension-api';
import initBackgroundScript from '~/init-background-script';
import createAuth0Client from '@auth0/auth0-spa-js';
import '../main.css';

import StylingPlayground from '~/playground/components/StylingPlayground';

const playgroundUrl = 'http://localhost:3000';

void initContentScript(mockextensionApi, () => {
  //
});

initBackgroundScript({
  extensionApi: mockextensionApi,
  auth0: async () => {
    const auth0 = await createAuth0Client({
      domain: 'deref-extension.us.auth0.com',
      client_id: 'Kfo7nyY4PXggtS4r3vFOiaJnAAO0A2pP',
      scope: 'email',
      cacheLocation: 'localstorage',
      redirect_uri: playgroundUrl,
    });
    try {
      await auth0.handleRedirectCallback();
    } catch (_ignored: unknown) {
      // Ignore.
    }
    return auth0;
  },
  login: async (auth0) => {
    await auth0.loginWithPopup();
  },
  logout: async (auth0) => {
    auth0.logout({
      returnTo: playgroundUrl,
    });
  },
});

ReactDOM.render(
  <React.StrictMode>
    {/*<Playground />*/}
    <StylingPlayground />
  </React.StrictMode>,
  document.getElementById('root'),
);
