import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';

export default function DerefButton(props: RouteComponentProps) {
  return (
    <div className="deref-button">
      <div
        className="deref-btn"
        onClick={() => {
          postDerefMessage({ type: 'togglePanel', payload: {} });
        }}
      >
        Deref
      </div>
    </div>
  );
}
