import React from 'react';
import { RouteComponentBaseProps } from '~/components/routes';
import { postMessageFromIframe } from '~/page-handlers/messages';

interface Props extends RouteComponentBaseProps {}

export default function DerefButton(props: Props) {
  return (
    <div className="deref-button">
      <div
        className="deref-btn"
        onClick={() => {
          postMessageFromIframe({ type: 'togglePanel', payload: undefined });
        }}
      >
        Deref
      </div>
    </div>
  );
}
