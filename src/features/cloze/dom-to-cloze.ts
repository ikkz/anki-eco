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
export const CLOZE_TYPE = 'data-at-cloze-type';

type ClozeType = 'text' | 'whole';

function setClozeType(node: Element, type: ClozeType) {
  node.setAttribute(CLOZE_TYPE, type);
}

export function getClozeType(node: Element): ClozeType | null {
  return (node.getAttribute(CLOZE_TYPE) as ClozeType) || null;
}

function tagUnit(node: Element, index: number) {
  node.classList.add(CLOZE_CLASS);
  node.setAttribute(CLOZE_INDEX_ATTR, String(index));
  const type = getClozeType(node);
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
    tagUnit(span, index);
  }
  return span;
}

function asWhole(node: Node): node is HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  const el = node as HTMLElement;
  if (['IMG', 'MJX-CONTAINER', 'SVG'].includes(el.nodeName)) {
    return true;
  }
  if (['math', 'bytemd-mermaid'].some((cls) => el.classList.contains(cls))) {
    return true;
  }
  return false;
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
      if (inUnit && !hasStart && !hasEnd) {
        const unit = createTextUnit(content, unitIndex);
        node.parentNode?.replaceChild(unit, node);
        return;
      }

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

          const remain = document.createTextNode(
            content.slice(endIndex + UNIT_END.length),
          );
          insertAfter(unit, remain);
          traverseNode(remain);
        } else {
          const unit = createTextUnit(
            content.slice(startIndex + UNIT_START.length),
            unitIndex,
          );
          insertAfter(node, unit);
          inUnit = true;
        }
      }
    } else if (inUnit && asWhole(node)) {
      setClozeType(node, 'whole');
      tagUnit(node, unitIndex);
    } else if (node.hasChildNodes()) {
      Array.from(node.childNodes).forEach((node) => traverseNode(node));
    }
  }

  traverseNode(container);
  return inUnit ? unitIndex + 1 : unitIndex;
}
