import { pv } from '@/utils/event.js';
import css from '@anki-eco/style-kit?raw';
import { injectStyleTag } from '@/utils/index.js';

injectStyleTag(css, { id: 'anki-eco-style-kit' });

void pv('/style-kit');
