import { doWarn } from '~/logging';

export const postMessageToIframe = (iframe: HTMLIFrameElement, data: any) => {
  if (!iframe.contentWindow) {
    doWarn('IFrame has no content window');
    return;
  }
  iframe.contentWindow.postMessage({ isDerefMessage: true, data }, '*');
};

export const unwrapMessageToIframe = (message: any): unknown | null => {
  if (message.isDerefMessage) {
    return message.data;
  }
  return null;
};
