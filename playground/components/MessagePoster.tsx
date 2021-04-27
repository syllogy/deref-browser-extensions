import React from 'react';
import { DerefMessage, postDerefMessage } from '~/page-handlers/messages';

interface Props {}

interface Message {
  title?: string;
  msg: () => DerefMessage;
}

const messages: Message[] = [
  {
    msg: () => ({
      type: 'togglePanel',
      payload: undefined,
    }),
  },
  {
    msg: () => ({
      type: 'price',
      payload: {
        type: 't4g.micro',
        hourlyCost: Math.random() * 1000,
      },
    }),
  },
];

export default function MessagePoster(props: Props) {
  return (
    <div>
      {messages.map((m, i) => {
        return (
          <div key={i}>
            <button
              onClick={() => {
                postDerefMessage(m.msg());
              }}
            >
              {m.title ?? m.msg().type}
            </button>
          </div>
        );
      })}
    </div>
  );
}
