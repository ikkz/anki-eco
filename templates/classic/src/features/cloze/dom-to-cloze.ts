const UNIT_START = '{{';
const UNIT_END = '}}';

function insertAfter(node: Node, toInsert: Node) {
  const parent = node.parentNode;
  const next = node.nextSibling;
  if (!parent) {
    return;
  }
  if (next) {
    parent.insertBefore(toInsert, next);
  } else {
    parent.appendChild(toInsert);
  }
}

export const CLOZE_CLASS = 'at-cloze-unit';
export const CLOZE_ANSWER_ATTR = 'data-at-cloze-answer';
export const CLOZE_INDEX_ATTR = 'data-at-cloze-unit';
export const CLOZE_TYPE_ATTR = 'data-at-cloze-type';

type ClozeType = 'text' | 'whole';

function setClozeType(node: Element, type: ClozeType) {
  node.setAttribute(CLOZE_TYPE_ATTR, type);
}

export type ClozeUnitData = {
  type: ClozeType;
  answer: string;
  index: number;
};

export function getClozeData(node: Element): ClozeUnitData | undefined {
  if (!node.classList.contains(CLOZE_CLASS)) {
    return undefined;
  }
  return {
    type: node.getAttribute(CLOZE_TYPE_ATTR) as ClozeType,
    index: Number(node.getAttribute(CLOZE_INDEX_ATTR)),
    answer: node.getAttribute(CLOZE_ANSWER_ATTR) || '',
  };
}

function markUnit(node: Element, index: number) {
  node.classList.add(CLOZE_CLASS);
  node.setAttribute(CLOZE_INDEX_ATTR, String(index));
  const type = getClozeData(node)?.type;
  if (!type) {
    return;
  }
  if (type === 'text') {
    node.setAttribute(CLOZE_ANSWER_ATTR, node.textContent || '');
    return;
  } else if (type === 'whole') {
    switch (node.nodeName) {
      case 'IMG': {
        node.setAttribute(CLOZE_ANSWER_ATTR, node.getAttribute('src') || '');
        break;
      }
    }
  }
}

function createTextUnit(content: string, index: number) {
  const text = document.createTextNode(content);
  const span = document.createElement('span');
  setClozeType(span, 'text');
  span.appendChild(text);
  if (content) {
    markUnit(span, index);
  }
  return span;
}

function asWhole(node: Node): node is HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  const selectors = ['img', 'mjx-container', 'svg', '.math', '.bytemd-mermaid'];
  return (node as HTMLElement).matches(selectors.join(','));
}

export function getClozeNodes(container: Element, node: Element | number) {
  const index = typeof node === 'number' ? node : node.getAttribute(CLOZE_INDEX_ATTR);
  if (index === null) {
    return [];
  }
  return Array.from(container.querySelectorAll(`[${CLOZE_INDEX_ATTR}='${index}']`));
}

export function domToCloze(container: HTMLElement): number {
  let unitIndex = 0;
  let inUnit = false;

  function traverseNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const content = node.textContent;
      const parent = node.parentNode;
      if (!parent) {
        return;
      }
      const startIndex = content.indexOf(UNIT_START);
      const endIndex = content.indexOf(UNIT_END);
      const hasStart = startIndex >= 0;
      const hasEnd = endIndex >= 0;
      if (inUnit && hasEnd) {
        const unit = createTextUnit(content.slice(0, endIndex), unitIndex++);
        node.parentNode?.insertBefore(unit, node);
        inUnit = false;
        node.textContent = content.slice(endIndex + UNIT_END.length);
        traverseNode(node);
      } else if (!inUnit && hasStart) {
        node.textContent = content.slice(0, startIndex);

        const endIndex = content.indexOf(UNIT_END, startIndex);
        if (endIndex >= 0) {
          const unit = createTextUnit(
            content.slice(startIndex + UNIT_START.length, endIndex),
            unitIndex++,
          );
          insertAfter(node, unit);

          const remain = document.createTextNode(content.slice(endIndex + UNIT_END.length));
          insertAfter(unit, remain);
          traverseNode(remain);
        } else {
          const unit = createTextUnit(content.slice(startIndex + UNIT_START.length), unitIndex);
          insertAfter(node, unit);
          inUnit = true;
        }
      } else if (inUnit) {
        const unit = createTextUnit(content, unitIndex);
        node.parentNode?.replaceChild(unit, node);
      }
    } else if (inUnit && asWhole(node)) {
      setClozeType(node, 'whole');
      markUnit(node, unitIndex);
    } else if (node.hasChildNodes()) {
      Array.from(node.childNodes).forEach((node) => traverseNode(node));
    }
  }

  traverseNode(container);
  return inUnit ? unitIndex + 1 : unitIndex;
}
