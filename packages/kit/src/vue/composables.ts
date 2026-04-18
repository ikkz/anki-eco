import { ref, onMounted, onUnmounted, type Ref, watch } from 'vue';
import { isBack, isBackSignal } from '../vanilla/is-back.js';
import { prefixStorage } from '../vanilla/storage.js';
import { effect } from '@preact/signals-core';

export const useIsBack = () => {
  const isBackRef = ref(isBackSignal.peek());

  let cleanUp: undefined | (() => void);

  onMounted(() => {
    cleanUp = effect(() => {
      isBackRef.value = isBackSignal.value;
    });
  });

  onUnmounted(() => {
    cleanUp?.();
    cleanUp = undefined;
  });

  return isBackRef;
};

export function useReviewState<T>(key: string, init: T | (() => T)) {
  const initialValue = typeof init === 'function' ? (init as () => T)() : init;

  const state = ref<T>(
    isBack() ? (prefixStorage.getItem(key, initialValue) as T) : initialValue,
  ) as Ref<T>;

  watch(state, (value) => {
    prefixStorage.setItem(key, value);
  });

  return state;
}
