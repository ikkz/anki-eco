import { pv } from '@/utils/event.js';
import { patchConsole } from '@/utils/index.js';
patchConsole();

import { marked } from 'marked';

const selector = '[data-xmd]';
const SUPPORTED_TAGS = ['img', 'br'] as const;

declare global {
  interface Window {
    ankiEcoExtXMarkdownInitialized?: boolean;
  }
}

function domToText(
  dom: HTMLElement,
  transformTags: readonly (typeof SUPPORTED_TAGS)[number][] = SUPPORTED_TAGS,
) {
  if (transformTags.length) {
    const nodes = dom.querySelectorAll(transformTags.join(', '));
    for (const node of nodes) {
      const parent = node.parentNode;
      if (!parent) {
        continue;
      }
      const span = document.createElement('span');
      switch (node.tagName.toUpperCase()) {
        case 'IMG': {
          span.textContent = node.outerHTML;
          break;
        }
        case 'BR': {
          span.textContent = '\n';
        }
      }
      parent.insertBefore(span, node);
      node.remove();
    }
  }
  return dom.textContent || '';
}

function getMarkdownFromSource(source: HTMLElement) {
  // Clone so tag transformations do not mutate the original template content.
  const cloned = source.cloneNode(true) as HTMLElement;
  return domToText(cloned);
}

function renderMarkdownSource(source: HTMLElement) {
  if (source.dataset.xmdRendered === 'true') {
    return;
  }

  const markdown = getMarkdownFromSource(source);
  const className = source.dataset.xmdClass?.trim();
  const rendered = document.createElement('div');
  if (className) {
    rendered.className = className;
  }
  rendered.innerHTML = marked.parse(markdown, { async: false }) as string;

  source.insertAdjacentElement('afterend', rendered);
  source.dataset.xmdRendered = 'true';
}

function renderAll(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(selector).forEach(renderMarkdownSource);
}

function init() {
  renderAll(document);
  void pv('/xmarkdown');
}

init();
