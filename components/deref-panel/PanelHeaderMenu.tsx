import React, { ReactNode } from 'react';
import { NavContext, postDerefMessage } from '~/page-handlers/messages';
import classNames from 'classnames';

export interface PanelHeaderMenuItem {
  item: ReactNode;
  renderContent?: () => ReactNode;
}

interface Props<TItem extends PanelHeaderMenuItem> {
  items: TItem[];
  isItemSelected: (item: TItem) => boolean;
  getItemNavContext: (item: TItem) => NavContext;
}

export default function PanelHeaderMenu<TItem extends PanelHeaderMenuItem>(
  props: Props<TItem>,
) {
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
            {item.item}
          </div>
        );
      })}
    </div>
  );
}

export const renderPanelHeaderMenuContent = <TItem extends PanelHeaderMenuItem>(
  props: Omit<Props<TItem>, 'getItemNavContext'>,
) => {
  const selected = props.items.find((item) => props.isItemSelected(item));
  if (!selected) {
    return null;
  }
  return selected.renderContent?.() ?? null;
};
