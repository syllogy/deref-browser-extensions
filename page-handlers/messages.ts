import { doWarn } from '~/logging';
import { findDerefContainers } from '~/page-handlers/utils';
import { AuthenticatedUser } from '~/lib/extension-api/messages';
import { useEffect, useState } from 'react';

export interface BaseNavContext<TData> {
  data: TData;
}

export interface Ec2InstanceNavContext
  extends BaseNavContext<{
    instanceId: string;
    tab?: 'info' | 'price' | 'notes';
  }> {
  type: 'ec2Instance';
}

export type NavContext = Ec2InstanceNavContext;

export type NavContextType<
  TNavContext extends NavContext
> = TNavContext['type'];

export interface DerefContext {
  user: AuthenticatedUser | null;
  panelState: {
    expanded: boolean;
    visible: boolean;
  };
  navContext: NavContext | null;
}

export interface BaseMessage<TPayload> {
  isDerefMessage?: true;
  payload: TPayload;
}

export interface InitMessage extends BaseMessage<DerefContext> {
  type: 'init';
}

export interface TokenMessage extends BaseMessage<{ token: string }> {
  type: 'token';
}

export interface PriceMessage
  extends BaseMessage<{
    type: string;
    hourlyCost: number;
    lastUpdated: null | { at: Date; by: string };
  }> {
  type: 'price';
}

export interface TogglePanelMessage
  extends BaseMessage<{
    show?: boolean;
  }> {
  type: 'togglePanel';
}

export interface TogglePanelExpandMessage
  extends BaseMessage<{
    expand?: boolean;
  }> {
  type: 'togglePanelExpand';
}

export interface UpdateNavContextMessage
  extends BaseMessage<{
    navContext: NavContext | null;
  }> {
  type: 'updateNavContext';
}

export interface LoginMessage extends BaseMessage<void> {
  type: 'login';
}

export interface LogoutMessage extends BaseMessage<void> {
  type: 'logout';
}

export type DerefMessage =
  | InitMessage
  | PriceMessage
  | TogglePanelMessage
  | TogglePanelExpandMessage
  | UpdateNavContextMessage
  | LoginMessage
  | LogoutMessage
  | TokenMessage;

export type DerefMessageType<TMessage extends DerefMessage> = TMessage['type'];

export type DerefMessagePayloadOf<
  TMessage extends DerefMessage,
  TType extends DerefMessageType<TMessage> = any
> = TMessage extends BaseMessage<infer TPayload> & {
  type: TType;
}
  ? TPayload
  : never;

export const makeDerefMessage = (msg: DerefMessage): DerefMessage => {
  return { isDerefMessage: true, ...msg };
};

export const isDerefMessage = (msg: unknown): msg is DerefMessage => {
  return !!(msg as DerefMessage)?.isDerefMessage;
};

export const postMessageToIframe = (
  iframe: HTMLIFrameElement,
  msg: DerefMessage,
) => {
  if (!iframe.contentWindow) {
    doWarn('IFrame has no content window');
    return;
  }
  iframe.contentWindow.postMessage(makeDerefMessage(msg), '*');
};

export const postDerefMessage = (msg: DerefMessage) => {
  if (window.parent) {
    window.parent.postMessage(makeDerefMessage(msg), '*');
  } else {
    window.postMessage(msg, '*');
  }
};

export const broadcastMessageToIframes = (msg: DerefMessage) => {
  findDerefContainers(document).forEach((iframe) =>
    postMessageToIframe(iframe, msg),
  );
};

export const addWindowMessageListener = (
  window: Window,
  handler: (msg: DerefMessage) => void,
): (() => void) => {
  const listener = (event: MessageEvent) => {
    if (isDerefMessage(event.data)) {
      handler(event.data);
    }
  };

  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
  };
};

export const useWindowMessageListener = <
  TMessage extends DerefMessage,
  TType extends DerefMessageType<TMessage>
>(
  type: TType,
) => {
  const [payload, setPayload] = useState<DerefMessagePayloadOf<
    TMessage,
    TType
  > | null>(null);
  useEffect(() => {
    return addWindowMessageListener(window, (msg) => {
      if (msg.type === type) {
        setPayload(msg.payload as DerefMessagePayloadOf<TMessage, TType>);
      }
    });
  }, []);

  return payload;
};
