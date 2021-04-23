import { doWarn } from '~/logging';

export const postMessageToIframe = (
  iframe: HTMLIFrameElement,
  type: string,
  payload: unknown,
) => {
  if (!iframe.contentWindow) {
    doWarn('IFrame has no content window');
    return;
  }
  iframe.contentWindow.postMessage(makeDerefMessage(type, payload), '*');
};

export const postMessageFromIframe = (type: string, payload: any) => {
  window.parent.postMessage(makeDerefMessage(type, payload), '*');
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

interface DerefMessage {
  isDerefMessage: boolean;
  type: string;
  payload: unknown;
}

const makeDerefMessage = (type: string, payload: unknown): DerefMessage => {
  return { isDerefMessage: true, type, payload };
};

export const isDerefMessage = (msg: unknown): msg is DerefMessage => {
  return !!(msg as any)?.isDerefMessage;
};
