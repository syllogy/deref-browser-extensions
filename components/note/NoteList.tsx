import React from 'react';
import { Note, NoteApi } from '~/components/note/types';
import NoteListItem from '~/components/note/NoteListItem';

interface Props {
  notes: Note[];
  api?: NoteApi;
}

export default function NoteList(props: Props) {
  return (
    <ul className="list-none">
      {props.notes.map((note) => (
        <li key={note.id} className="border-b">
          <NoteListItem note={note} api={props.api} />
        </li>
      ))}
    </ul>
  );
}
