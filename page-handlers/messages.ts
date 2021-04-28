import { doWarn } from '~/logging';
import { findDerefContainers } from '~/page-handlers/utils';
import { AuthenticatedUser } from '~/lib/extension-api/messages';

export interface DerefContext {
  user: AuthenticatedUser | null;
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
  }> {
  type: 'price';
}

export interface TogglePanelMessage extends BaseMessage<void> {
  type: 'togglePanel';
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
  | LoginMessage
  | LogoutMessage
  | TokenMessage;

export type DerefMessagePayloadOf<
  TMessage extends DerefMessage
> = TMessage extends BaseMessage<infer TPayload> ? TPayload : never;

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
) => {
  window.addEventListener('message', (event) => {
    if (isDerefMessage(event.data)) {
      handler(event.data);
    }
  });
};
