import React from 'react';
import { PanelComponentProps } from '~/components/deref-panel/types';
import { postDerefMessage } from '~/page-handlers/messages';

export function DefaultHeader(props: PanelComponentProps<any>) {
  return <div>Header</div>;
}

export function DefaultContent(props: PanelComponentProps<any>) {
  return <div>Content</div>;
}

export function DefaultFooter({ derefContext }: PanelComponentProps<any>) {
  if (derefContext.user) {
    return (
      <div className="flex items-center">
        <div className="flex-grow">{derefContext.user.email}</div>
        <button
          className="bg-gray-100 hover:bg-gray-700 text-black py-0 px-2 rounded"
          onClick={() => {
            postDerefMessage({ type: 'logout', payload: undefined });
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex-grow">Made by Deref</div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white py-0 px-2 rounded"
        onClick={() => {
          postDerefMessage({ type: 'login', payload: undefined });
        }}
      >
        Login
      </button>
    </div>
  );
}
