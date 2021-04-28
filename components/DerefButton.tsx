import React from 'react';
import { RouteComponentBaseProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';

interface Props extends RouteComponentBaseProps {}

export default function DerefButton(props: Props) {
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
