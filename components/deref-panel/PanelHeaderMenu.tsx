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
    <div className="flex items-stretch">
      {props.items.map((item, i) => {
        const isSelected = props.isItemSelected(item);
        return (
          <div
            key={i}
            className={classNames(
              'cursor-pointer flex-grow border text-center',
              {
                'bg-blue-500': isSelected,
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
