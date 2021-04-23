import { doWarn } from '~/logging';

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

export const postMessageFromIframe = (msg: DerefMessage) => {
  window.parent.postMessage(makeDerefMessage(msg), '*');
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

export interface DerefContext {}

export interface BaseMessage<TPayload> {
  isDerefMessage?: true;
  payload: TPayload;
}

export type MessagePayloadOf<
  TMessage extends BaseMessage<any>
> = TMessage extends BaseMessage<infer TPayload> ? TPayload : never;

export interface InitMessage extends BaseMessage<DerefContext> {
  type: 'init';
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

export type DerefMessage =
  | InitMessage
  | PriceMessage
  | TogglePanelMessage
  | LoginMessage;

const makeDerefMessage = (msg: DerefMessage): DerefMessage => {
  return { isDerefMessage: true, ...msg };
};

export const isDerefMessage = (msg: unknown): msg is DerefMessage => {
  return !!(msg as DerefMessage)?.isDerefMessage;
};
