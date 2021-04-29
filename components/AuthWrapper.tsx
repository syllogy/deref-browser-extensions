import { DerefContext, postDerefMessage } from '~/page-handlers/messages';
import React, { ReactNode } from 'react';

interface Props {
  derefContext: DerefContext;
  msg?: ReactNode;
  children: ReactNode;
}

export default function AuthWrapper(props: Props) {
  const msg = props.msg ?? <div>Log in to continue</div>;

  if (!props.derefContext.user) {
    return (
      <div className="text-center">
        <div>{msg}</div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => {
              postDerefMessage({ type: 'login', payload: undefined });
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <>{props.children}</>;
}
