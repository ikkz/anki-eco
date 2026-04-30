import { pv } from '@/utils/event.js';
import css from '@anki-eco/style-kit?raw';

const id = 'anki-eco-style-kit';
let style = document.getElementById(id) as HTMLStyleElement | null;

if (!style) {
  style = document.createElement('style');
  style.id = id;
  document.head.appendChild(style);
}

style.textContent = css;

void pv('/style-kit');
