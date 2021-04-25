import { doWarn } from '~/logging';
import { AuthenticatedUser } from '~/extension-messages';

export interface DerefContext {
  user: AuthenticatedUser | null;
}

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

export interface LogoutMessage extends BaseMessage<void> {
  type: 'logout';
}

export type DerefMessage =
  | InitMessage
  | PriceMessage
  | TogglePanelMessage
  | LoginMessage
  | LogoutMessage;

const makeDerefMessage = (msg: DerefMessage): DerefMessage => {
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

export const broadcastMessageToIframes = (msg: DerefMessage) => {
  findDerefContainers(document).forEach((iframe) =>
    postMessageToIframe(iframe, msg),
  );
};

const findDerefContainers = (
  document: Document | null,
  depth: number = 2,
): HTMLIFrameElement[] => {
  if (!document || depth === 0) {
    return [];
  }
  const iframes: HTMLIFrameElement[] = [];
  document.querySelectorAll('iframe').forEach((iframe) => {
    if (iframe.className === 'deref-container') {
      iframes.push(iframe);
    } else {
      iframes.push(...findDerefContainers(iframe.contentDocument, depth - 1));
    }
  });
  return iframes;
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
