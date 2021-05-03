import React, {
  ReactNode,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Note, NoteApi } from '~/components/note/types';
import classNames from 'classnames';
import { debounce } from 'debounce';

interface ControlProps {
  body: string;
  save: () => Promise<void>;
  reset: () => void;
  focus: () => void;
}

interface Props {
  note?: Note;
  onSave: NoteApi['save'];
  renderControl?: (props: ControlProps) => ReactNode;
  autoFocus?: boolean;
  autoSave?: boolean;
  className?: string;
}

type SaveState = 'saving' | 'saved' | 'error';

const saveStates: Map<
  SaveState,
  {
    name: string;
    className: string;
  }
> = new Map([
  [
    'saving',
    {
      name: 'Saving...',
      className: 'text-gray-400',
    },
  ],
  [
    'saved',
    {
      name: 'Saved',
      className: 'text-green-600',
    },
  ],
  [
    'error',
    {
      name: 'Error saving',
      className: 'text-red-600',
    },
  ],
]);

export default function NoteTextArea(props: Props) {
  const [body, setBody] = useState(props.note?.body ?? '');
  const [saveState, setSaveState] = useState<SaveState>();

  // Store body in a ref for debounce below to work.
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const controlProps: ControlProps = {
    body,
    save: async () => {
      const body = bodyRef.current;
      setSaveState('saving');
      try {
        await props.onSave({ id: props.note?.id, body });
        setSaveState('saved');
      } catch (e: unknown) {
        setSaveState('error');
      }
    },
    reset: () => setBody(props.note?.body ?? ''),
    focus: () => textAreaRef.current?.focus(),
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- Using debounce.
  const onKeyDown = useCallback(
    debounce((e: React.KeyboardEvent) => {
      void controlProps.save();
    }, 1000),
    [],
  );

  return (
    <>
      <div className={classNames('relative', props.className)}>
        <textarea
          ref={textAreaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-full"
          placeholder="Add a note..."
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
          onBlur={props.autoSave ? () => controlProps.save() : undefined}
          onKeyDown={onKeyDown}
        />
        {!!saveState && (
          <div className="absolute mb-2 mr-2" style={{ bottom: 0, right: 0 }}>
            <div className={saveStates.get(saveState)?.className}>
              {saveStates.get(saveState)?.name}
            </div>
          </div>
        )}
      </div>
      {props.renderControl?.(controlProps)}
    </>
  );
}
