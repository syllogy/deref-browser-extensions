import { ExtensionApi } from '~/lib/extension-api/api';
import { browser } from 'webextension-polyfill-ts';
import {
  ExtensionMessageListener,
  PayloadOfExtensionMessage,
  ReturnTypeOfExtensionMessage,
  ExtensionMessage,
  ExtensionMessageType,
} from '~/lib/extension-api/messages';

const webextensionApi: ExtensionApi = {
  addListener: <
    TMessage extends ExtensionMessage,
    TType extends ExtensionMessageType<TMessage>
  >(
    type: TType,
    listener: ExtensionMessageListener<TMessage, TType>,
  ) => {
    browser.runtime.onMessage.addListener((message: ExtensionMessage, s) => {
      const tabId = s.tab?.id;
      if (message.type === type) {
        return listener(message.payload as any, tabId ? { tabId } : undefined);
      }
    });
  },

  sendMessage: async <
    TMessage extends ExtensionMessage,
    TType extends ExtensionMessageType<TMessage>
  >(
    type: TType,
    payload: PayloadOfExtensionMessage<TMessage, TType>,
  ): Promise<ReturnTypeOfExtensionMessage<TMessage, TType>> => {
    const msg: ExtensionMessage = {
      type: type as any,
      payload: payload as any,
    };

    return browser.runtime.sendMessage(msg);
  },

  omnibox: browser.omnibox,
  tabs: browser.tabs,
};

export default webextensionApi;
