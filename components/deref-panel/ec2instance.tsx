import React, { ReactNode } from 'react';
import { PanelComponentProps } from '~/components/deref-panel/types';
import {
  Ec2InstanceNavContext,
  useWindowMessageListener,
  DerefMessagePayloadOf,
  PriceMessage,
  DerefContext,
} from '~/page-handlers/messages';
import PanelHeaderMenu, {
  PanelHeaderMenuItem,
  renderPanelHeaderMenuContent,
} from '~/components/deref-panel/PanelHeaderMenu';
import PriceBar from '~/components/PriceBar';
import AuthWrapper from '~/components/AuthWrapper';

interface MenuItemProps {
  derefContext: DerefContext;
  price: DerefMessagePayloadOf<PriceMessage> | null;
}

interface MenuItem extends PanelHeaderMenuItem<MenuItemProps> {
  tab: Ec2InstanceNavContext['data']['tab'];
  renderContent: (props: MenuItemProps) => ReactNode;
}

const menuItems: MenuItem[] = [
  {
    tab: 'info',
    render: (props: MenuItemProps) => 'Info',
    renderContent(props: MenuItemProps) {
      return <div>Info content</div>;
    },
  },
  {
    tab: 'price',
    render: (props: MenuItemProps) => {
      return `Price${
        props.price ? ` (${(props.price.hourlyCost * 730).toFixed(2)})` : ''
      }`;
    },
    renderContent(props: MenuItemProps) {
      if (props.price) {
        return (
          <div>
            <PriceBar derefContext={props.derefContext} price={props.price} />
          </div>
        );
      }
      return <div>No price data</div>;
    },
  },
  {
    tab: 'notes',
    render: (props: MenuItemProps) => 'Notes',
    renderContent(props: MenuItemProps) {
      return (
        <AuthWrapper derefContext={props.derefContext}>
          <div>Notes</div>
        </AuthWrapper>
      );
    },
  },
];

const getIsItemSelected = (
  props: PanelComponentProps<Ec2InstanceNavContext>,
) => (item: MenuItem) => props.navContext.data.tab === item.tab;

const useItemProps = (
  props: PanelComponentProps<Ec2InstanceNavContext>,
): MenuItemProps => {
  const price = useWindowMessageListener('price');
  return {
    derefContext: props.derefContext,
    price,
  };
};

export function Ec2InstanceHeader(
  props: PanelComponentProps<Ec2InstanceNavContext>,
) {
  const itemProps = useItemProps(props);

  return (
    <PanelHeaderMenu
      items={menuItems}
      itemProps={itemProps}
      isItemSelected={getIsItemSelected(props)}
      getItemNavContext={(item) => ({
        ...props.navContext,
        data: {
          ...props.navContext.data,
          tab: item.tab,
        },
      })}
    />
  );
}

export function Ec2InstanceContent(
  props: PanelComponentProps<Ec2InstanceNavContext>,
) {
  const itemProps = useItemProps(props);

  return renderPanelHeaderMenuContent({
    items: menuItems,
    itemProps,
    isItemSelected: getIsItemSelected(props),
  });
}
