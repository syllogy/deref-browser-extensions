import { pageHandlers } from './page-handlers';
import { doPageHandler } from './page-handlers/common';
import {
  addWindowMessageListener,
  DerefContext,
  broadcastMessageToIframes,
} from '~/page-handlers/messages';
import { sendExtensionMessage } from '~/extension-messages';

const asyncSleep = (timeMilliseconds: number): Promise<void> =>
  new Promise((r) => setTimeout(r, timeMilliseconds));

const main = async () => {
  const user = await sendExtensionMessage('init', undefined);

  let derefContext: DerefContext = {
    user,
  };

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
        if (derefContext.user) {
          throw new Error('User already set');
        }
        (async () => {
          const user = await sendExtensionMessage('login', undefined);
          derefContext = {
            ...derefContext,
            user,
          };
          broadcastMessageToIframes({ type: 'init', payload: derefContext });
        })();
        break;
      }
      case 'logout': {
        (async () => {
          await sendExtensionMessage('logout', undefined);
          derefContext = {
            ...derefContext,
            user: null,
          };
          broadcastMessageToIframes({ type: 'init', payload: derefContext });
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

void main();
