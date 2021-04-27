import React from 'react';
import { RouteComponentBaseProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';

interface Props extends RouteComponentBaseProps {}

export default function DerefPanel(props: Props) {
  return (
    <div className="deref-panel">
      <div className="content">
        {props.derefContext.user ? (
          <div style={{ width: '100%' }}>
            <div className="username">{props.derefContext.user.email}</div>
            <div
              className="btn logout-button"
              onClick={() => {
                postDerefMessage({ type: 'logout', payload: undefined });
              }}
            >
              Logout
            </div>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <div
              className="btn login-button"
              onClick={() => {
                postDerefMessage({ type: 'login', payload: undefined });
              }}
            >
              Login
            </div>
          </div>
        )}
      </div>
      <div className="footer">Made by Deref</div>
    </div>
  );
}
