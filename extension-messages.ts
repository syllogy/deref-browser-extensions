import { browser } from 'webextension-polyfill-ts';

export interface ExtensionBaseMessage<TPayload, TReturn> {
  payload: TPayload;
  // Here to aid type inference - can we get rid of this?
  returnType?: TReturn;
}

export interface AuthenticatedUser {
  email: string;
}

export interface ExtensionInitMessage
  extends ExtensionBaseMessage<void, AuthenticatedUser | null> {
  type: 'init';
}

export interface ExtensionLoginMessage
  extends ExtensionBaseMessage<void, AuthenticatedUser | null> {
  type: 'login';
}

export interface ExtensionLogoutMessage
  extends ExtensionBaseMessage<void, void> {
  type: 'logout';
}

export type ExtensionMessage =
  | ExtensionInitMessage
  | ExtensionLoginMessage
  | ExtensionLogoutMessage;

export type ExtensionMessageType<
  TMessage extends ExtensionMessage
> = TMessage['type'];

type PayloadOfExtensionMessage<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = TMessage extends ExtensionBaseMessage<infer TPayload, infer TReturn> & {
  type: TType;
}
  ? TPayload
  : never;

type ReturnTypeOfExtensionMessage<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = TMessage extends ExtensionBaseMessage<infer TPayload, infer TReturn> & {
  type: TType;
}
  ? TReturn
  : never;

type ExtensionMessageListener<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = (
  payload: PayloadOfExtensionMessage<TMessage, TType>,
) => Promise<ReturnTypeOfExtensionMessage<TMessage, TType>>;

export const addExtensionMessageListener = <
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
>(
  type: TType,
  listener: ExtensionMessageListener<TMessage, TType>,
) => {
  browser.runtime.onMessage.addListener((message: ExtensionMessage, s) => {
    if (message.type === type) {
      return listener(message.payload as any);
    }
  });
};

export const sendExtensionMessage = async <
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
};
