import {
  addWindowMessageListener,
  DerefContext,
  broadcastMessageToIframes,
} from '~/page-handlers/messages';
import { findDerefContainerForRoute } from '~/page-handlers/utils';
import { ExtensionApi } from '~/lib/extension-api/api';

const initContentScript = async (
  extensionApi: ExtensionApi,
  onContextUpdate: (context: DerefContext) => void,
): Promise<DerefContext> => {
  const user = await extensionApi.sendMessage('init', undefined);

  let derefContext: DerefContext = {
    user,
  };

  const updateContext = (context: Partial<DerefContext>) => {
    derefContext = {
      ...derefContext,
      ...context,
    };

    broadcastMessageToIframes({ type: 'init', payload: derefContext });

    onContextUpdate(derefContext);
  };

  addWindowMessageListener(window, (msg) => {
    switch (msg.type) {
      case 'togglePanel': {
        const panel = findDerefContainerForRoute('panel');
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
        void (async () => {
          const user = await extensionApi.sendMessage('login', undefined);
          updateContext({ user });
        })();
        break;
      }
      case 'logout': {
        void (async () => {
          await extensionApi.sendMessage('logout', undefined);
          updateContext({ user: null });
        })();
        break;
      }
      default: {
        broadcastMessageToIframes(msg);
        break;
      }
    }
  });

  return derefContext;
};

export default initContentScript;
