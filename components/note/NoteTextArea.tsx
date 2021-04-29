import React, { ReactNode, useRef } from 'react';
import TextAreaAutosize from 'react-textarea-autosize';
import { Note, NoteApi } from '~/components/note/types';
import { useStateBacked } from '~/lib/hooks/useStateBacked';

interface ControlProps {
  content: string;
  save: () => Promise<string>;
  reset: () => void;
  focus: () => void;
}

interface Props {
  note?: Note;
  onSave: NoteApi['save'];
  renderControl?: (props: ControlProps) => ReactNode;
  autoFocus?: boolean;
  saveOnBlur?: boolean;
  minRows?: number;
}

export default function NoteTextArea(props: Props) {
  const [content, setContent] = useStateBacked<string>(
    props.note?.content ?? '',
    (prev) => props.note?.content ?? '',
    [props.note?.id],
  );

  const savePromiseRef = useRef<Promise<string>>();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const controlProps: ControlProps = {
    content,
    save: async () => {
      if (savePromiseRef.current) {
        return savePromiseRef.current;
      }
      savePromiseRef.current = props.onSave({ id: props.note?.id, content });

      try {
        return await savePromiseRef.current;
      } finally {
        savePromiseRef.current = undefined;
      }
    },
    reset: () => setContent(props.note?.content ?? ''),
    focus: () => textAreaRef.current?.focus(),
  };

  return (
    <div>
      <TextAreaAutosize
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full"
        placeholder="Add a note..."
        minRows={props.minRows}
        autoFocus={props.autoFocus}
        onFocus={
          props.autoFocus
            ? (e) => {
                const value = e.target.value;
                e.target.value = '';
                e.target.value = value;
              }
            : undefined
        }
        onBlur={props.saveOnBlur ? () => controlProps.save() : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            (e.target as HTMLTextAreaElement).blur();
          }
        }}
      />
      {props.renderControl?.(controlProps)}
    </div>
  );
}
