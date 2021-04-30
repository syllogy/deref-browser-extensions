import React, { ReactNode, useState } from 'react';
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
import NoteListEditor from '~/components/note/NoteListEditor';
import { Note, NoteApi } from '~/components/note/types';
import { randomString } from '~/lib/util/string';
import NotesIcon from '~/components/svg/NotesIcon';
import PriceIcon from '~/components/svg/PriceIcon';
import InfoIcon from '~/components/svg/InfoIcon';

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
    render: (props: MenuItemProps) => (
      <>
        <InfoIcon height={16} width={16} className="mr-2" />
        Info
      </>
    ),
    renderContent(props: MenuItemProps) {
      return <div>Info content</div>;
    },
  },
  {
    tab: 'price',
    render: (props: MenuItemProps) => {
      return (
        <>
          <PriceIcon height={16} width={16} className="mr-2" />
          Price{' '}
          {props.price ? (
            <span className="ml-1 text-xs text-gray-400 mt-1">
              (${(props.price.hourlyCost * 730).toFixed(2)})
            </span>
          ) : (
            ''
          )}
        </>
      );
    },
    renderContent(props: MenuItemProps) {
      if (props.price) {
        return (
          <div>
            <PriceBar
              derefContext={props.derefContext}
              price={props.price}
              vertical
            />
          </div>
        );
      }
      return <div>No price data</div>;
    },
  },
  {
    tab: 'notes',
    render: (props: MenuItemProps) => (
      <>
        <NotesIcon height={16} width={16} className="mr-2" />
        Notes
      </>
    ),
    renderContent(props: MenuItemProps) {
      return (
        <AuthWrapper derefContext={props.derefContext}>
          <MockNoteListEditor />
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

function MockNoteListEditor() {
  const { notes, api } = useMockNotesApi();

  return <NoteListEditor notes={notes} api={api} />;
}

interface MockNotesApiHook {
  notes: Note[];
  api: NoteApi;
}

const useMockNotesApi = (): MockNotesApiHook => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const notes: Note[] = [];
    for (let i = 0; i < 20; i++) {
      notes.push({ id: randomString(10), content: `Lorem ipsum note ${i}` });
    }
    return notes;
  });

  const updateNotes = <T extends unknown>(
    newNotes: Note[],
    returnVal: T,
  ): Promise<T> => {
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        setNotes(newNotes);
        resolve(returnVal);
      }, 300);
    });
  };

  return {
    notes,
    api: {
      save: async (note) => {
        const newNotes = [...notes];

        let noteId = note.id ?? randomString(10);
        if (!note.id) {
          noteId = randomString(10);
          newNotes.unshift({ ...note, id: noteId });
        } else {
          const index = newNotes.findIndex((n) => n.id === note.id);
          newNotes.splice(index, 1, { ...note, id: noteId });
        }
        return updateNotes(newNotes, noteId);
      },
      delete: async (id) => {
        const newNotes = [...notes];
        const index = newNotes.findIndex((n) => n.id === id);
        newNotes.splice(index, 1);
        return updateNotes(newNotes, undefined);
      },
    },
  };
};
