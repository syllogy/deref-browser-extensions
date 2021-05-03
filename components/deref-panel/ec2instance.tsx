import React, { ReactNode } from 'react';
import { PanelComponentProps } from '~/components/deref-panel/types';
import {
  Ec2InstanceNavContext,
  useWindowMessageListener,
  DerefMessagePayloadOf,
  PriceMessage,
} from '~/page-handlers/messages';
import PanelHeaderMenu, {
  PanelHeaderMenuItem,
  renderPanelHeaderMenuContent,
} from '~/components/deref-panel/PanelHeaderMenu';
import PriceBar from '~/components/PriceBar';
import AuthWrapper from '~/components/AuthWrapper';
import NoteTextArea from '~/components/note/NoteTextArea';
import {
  ResourceNoteDocument,
  SaveResourceNoteDocument,
} from '~/graphql/types';
import { useQuery, useMutation } from '@apollo/client';
import { createQueryContainer } from '~/components/QueryContainer';

interface MenuItemProps extends PanelComponentProps<Ec2InstanceNavContext> {
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
          <NoteContainer {...props} />
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
    ...props,
    price,
  };
};

export function Ec2InstanceHeader(
  props: PanelComponentProps<Ec2InstanceNavContext>,
) {
  const itemProps = useItemProps(props);
  // TODO: We don't need this data, but preload it - show have a container for the panel components.
  useNoteQuery(props.navContext.data.instanceId);

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

// TODO: This is here because we preload in the header component.
const useNoteQuery = (instanceId: string) => {
  return useQuery(ResourceNoteDocument, {
    variables: {
      // TODO: Using instanceId instead of arn for now.
      arn: instanceId,
    },
  });
};

const NoteContainer = createQueryContainer({
  useQuery: (props: PanelComponentProps<Ec2InstanceNavContext>) => {
    return useNoteQuery(props.navContext.data.instanceId);
  },
  component: function NoteContainer(props) {
    const [saveResourceNote] = useMutation(SaveResourceNoteDocument);

    // TODO: Using instanceId instead of arn for now.
    const arn = props.navContext.data.instanceId;

    return (
      <NoteTextArea
        note={props.result.data.resourceNote ?? undefined}
        onSave={async (note) => {
          await saveResourceNote({
            variables: {
              input: {
                arn,
                body: note.body,
              },
            },
            // TODO: Avoid this and use refetchQueries or similar as much as possible - in this case it's ok.
            update: (cache, result) => {
              if (result.data) {
                cache.writeQuery({
                  query: ResourceNoteDocument,
                  variables: {
                    arn,
                  },
                  data: {
                    resourceNote: result.data.saveNoteForResource,
                  },
                });
              }
            },
          });
        }}
        className="h-full"
      />
    );
  },
});
