import type { Events } from 'webextension-polyfill-ts';
import { ExtensionApi, Omnibox, Tabs } from '~/lib/extension-api/api';
import {
  ExtensionMessageListener,
  PayloadOfExtensionMessage,
  ReturnTypeOfExtensionMessage,
  ExtensionMessage,
  ExtensionMessageType,
} from '~/lib/extension-api/messages';

const listeners: Map<
  ExtensionMessageType<ExtensionMessage>,
  ExtensionMessageListener<ExtensionMessage, any>[]
> = new Map();

const notSupported = (message: string) => (...args: any[]): any => {
  throw Error(`not supported: ${message}`);
};

const newEventEmitter = <T extends Function>(): Events.Event<T> => {
  let listener: T | null = null;
  return {
    addListener(callback) {
      if (listener) {
        throw Error('only a single listener is supported');
      }
      listener = callback;
    },
    hasListener: notSupported('hasListener'),
    hasListeners: notSupported('hasListeners'),
    removeListener: notSupported('removeListener'),
  };
};

const omnibox: Omnibox = {
  onInputStarted: newEventEmitter(),
  onInputEntered: newEventEmitter(),
  onInputChanged: newEventEmitter(),
  onInputCancelled: newEventEmitter(),
  setDefaultSuggestion(suggestion) {
    console.log('default suggestion:', suggestion);
  },
};

const tabs: Tabs = {
  update: notSupported('tabs.update'),
  create: notSupported('tabs.create'),
};

const mockextensionApi: ExtensionApi = {
  addListener: <
    TMessage extends ExtensionMessage,
    TType extends ExtensionMessageType<TMessage>
  >(
    type: TType,
    listener: ExtensionMessageListener<TMessage, TType>,
  ) => {
    if (!listeners.has(type)) {
      listeners.set(type, []);
    }
    listeners.get(type)?.push(listener);
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

    return listeners.get(msg.type)?.[0](msg.payload) as Promise<
      ReturnTypeOfExtensionMessage<TMessage, TType>
    >;
  },

  omnibox,
  tabs,
};

export default mockextensionApi;
