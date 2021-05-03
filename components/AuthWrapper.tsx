import { DerefContext, postDerefMessage } from '~/page-handlers/messages';
import React, { ReactNode } from 'react';
import Button from '~/components/Button';

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
        <div className="mb-4 mt-2">{msg}</div>
        <div>
          <Button
            variant="primary"
            size="lg"
            onClick={async () => {
              postDerefMessage({ type: 'login', payload: undefined });
            }}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return <>{props.children}</>;
}
