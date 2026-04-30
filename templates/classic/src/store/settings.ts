import { atomWithScopedStorage } from '@/utils/storage';
import { entry } from 'at/options';

export const randomOptionsAtom = atomWithScopedStorage<boolean>('randomOptions', entry !== 'tf');
export const keepRandomOrderOnBackAtom = atomWithScopedStorage<boolean>(
  'keepRandomOrderOnBack',
  entry === 'tf',
);
export const selectionMenuAtom = atomWithScopedStorage<boolean>('selectionMenu', true);

export const biggerTextAtom = atomWithScopedStorage<boolean>('biggerText', false);
export const hideTimerAtom = atomWithScopedStorage<boolean>('hideTimer', true);
export const hideQuestionTypeAtom = atomWithScopedStorage<boolean>('hideQuestionType', false);
export const noScrollAtom = atomWithScopedStorage<boolean>('noScroll', true);
export const blurOptionsAtom = atomWithScopedStorage<boolean>('blurOptions', false);
export const hideMcqAnswerAtom = atomWithScopedStorage<boolean>('hideMcqAnswer', false);
export const clozeAtom = atomWithScopedStorage<boolean>('cloze', false);
export const clozeRevealNextOnOutsideClickAtom = atomWithScopedStorage<boolean>(
  'clozeRevealNextOnOutsideClick',
  true,
);
export const instantFeedbackAtom = atomWithScopedStorage<boolean>('instantFeedback', false);
export const caseSensitiveAtom = atomWithScopedStorage('caseSensitive', true);
