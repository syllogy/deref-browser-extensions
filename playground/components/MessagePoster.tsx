import React from 'react';
import { DerefMessage, postDerefMessage } from '~/page-handlers/messages';

interface Props {}

interface Message {
  title?: string;
  msg: () => DerefMessage;
}

const createEc2InstanceNavContextMessage = (instanceId: string): Message => ({
  title: `navContext:ec2Instance:${instanceId}`,
  msg: () => ({
    type: 'updateNavContext',
    payload: {
      navContext: {
        type: 'ec2Instance',
        data: {
          instanceId: `instance-${instanceId}`,
        },
      },
    },
  }),
});

const messages: Message[] = [
  {
    msg: () => ({
      type: 'togglePanel',
      payload: {},
    }),
  },
  {
    msg: () => ({
      type: 'togglePanelExpand',
      payload: {},
    }),
  },
  {
    title: 'navContext:clear',
    msg: () => ({
      type: 'updateNavContext',
      payload: {
        navContext: null,
      },
    }),
  },
  createEc2InstanceNavContextMessage('1'),
  createEc2InstanceNavContextMessage('2'),
  createEc2InstanceNavContextMessage('3'),
  createEc2InstanceNavContextMessage('4'),
  createEc2InstanceNavContextMessage('5'),
  {
    msg: () => ({
      type: 'price',
      payload: {
        type: 't4g.micro',
        hourlyCost: Math.random() * 10,
        lastUpdated: { at: new Date(), by: 'a-very-real-user' },
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
