import React, { useState, useMemo, useCallback } from 'react';
import { Note, NoteApi } from '~/components/note/types';
import NoteList from '~/components/note/NoteList';
import NoteTextArea from '~/components/note/NoteTextArea';
import Button from '~/components/Button';

interface Props {
  notes: Note[];
  api?: NoteApi;
}

export default function NoteListEditor(props: Props) {
  const [editNoteId, setEditNoteId] = useState<string>();

  const editNote = useMemo(() => {
    if (!editNoteId) {
      return undefined;
    }
    return props.notes.find((n) => n.id === editNoteId);
  }, [props.notes, editNoteId]);

  const notes = useMemo(() => {
    return editNoteId
      ? props.notes.filter((n) => n.id !== editNoteId)
      : props.notes;
  }, [props.notes, editNoteId]);

  const onSave = useCallback<NoteApi['save']>(
    async (note) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- api guaranteed.
      const noteId = await props.api!.save(note);
      setEditNoteId(noteId);
      return noteId;
    },
    [props.api, editNoteId],
  );

  return (
    <div>
      {props.api && (
        <div className="mb-4">
          <NoteTextArea
            note={editNote}
            onSave={onSave}
            autoFocus={true}
            saveOnBlur={true}
            minRows={3}
            renderControl={(controlProps) => {
              return (
                <div>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      await controlProps.save();
                      controlProps.reset();
                      setEditNoteId(undefined);
                      controlProps.focus();
                    }}
                  >
                    Save
                  </Button>
                </div>
              );
            }}
          />
        </div>
      )}
      <NoteList notes={notes} api={props.api} />
    </div>
  );
}
