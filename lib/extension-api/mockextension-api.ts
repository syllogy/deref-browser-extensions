import { ExtensionApi } from '~/lib/extension-api/api';
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
};

export default mockextensionApi;
