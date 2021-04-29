import {
  DependencyList,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
  useMemo,
} from 'react';
import { EmptyObject } from '~/lib/types';

export const useStateBacked = <T>(
  initial: T,
  update: (prev: T) => T,
  deps: DependencyList,
): [T, Dispatch<SetStateAction<T>>] => {
  const value = useRef(initial);
  const [_ignore, forceUpdate] = useState<EmptyObject>();

  // Update value if deps have changed.
  useMemo(() => {
    value.current = update(value.current);
  }, deps);

  return [
    value.current,
    (action: SetStateAction<T>) => {
      let newValue: T;
      if (typeof action === 'function') {
        newValue = (action as any)(value.current);
      } else {
        newValue = action;
      }
      if (newValue !== value.current) {
        value.current = newValue;
        forceUpdate({});
      }
    },
  ];
};
