import {
  addWindowMessageListener,
  DerefContext,
  broadcastMessageToIframes,
} from '~/page-handlers/messages';
import { findDerefContainerForRoute } from '~/page-handlers/utils';
import { ExtensionApi } from '~/lib/extension-api/api';
import { PANEL_SETTINGS } from '~/components/routes';
import { isDefined } from '~/lib/types';

const initContentScript = async (
  extensionApi: ExtensionApi,
  onContextUpdate: (context: DerefContext) => void,
): Promise<DerefContext> => {
  const user = await extensionApi.sendMessage('init', undefined);

  let derefContext: DerefContext = {
    user,
    panelState: {
      expanded: false,
      visible: true,
    },
    navContext: null,
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
        updateContext({
          panelState: {
            ...derefContext.panelState,
            visible: isDefined(msg.payload.show)
              ? msg.payload.show
              : !derefContext.panelState.visible,
          },
        });
        const panel = findDerefContainerForRoute('panel');
        if (panel) {
          panel.style.display = derefContext.panelState.visible
            ? 'block'
            : 'none';
        }
        break;
      }
      case 'togglePanelExpand': {
        updateContext({
          panelState: {
            ...derefContext.panelState,
            expanded: isDefined(msg.payload.expand)
              ? msg.payload.expand
              : !derefContext.panelState.expanded,
          },
        });
        const panel = findDerefContainerForRoute('panel');
        if (panel) {
          panel.style.height = derefContext.panelState.expanded
            ? `calc(100vh - ${PANEL_SETTINGS.offsetTop}px)`
            : `${PANEL_SETTINGS.foldedHeight}px`;
        }
        break;
      }
      case 'updateNavContext': {
        updateContext({
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
