import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';

export default function DerefButton(props: RouteComponentProps) {
  return (
    <div className="h-full flex items-center mt-1 pb-1">
      <div
        className="h-full px-4 py-1 border-l border-t text-white rounded-tl-md border-gray-600 bg-gray-900 hover:bg-gray-800 flex items-center select-none cursor-pointer"
        onClick={() => {
          postDerefMessage({ type: 'togglePanel', payload: {} });
        }}
      >
        Deref
      </div>
    </div>
  );
}
