import React from 'react';
import { PanelComponentProps } from '~/components/deref-panel/types';
import { postDerefMessage } from '~/page-handlers/messages';
import Button from '~/components/Button';

export function DefaultHeader(props: PanelComponentProps<any>) {
  return (
    <div className="flex h-full items-center pb-1 px-3 font-semibold">
      Header
    </div>
  );
}

export function DefaultContent(props: PanelComponentProps<any>) {
  return <div>Content</div>;
}

export function DefaultFooter({ derefContext }: PanelComponentProps<any>) {
  if (derefContext.user) {
    return (
      <div className="flex items-center">
        <div className="flex-grow">{derefContext.user.email}</div>
        <Button
          size="sm"
          onClick={async () => {
            postDerefMessage({ type: 'logout', payload: undefined });
          }}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex-grow">Made by Deref</div>
      <Button
        size="sm"
        variant="primary"
        onClick={async () => {
          postDerefMessage({ type: 'login', payload: undefined });
        }}
      >
        Login
      </Button>
    </div>
  );
}
