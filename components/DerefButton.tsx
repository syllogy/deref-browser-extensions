import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';
import classNames from 'classnames';

export default function DerefButton(props: RouteComponentProps) {
  return (
    <div className="h-full flex items-center ">
      <div
        className={classNames(
          'h-full pl-4 pr-3 fill-current flex items-center select-none cursor-pointer font-medium',
          {
            'border-gray-600 bg-gray-900 hover:bg-gray-800 border-l text-white pb-px': !props
              .derefContext.panelState.visible,
            'bg-gray-100 hover:bg-gray-200 text-black border-b border-gray-300':
              props.derefContext.panelState.visible,
          },
        )}
        onClick={() => {
          postDerefMessage({ type: 'togglePanel', payload: {} });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={72}
          height={14}
          viewBox="0 0 154 32"
        >
          <path d="M20,0a1.839,1.839,0,0,0-2,1.8V10H6a6,6,0,0,0-6,6V26a6,6,0,0,0,6,6H20a2,2,0,0,0,2-2V1.8A1.839,1.839,0,0,0,20,0ZM18,28H6a2,2,0,0,1-2-2V16a2,2,0,0,1,2-2H18Z" />
          <path d="M43,10H33a6,6,0,0,0-6,6V26a6,6,0,0,0,6,6H43a2,2,0,0,0,0-4H33a2,2,0,0,1-2-2V23H47a2,2,0,0,0,2-2V16A6,6,0,0,0,43,10Zm2,9H31V16a2,2,0,0,1,2-2H43a2,2,0,0,1,2,2Z" />
          <path d="M65.8,10H56a2,2,0,0,0-2,2V30.4c0,1.105.9,1.6,2,1.6s2-.5,2-1.6V14h7.8A2.2,2.2,0,0,1,68,16.2V17a2,2,0,0,0,4,0v-.8A6.2,6.2,0,0,0,65.8,10Z" />
          <path d="M92,10H82a6,6,0,0,0-6,6V26a6,6,0,0,0,6,6H92a2,2,0,0,0,0-4H82a2,2,0,0,1-2-2V23H96a2,2,0,0,0,2-2V16A6,6,0,0,0,92,10Zm2,9H80V16a2,2,0,0,1,2-2H92a2,2,0,0,1,2,2Z" />
          <path d="M118,0h-5a6,6,0,0,0-6,6v4h-3a2,2,0,0,0,0,4h3V30.4c0,1.105.895,1.6,2,1.6s2-.5,2-1.6V14h3a2,2,0,0,0,0-4h-3V6a2,2,0,0,1,2-2h5a2,2,0,0,0,0-4Z" />
          <path d="M140,17a2,2,0,0,0-2-2H124a2,2,0,0,0,0,4h14A2,2,0,0,0,140,17Z" />
          <path d="M152.728,15.586l-1.414-1.414-9.9-9.9A2,2,0,0,0,138.586,7.1l9.9,9.9-9.9,9.9a2,2,0,0,0,2.828,2.829l9.9-9.9,1.414-1.414A2,2,0,0,0,152.728,15.586Z" />
        </svg>
      </div>
    </div>
  );
}
