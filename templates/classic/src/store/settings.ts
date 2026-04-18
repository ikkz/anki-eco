import { atomWithScopedStorage } from '@/utils/storage';

export const randomOptionsAtom = atomWithScopedStorage<boolean>('randomOptions', true);
export const keepRandomOrderOnBackAtom = atomWithScopedStorage<boolean>(
  'keepRandomOrderOnBack',
  false,
);
export const selectionMenuAtom = atomWithScopedStorage<boolean>('selectionMenu', true);

export const biggerTextAtom = atomWithScopedStorage<boolean>('biggerText', false);
export const hideTimerAtom = atomWithScopedStorage<boolean>('hideTimer', true);
export const hideQuestionTypeAtom = atomWithScopedStorage<boolean>('hideQuestionType', false);
export const noScrollAtom = atomWithScopedStorage<boolean>('noScroll', true);
export const blurOptionsAtom = atomWithScopedStorage<boolean>('blurOptions', false);
export const hideMcqAnswerAtom = atomWithScopedStorage<boolean>('hideMcqAnswer', false);
export const clozeAtom = atomWithScopedStorage<boolean>('cloze', false);
export const instantFeedbackAtom = atomWithScopedStorage<boolean>('instantFeedback', false);
export const caseSensitiveAtom = atomWithScopedStorage('caseSensitive', true);
