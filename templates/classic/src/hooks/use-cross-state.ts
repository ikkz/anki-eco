import { crossStorage } from '@/utils/cross-storage';
import { isBack } from '@/utils/is-back';
import useCreation from 'ahooks/es/useCreation';
import { useState, type SetStateAction } from 'react';

export function useCrossState<T>(key: string, init: T | (() => T)) {
  const initialValue = useCreation(
    () => (typeof init === 'function' ? (init as () => T)() : init),
    [],
  );

  const [state, setState] = useState(() => {
    if (isBack()) {
      return crossStorage.getItem(key, initialValue) as T;
    } else {
      crossStorage.setItem(key, initialValue);
      return initialValue;
    }
  });

  return [
    state,
    (value: SetStateAction<T>) => {
      setState((prev) => {
        const next =
          typeof value === 'function'
            ? (value as (current: T) => T)(prev)
            : value;
        crossStorage.setItem(key, next);
        return next;
      });
    },
  ] as const;
}
