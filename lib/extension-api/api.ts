import type { Omnibox, Tabs } from 'webextension-polyfill-ts';
import {
  ExtensionMessageListener,
  ReturnTypeOfExtensionMessage,
  PayloadOfExtensionMessage,
  ExtensionMessage,
  ExtensionMessageType,
} from '~/lib/extension-api/messages';

export interface ExtensionApi {
  addListener: <
    TMessage extends ExtensionMessage,
    TType extends ExtensionMessageType<TMessage>
  >(
    type: TType,
    listener: ExtensionMessageListener<TMessage, TType>,
  ) => void;

  sendMessage: <
    TMessage extends ExtensionMessage,
    TType extends ExtensionMessageType<TMessage>
  >(
    type: TType,
    payload: PayloadOfExtensionMessage<TMessage, TType>,
  ) => Promise<ReturnTypeOfExtensionMessage<TMessage, TType>>;

  omnibox: Omnibox;

  tabs: Tabs;
}

export type Omnibox = Omnibox.Static;

export type Tabs = Pick<Tabs.Static, 'update' | 'create'>;
