import { patchConsole } from '@/utils/index.js';
patchConsole();

import '@/components/removed-callback.js';
import { consts } from '@anki-eco/shared';
import css from '@/features/card-motion/index.css?inline';
import { pv } from '@/utils/event.js';

type Hooks = {
  onFlipCard: () => void;
};

const domKey = 'ankiEcoExtCMSavedDom';

function readSavedDom() {
  return sessionStorage.getItem(domKey);
}

function writeSavedDom(value: string) {
  sessionStorage.setItem(domKey, value);
}

declare global {
  interface Window {
    ankiEcoExtCMClearId?: number;
    ankiEcoExtCMHooks?: Hooks;
  }
}

if (window.ankiEcoExtCMClearId) {
  clearTimeout(window.ankiEcoExtCMClearId);
  window.ankiEcoExtCMClearId = undefined;
}

const qa = document.getElementById('qa') as HTMLDivElement;
let style: HTMLStyleElement | undefined;

if (import.meta.env.DEV) {
  style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function watchAndSaveCard(card: HTMLDivElement) {
  const save = () => writeSavedDom(card.innerHTML);
  setTimeout(save, 0);
  const observer = new MutationObserver(() => {
    if (qa.contains(card)) {
      save();
    }
  });
  observer.observe(qa, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });

  const removeCallback: any = document.createElement('ae-removed-callback');
  removeCallback.callback = () => {
    observer.disconnect();
    style?.remove();
    window.ankiEcoExtCMClearId = setTimeout(() => {
      writeSavedDom('');
    }, 200);
  };
  qa.appendChild(removeCallback);
}

const classes = {
  container: 'ae-anim-container',
  card: 'ae-anim-card',
  face: 'ae-card-face',
  front: 'ae-front',
  back: 'ae-back',
  prev: 'ae-prev',
  hasPrev: 'ae-has-prev',
  animEnded: 'ae-anim-ended',
};

function main() {
  const isBack = !!document.getElementById(consts.backIndicatorId);
  const container: HTMLDivElement | null = document.querySelector('.' + classes.container);
  const card: HTMLDivElement | null = document.querySelector('.' + classes.card);
  const face: HTMLDivElement | null = document.querySelector('.' + classes.face);

  if (!container || !card || !face) {
    return;
  }
  const prevFaceHtml = readSavedDom();
  watchAndSaveCard(face);

  container.classList.add(isBack ? classes.back : classes.front);
  card.classList.add(isBack ? classes.back : classes.front);
  face.classList.add(isBack ? classes.back : classes.front);

  if (prevFaceHtml) {
    const prevFace = document.createElement('div');
    prevFace.innerHTML = prevFaceHtml;
    prevFace.classList.add(classes.face);

    if (isBack) {
      prevFace.classList.add(classes.front);
      card.prepend(prevFace);
      window.ankiEcoExtCMHooks?.onFlipCard();
    } else {
      prevFace.classList.add(classes.back);
      const prevCard = document.createElement('div');
      prevCard.appendChild(prevFace);
      prevCard.classList.add(classes.card, classes.prev);
      container.classList.add(classes.hasPrev);
      container.prepend(prevCard);
    }
  }

  setTimeout(() => {
    requestAnimationFrame(() => container.classList.add(classes.animEnded));
  }, 100);

  if (!isBack) {
    pv('/card-motion');
  }
}
main();
