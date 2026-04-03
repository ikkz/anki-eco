export const shouldShowAnswerBlock = (
  hasOptions: boolean,
  hideMcqAnswer: boolean,
  hasNote: boolean,
) => !hasOptions || !hideMcqAnswer || hasNote;
