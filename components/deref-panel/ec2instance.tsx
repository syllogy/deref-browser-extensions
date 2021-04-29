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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="mr-2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="mr-2"
          >
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="mr-2"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
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
