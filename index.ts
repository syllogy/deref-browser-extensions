import { pageHandlers } from './page-handlers';
import { doPageHandler } from './page-handlers/common';
import {
  addWindowMessageListener,
  DerefContext,
} from '~/page-handlers/messages';
import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  const auth0 = await initAuth0();
  const user = await auth0.getUser();
  console.log('USER', user);

  const derefContext: DerefContext = {};

  let derefPanel: HTMLIFrameElement | null = null;
  const findDerefPanel = () => {
    const panel = document.getElementById('deref-panel');
    if (panel instanceof HTMLIFrameElement) {
      derefPanel = panel;
    }
    return derefPanel;
  };

  addWindowMessageListener(window, (msg) => {
    switch (msg.type) {
      case 'togglePanel': {
        const panel = findDerefPanel();
        if (panel) {
          panel.style.display =
            panel.style.display === 'block' ? 'none' : 'block';
        }
        break;
      }
      case 'login': {
        console.log('LOGIN!');
        (async () => {
          try {
            await auth0.loginWithPopup({});
          } catch (e: unknown) {
            console.error(e);
          }
          console.log('LOGIN DONE WITH USER', await auth0.getUser());
        })();
      }
    }
  });

  while (true) {
    await Promise.all(
      pageHandlers.map((handler) => doPageHandler(handler, derefContext)),
    );
    await asyncSleep(1000);
  }
};

const initAuth0 = async (): Promise<Auth0Client> => {
  return createAuth0Client({
    domain: 'deref-extension.us.auth0.com',
    client_id: 'Kfo7nyY4PXggtS4r3vFOiaJnAAO0A2pP',
    redirect_uri: 'https://us-west-2.console.aws.amazon.com',
    scope: 'email',
  });
};

void main();
