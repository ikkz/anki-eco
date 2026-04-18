import { useEffect, useState } from 'react';
import { isBack } from '../vanilla/is-back.js';
import { prefixStorage } from '../vanilla/storage.js';
import { isBackSignal } from '../vanilla/index.js';
import { effect } from '@preact/signals-core';

export * from './field.jsx';

export const useIsBack = () => {
  const [isBack, setIsBack] = useState(() => isBackSignal.peek());

  useEffect(
    () =>
      effect(() => {
        setIsBack(isBackSignal.value);
      }),
    [],
  );

  return isBack;
};

export function useReviewState<T>(key: string, init: T | (() => T)) {
  const [initialValue] = useState(init);

  const [state, setState] = useState(() => {
    if (isBack()) {
      return prefixStorage.getItem(key, initialValue) as T;
    } else {
      prefixStorage.setItem(key, initialValue);
      return initialValue;
    }
  });

  return [
    state,
    (value: T) => {
      setState(value);
      prefixStorage.setItem(key, value);
    },
  ] as const;
}
