import { useBack } from '../../hooks/use-back';
import hiddenImg from '@/assets/cloze-img-hide.svg';
import {
  CLOZE_ANSWER_ATTR,
  CLOZE_CLASS,
  domToCloze,
  getClozeData,
  getClozeNodes,
} from '@/features/cloze/dom-to-cloze';
import { hasSelectedText } from '@/features/cloze/has-selected-text';
import { clozeAtom } from '@/store/settings';
import { entry } from 'at/options';
import { useAtomValue } from 'jotai';
import { RefObject, useEffect, useLayoutEffect } from 'react';
import { doNothing } from 'remeda';

const CLOZE_HIDDEN = 'data-at-cloze-hide';

function isClozeHidden(node: Element) {
  return node.getAttribute(CLOZE_HIDDEN) === 'true';
}

function getAnswer(node: Element) {
  return node.getAttribute(CLOZE_ANSWER_ATTR);
}

function showAnswer(node: Element) {
  node.setAttribute(CLOZE_HIDDEN, 'false');
  const type = getClozeData(node)?.type;
  if (!type) {
    return;
  }
  const answer = getAnswer(node);
  switch (type) {
    case 'text': {
      node.textContent = answer;
      break;
    }
    case 'whole': {
      if (node.nodeName === 'IMG') {
        node.setAttribute('src', answer || '');
      }
      break;
    }
  }
}

function hideAnswer(node: Element) {
  node.setAttribute(CLOZE_HIDDEN, 'true');
  const type = getClozeData(node)?.type;
  if (!type) {
    return;
  }
  switch (type) {
    case 'text': {
      node.textContent = '        ';
      break;
    }
    case 'whole': {
      if (node.nodeName === 'IMG') {
        node.setAttribute('src', hiddenImg);
      }
      break;
    }
  }
}

const CLOZED_ATTR = 'data-at-clozed';

const useCloze = (ref: RefObject<HTMLElement>) => {
  const [back] = useBack();
  const clozeEnabled = useAtomValue(clozeAtom) || entry === 'cloze';

  useLayoutEffect(() => {
    const { current: el } = ref;
    if (!el || !clozeEnabled) {
      return;
    }
    el.style.visibility = 'hidden';
  }, [clozeEnabled]);

  useEffect(() => {
    const { current: el } = ref;
    if (!el || !clozeEnabled) {
      return doNothing;
    }
    if (!el.getAttribute(CLOZED_ATTR)) {
      domToCloze(el);
      el.setAttribute(CLOZED_ATTR, 'true');
    }

    document.querySelectorAll(`.${CLOZE_CLASS}`).forEach((el) => {
      if (!back) {
        hideAnswer(el);
      } else {
        showAnswer(el);
      }
    });
    el.style.visibility = 'visible';

    const onPointerUp = (event: PointerEvent) => {
      const { target } = event;
      if (back || hasSelectedText(el) || !target || !(target instanceof Element)) {
        return;
      }
      const node =
        target.closest(`.${CLOZE_CLASS}`) ||
        el.querySelector(`[${CLOZE_HIDDEN}='true'].${CLOZE_CLASS}`);
      if (!node) {
        return;
      }
      getClozeNodes(el, node).forEach((node) => {
        if (isClozeHidden(node)) {
          showAnswer(node);
        } else {
          hideAnswer(node);
        }
      });
    };
    el.addEventListener('pointerup', onPointerUp, true);

    return () => {
      el.removeEventListener('pointerup', onPointerUp, true);
    };
  }, [back, clozeEnabled]);
};

export { useCloze };
