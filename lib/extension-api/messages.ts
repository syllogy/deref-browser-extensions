export interface ExtensionBaseMessage<TPayload, TReturn> {
  payload: TPayload;
  // Here to aid type inference - can we get rid of this?
  returnType?: TReturn;
}

export interface AuthenticatedUser {
  email: string;
  apiToken: string;
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

export interface ExtensionFrameOptionsExceptionMessage
  extends ExtensionBaseMessage<void, void> {
  type: 'frameOptionsException';
}

export type ExtensionMessage =
  | ExtensionInitMessage
  | ExtensionLoginMessage
  | ExtensionLogoutMessage
  | ExtensionFrameOptionsExceptionMessage;

export type ExtensionMessageType<
  TMessage extends ExtensionMessage
> = TMessage['type'];

export type PayloadOfExtensionMessage<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = TMessage extends ExtensionBaseMessage<infer TPayload, infer TReturn> & {
  type: TType;
}
  ? TPayload
  : never;

export type ReturnTypeOfExtensionMessage<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = TMessage extends ExtensionBaseMessage<infer TPayload, infer TReturn> & {
  type: TType;
}
  ? TReturn
  : never;

export type ExtensionMessageListener<
  TMessage extends ExtensionMessage,
  TType extends ExtensionMessageType<TMessage>
> = (
  payload: PayloadOfExtensionMessage<TMessage, TType>,
  context?: { tabId: number },
) => Promise<ReturnTypeOfExtensionMessage<TMessage, TType>>;
