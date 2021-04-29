import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';

export default function DerefButton(props: RouteComponentProps) {
  return (
    <div className="h-full flex items-center">
      <div
        className="px-3 py-1 rounded-sm border text-white border-gray-500 bg-gray-900 hover:bg-gray-800 flex items-center select-none cursor-pointer"
        onClick={() => {
          postDerefMessage({ type: 'togglePanel', payload: {} });
        }}
      >
        Deref
      </div>
    </div>
  );
}
