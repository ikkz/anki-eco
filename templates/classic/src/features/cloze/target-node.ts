import { CLOZE_CLASS } from './dom-to-cloze';

const CLOZE_HIDDEN = 'data-at-cloze-hide';

function getTargetClozeNode(
  fieldElement: HTMLElement,
  target: Element,
  revealNextOnOutsideClick: boolean,
) {
  const clozeNode = target.closest(`.${CLOZE_CLASS}`);
  if (clozeNode || !revealNextOnOutsideClick) {
    return clozeNode;
  }
  return fieldElement.querySelector(`[${CLOZE_HIDDEN}='true'].${CLOZE_CLASS}`);
}

export { getTargetClozeNode };
