import React, { useState } from 'react';
import { Note, NoteApi } from '~/components/note/types';
import NoteTextArea from '~/components/note/NoteTextArea';
import classNames from 'classnames';
import Button from '~/components/Button';

interface Props {
  note: Note;
  api?: NoteApi;
}

export default function NoteListItem(props: Props) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      {editMode && props.api ? (
        <NoteTextArea
          note={props.note}
          onSave={async (note) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- api guaranteed.
            const noteId = await props.api!.save(note);
            setEditMode(false);
            return noteId;
          }}
          autoFocus={true}
          saveOnBlur={true}
        />
      ) : (
        <div className="flex py-2 group">
          <div
            className={classNames('flex-grow', 'whitespace-pre-wrap', {
              'cursor-pointer': !!props.api,
            })}
            onClick={props.api ? () => setEditMode(true) : undefined}
          >
            {props.note.content}
          </div>
          {props.api && (
            <div className="opacity-0 group-hover:opacity-100 duration-200">
              <Button
                size="sm"
                onClick={async () => props.api?.delete(props.note.id)}
              >
                ⨉
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}