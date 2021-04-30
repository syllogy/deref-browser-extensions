import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import { postDerefMessage } from '~/page-handlers/messages';
import classNames from 'classnames';
import Caret from '~/components/generic/Caret';
import DerefLogoLong from '~/components/svg/DerefLogoLong';

export default function DerefButton(props: RouteComponentProps) {
  return (
    <div className="h-full flex items-center">
      <div
        className={classNames(
          'h-full px-4 fill-current flex items-center select-none cursor-pointer font-medium',
          {
            'border-gray-600 bg-gray-900 hover:bg-gray-800 border-l text-white pb-px': !props
              .derefContext.panelState.visible,
            'bg-gray-100 hover:bg-gray-200 text-black border-b border-gray-300':
              props.derefContext.panelState.visible,
          },
        )}
        onClick={() => {
          postDerefMessage({ type: 'togglePanel', payload: {} });
        }}
      >
        <DerefLogoLong width={72} height={14} className="mr-2" />
        <Caret angle={props.derefContext.panelState.visible ? 180 : 0} />
      </div>
    </div>
  );
}
