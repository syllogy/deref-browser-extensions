import {
  addWindowMessageListener,
  DerefContext,
  broadcastMessageToIframes,
} from '~/page-handlers/messages';
import {
  findDerefContainerForRoute,
  applyStyleDeclaration,
} from '~/page-handlers/utils';
import { ExtensionApi } from '~/lib/extension-api/api';
import { isDefined } from '~/lib/types';
import { getRoute } from '~/components/routes';

interface InitContentScriptConfig {
  extensionApi: ExtensionApi;
  onUpdateDerefContext: (context: DerefContext) => void;
}

interface InitContentScriptResult {
  derefContext: DerefContext;
  updateDerefContext: (context: Partial<DerefContext>) => void;
}

const initContentScript = async ({
  extensionApi,
  ...config
}: InitContentScriptConfig): Promise<InitContentScriptResult> => {
  const user = await extensionApi.sendMessage('init', undefined);
  broadcastMessageToIframes({ type: 'updateApiToken', payload: user?.apiToken ?? null });

  let derefContext: DerefContext = {
    user,
    panelState: {
      expanded: false,
      visible: true,
    },
    navContext: null,
  };

  const handleChange = (prev: DerefContext, context: DerefContext) => {
    // Instead of broadcasting an event, would it be better to create a hook that updates state
    // whenever a particular key or path in the context changes?
    if (prev.user?.apiToken !== context.user?.apiToken) {
      broadcastMessageToIframes({ type: 'updateApiToken', payload: context.user?.apiToken ?? null });
    }
  }

  const updateDerefContext = (context: Partial<DerefContext>) => {
    const prevContext = derefContext;
    derefContext = {
      ...derefContext,
      ...context,
    };

    broadcastMessageToIframes({ type: 'init', payload: derefContext });
    handleChange(prevContext, derefContext);

    config.onUpdateDerefContext(derefContext);
  };

  addWindowMessageListener(window, (msg) => {
    switch (msg.type) {
      case 'togglePanel': {
        updateDerefContext({
          panelState: {
            ...derefContext.panelState,
            visible: isDefined(msg.payload.show)
              ? msg.payload.show
              : !derefContext.panelState.visible,
          },
        });
        const panel = findDerefContainerForRoute('panel');
        if (panel) {
          applyStyleDeclaration(panel, getRoute('panel').style(derefContext));
        }
        break;
      }
      case 'togglePanelExpand': {
        updateDerefContext({
          panelState: {
            ...derefContext.panelState,
            expanded: isDefined(msg.payload.expand)
              ? msg.payload.expand
              : !derefContext.panelState.expanded,
          },
        });
        const panel = findDerefContainerForRoute('panel');
        if (panel) {
          applyStyleDeclaration(panel, getRoute('panel').style(derefContext));
        }
        break;
      }
      case 'updateNavContext': {
        updateDerefContext({
          navContext: msg.payload.navContext,
        });
        break;
      }
      case 'login': {
        if (derefContext.user) {
          throw new Error('User already set');
        }
        void (async () => {
          const user = await extensionApi.sendMessage('login', undefined);
          updateDerefContext({ user });
        })();
        break;
      }
      case 'logout': {
        void (async () => {
          await extensionApi.sendMessage('logout', undefined);
          updateDerefContext({ user: null });
        })();
        break;
      }
      default: {
        broadcastMessageToIframes(msg);
        break;
      }
    }
  });

  return {
    derefContext,
    updateDerefContext,
  };
};

export default initContentScript;
