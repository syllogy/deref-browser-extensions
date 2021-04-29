import React, { useState, useEffect } from 'react';
import Iframe from '~/playground/components/Iframe';
import { getRouteKeys } from '~/components/routes';
import MessagePoster from '~/playground/components/MessagePoster';
import { DerefContext, useWindowMessageListener } from '~/page-handlers/messages';
import initBackgroundScript from '~/init-background-script';
import mockextensionApi from '~/lib/extension-api/mockextension-api';
import createAuth0Client from '@auth0/auth0-spa-js';
import initContentScript from '~/init-content-script';
import { useApolloClient } from '~/page-handlers/api';
import { MyNotesDocument } from '~/graphql/types';

const playgroundUrl = 'http://localhost:3000';

initBackgroundScript({
  extensionApi: mockextensionApi,
  auth0: async () => {
    const auth0 = await createAuth0Client({
      domain: 'deref.us.auth0.com',
      client_id: '9KLuebquJDhIPzm1qFwULoyGVr2g01z2',
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


export default function Playground() {
  const [derefContext, setDerefContext] = useState<DerefContext>();

  useEffect(() => {
    void (async () => {
      const { derefContext } = await initContentScript({
        extensionApi: mockextensionApi,
        onUpdateDerefContext: (derefContext) => {
          setDerefContext(derefContext);
        },
      });
      setDerefContext(derefContext);
    })();
  }, []);

  if (!derefContext) {
    return null;
  }

  return (
    <div>
      <h1>Playground</h1>

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ borderRight: '1px solid gray', width: 200 }}>
          <MessagePoster />
        </div>
        <div style={{ flexGrow: 1 }}>
          {getRouteKeys().map((k) => (
            <div key={k}>
              <Iframe routeKey={k} derefContext={derefContext} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
