import React from 'react';
import { PanelComponentProps } from '~/components/deref-panel/types';
import { Ec2InstanceNavContext } from '~/page-handlers/messages';
import PanelHeaderMenu, {
  PanelHeaderMenuItem,
  renderPanelHeaderMenuContent,
} from '~/components/deref-panel/PanelHeaderMenu';

interface MenuItem extends PanelHeaderMenuItem {
  tab: Ec2InstanceNavContext['data']['tab'];
}

const menuItems: MenuItem[] = [
  {
    tab: 'tab1',
    item: 'Tab1',
    renderContent() {
      return <div>Content tab 1</div>;
    },
  },
  {
    tab: 'tab2',
    item: 'Tab2',
    renderContent() {
      return <div>Content tab 2</div>;
    },
  },
];

const isItemSelected = (props: PanelComponentProps<Ec2InstanceNavContext>) => (
  item: MenuItem,
) => props.navContext.data.tab === item.tab;

export function Ec2InstanceHeader(
  props: PanelComponentProps<Ec2InstanceNavContext>,
) {
  return (
    <PanelHeaderMenu
      items={menuItems}
      isItemSelected={isItemSelected(props)}
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
  return renderPanelHeaderMenuContent({
    items: menuItems,
    isItemSelected: isItemSelected(props),
  });
}
