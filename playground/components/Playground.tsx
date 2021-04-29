import React, { useState, useEffect } from 'react';
import Iframe from '~/playground/components/Iframe';
import { getRouteKeys } from '~/components/routes';
import MessagePoster from '~/playground/components/MessagePoster';
import { DerefContext } from '~/page-handlers/messages';
import initBackgroundScript from '~/init-background-script';
import mockextensionApi from '~/lib/extension-api/mockextension-api';
import createAuth0Client from '@auth0/auth0-spa-js';
import initContentScript from '~/init-content-script';
import DerefButton from '~/components/DerefButton';

const playgroundUrl = 'http://localhost:3000';

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
      <div
        style={{
          background: '#232f3e',
          height: 41,
        }}
      >
        <div className="float-left flex h-full items-center ml-9 pb-0.5">
          <svg width={36} height={20} viewBox="0 0 29 17" focusable="false">
            <g fill="none" fill-rule="evenodd">
              <path
                fill="#ffffff"
                fill-rule="nonzero"
                d="M8.38 6.17a2.6 2.6 0 00.11.83c.08.232.18.456.3.67a.4.4 0 01.07.21.36.36 0 01-.18.28l-.59.39a.43.43 0 01-.24.08.38.38 0 01-.28-.13 2.38 2.38 0 01-.34-.43c-.09-.16-.18-.34-.28-.55a3.44 3.44 0 01-2.74 1.29 2.54 2.54 0 01-1.86-.67 2.36 2.36 0 01-.68-1.79 2.43 2.43 0 01.84-1.92 3.43 3.43 0 012.29-.72 6.75 6.75 0 011 .07c.35.05.7.12 1.07.2V3.3a2.06 2.06 0 00-.44-1.49 2.12 2.12 0 00-1.52-.43 4.4 4.4 0 00-1 .12 6.85 6.85 0 00-1 .32l-.33.12h-.14c-.14 0-.2-.1-.2-.29v-.46A.62.62 0 012.3.87a.78.78 0 01.27-.2A6 6 0 013.74.25 5.7 5.7 0 015.19.07a3.37 3.37 0 012.44.76 3 3 0 01.77 2.29l-.02 3.05zM4.6 7.59a3 3 0 001-.17 2 2 0 00.88-.6 1.36 1.36 0 00.32-.59 3.18 3.18 0 00.09-.81V5A7.52 7.52 0 006 4.87h-.88a2.13 2.13 0 00-1.38.37 1.3 1.3 0 00-.46 1.08 1.3 1.3 0 00.34 1c.278.216.63.313.98.27zm7.49 1a.56.56 0 01-.36-.09.73.73 0 01-.2-.37L9.35.93a1.39 1.39 0 01-.08-.38c0-.15.07-.23.22-.23h.92a.56.56 0 01.36.09.74.74 0 01.19.37L12.53 7 14 .79a.61.61 0 01.18-.37.59.59 0 01.37-.09h.75a.62.62 0 01.38.09.74.74 0 01.18.37L17.31 7 18.92.76a.74.74 0 01.19-.37.56.56 0 01.36-.09h.87a.21.21 0 01.23.23 1 1 0 010 .15s0 .13-.06.23l-2.26 7.2a.74.74 0 01-.19.37.6.6 0 01-.36.09h-.8a.53.53 0 01-.37-.1.64.64 0 01-.18-.37l-1.45-6-1.44 6a.64.64 0 01-.18.37.55.55 0 01-.37.1l-.82.02zm12 .24a6.29 6.29 0 01-1.44-.16 4.21 4.21 0 01-1.07-.37.69.69 0 01-.29-.26.66.66 0 01-.06-.27V7.3c0-.19.07-.29.21-.29a.57.57 0 01.18 0l.23.1c.32.143.656.25 1 .32.365.08.737.12 1.11.12a2.47 2.47 0 001.36-.31 1 1 0 00.48-.88.88.88 0 00-.25-.65 2.29 2.29 0 00-.94-.49l-1.35-.43a2.83 2.83 0 01-1.49-.94 2.24 2.24 0 01-.47-1.36 2 2 0 01.25-1c.167-.3.395-.563.67-.77a3 3 0 011-.48A4.1 4.1 0 0124.4.08a4.4 4.4 0 01.62 0l.61.1.53.15.39.16c.105.062.2.14.28.23a.57.57 0 01.08.31v.44c0 .2-.07.3-.21.3a.92.92 0 01-.36-.12 4.35 4.35 0 00-1.8-.36 2.51 2.51 0 00-1.24.26.92.92 0 00-.44.84c0 .249.1.488.28.66.295.236.635.41 1 .51l1.32.42a2.88 2.88 0 011.44.9 2.1 2.1 0 01.43 1.31 2.38 2.38 0 01-.24 1.08 2.34 2.34 0 01-.68.82 3 3 0 01-1 .53 4.59 4.59 0 01-1.35.22l.03-.01z"
              ></path>
              <path
                fill="#f8991d"
                d="M25.82 13.43a20.07 20.07 0 01-11.35 3.47A20.54 20.54 0 01.61 11.62c-.29-.26 0-.62.32-.42a27.81 27.81 0 0013.86 3.68 27.54 27.54 0 0010.58-2.16c.52-.22.96.34.45.71z"
              ></path>
              <path
                fill="#f8991d"
                d="M27.1 12c-.4-.51-2.6-.24-3.59-.12-.3 0-.34-.23-.07-.42 1.75-1.23 4.63-.88 5-.46.37.42-.09 3.3-1.74 4.68-.25.21-.49.09-.38-.18.34-.95 1.17-3.02.78-3.5z"
              ></path>
            </g>
          </svg>
        </div>
        <div className="float-right">
          <DerefButton derefContext={derefContext} />
        </div>
      </div>
      <h1 className="text-lg font-semibold">Playground</h1>

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
      <div
        style={{
          background: '#232f3e',
          height: 35,
          width: '100%',
          bottom: 0,
          position: 'absolute',
        }}
      />
    </div>
  );
}
