import React, { ReactNode } from 'react';
import { NavContext, postDerefMessage } from '~/page-handlers/messages';
import classNames from 'classnames';

export interface PanelHeaderMenuItem<TItemProps> {
  render: (props: TItemProps) => ReactNode;
  renderContent: (props: TItemProps) => ReactNode;
}

interface Props<TItemProps, TItem extends PanelHeaderMenuItem<TItemProps>> {
  items: TItem[];
  itemProps: TItemProps;
  isItemSelected: (item: TItem) => boolean;
  getItemNavContext: (item: TItem) => NavContext;
}

export default function PanelHeaderMenu<
  TItemProps,
  TItem extends PanelHeaderMenuItem<TItemProps>
>(props: Props<TItemProps, TItem>) {
  return (
    <div className="flex items-stretch h-full">
      {props.items.map((item, i) => {
        const isSelected = props.isItemSelected(item);
        return (
          <>
            {i !== 0 && <div className="w-px h-full bg-gray-300" />}
            <div
              key={i}
              className={classNames(
                'cursor-pointer select-none flex-grow border-b text-center h-full flex items-center justify-center font-medium pt-px text-gray-600 hover:text-black',
                {
                  'bg-white border-white': isSelected,
                  'bg-gray-100 hover:bg-gray-200 border-gray-300': !isSelected,
                },
              )}
              onClick={() => {
                postDerefMessage({
                  type: 'updateNavContext',
                  payload: {
                    navContext: props.getItemNavContext(item),
                  },
                });
                postDerefMessage({
                  type: 'togglePanelExpand',
                  payload: { expand: true },
                });
              }}
            >
              {item.render(props.itemProps)}
            </div>
          </>
        );
      })}
    </div>
  );
}

export const renderPanelHeaderMenuContent = <
  TItemProps,
  TItem extends PanelHeaderMenuItem<TItemProps>
>(
  props: Omit<Props<TItemProps, TItem>, 'getItemNavContext'>,
) => {
  const selected = props.items.find((item) => props.isItemSelected(item));
  if (!selected) {
    return null;
  }
  const content = selected.renderContent(props.itemProps);
  if (!content) {
    return null;
  }

  return <>{content}</>;
};
