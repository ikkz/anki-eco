export function isBrNode(node?: Node | null): node is HTMLBRElement {
  return node?.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR';
}

function deepTrimLeft(node: Node): boolean {
  if (isBrNode(node)) return true;
  if (node.nodeType === Node.TEXT_NODE) return !node.textContent?.trim();
  if (node.nodeType === Node.ELEMENT_NODE) {
    const isVoid = /^(IMG|HR|INPUT|AREA|BASE|COL|EMBED|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i.test(
      node.nodeName,
    );
    if (isVoid) return false;

    while (node.firstChild) {
      if (deepTrimLeft(node.firstChild)) {
        node.firstChild.remove();
      } else {
        break;
      }
    }
    if (node.childNodes.length === 0 && (node as HTMLElement).attributes.length === 0) {
      return true;
    }
    return false;
  }
  return false;
}

function deepTrimRight(node: Node): boolean {
  if (isBrNode(node)) return true;
  if (node.nodeType === Node.TEXT_NODE) return !node.textContent?.trim();
  if (node.nodeType === Node.ELEMENT_NODE) {
    const isVoid = /^(IMG|HR|INPUT|AREA|BASE|COL|EMBED|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i.test(
      node.nodeName,
    );
    if (isVoid) return false;

    while (node.lastChild) {
      if (deepTrimRight(node.lastChild)) {
        node.lastChild.remove();
      } else {
        break;
      }
    }
    if (node.childNodes.length === 0 && (node as HTMLElement).attributes.length === 0) {
      return true;
    }
    return false;
  }
  return false;
}

function trimContainerEdges(container: HTMLDivElement) {
  while (container.firstChild) {
    if (deepTrimLeft(container.firstChild)) {
      container.firstChild.remove();
    } else {
      break;
    }
  }
  while (container.lastChild) {
    if (deepTrimRight(container.lastChild)) {
      container.lastChild.remove();
    } else {
      break;
    }
  }
}

function splitNodeBySeparator(node: Node, separator: RegExp): Node[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (separator.test(text)) {
      return text.split(separator).map((part) => document.createTextNode(part));
    }
    return [node.cloneNode(true)];
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const textContext = node.textContent || '';
    if (!separator.test(textContext)) {
      return [node.cloneNode(true)];
    }

    const results: Node[] = [];
    let currentWrapper = node.cloneNode(false) as HTMLElement;
    results.push(currentWrapper);

    for (const child of Array.from(node.childNodes)) {
      const splitChildren = splitNodeBySeparator(child, separator);
      for (let i = 0; i < splitChildren.length; i++) {
        if (i > 0) {
          currentWrapper = node.cloneNode(false) as HTMLElement;
          results.push(currentWrapper);
        }
        currentWrapper.appendChild(splitChildren[i]);
      }
    }
    return results;
  }
  return [node.cloneNode(true)];
}

export function extractItems(field: HTMLElement) {
  if (!field) return [];
  const items: { id: string; node: HTMLDivElement }[] = [];
  let currentContainer = document.createElement('div');

  function pushContainer() {
    trimContainerEdges(currentContainer);
    if (currentContainer.childNodes.length > 0 || currentContainer.textContent?.trim()) {
      items.push({ id: items.length.toString(), node: currentContainer });
    }
    currentContainer = document.createElement('div');
  }

  for (const node of Array.from(field.childNodes)) {
    const textContext = node.textContent || '';
    if (node.nodeType === Node.ELEMENT_NODE && /^={3,}$/.test(textContext.trim())) {
      pushContainer();
      continue;
    }

    const parts = splitNodeBySeparator(node, /={3,}/);
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) pushContainer();
      currentContainer.appendChild(parts[i]);
    }
  }

  pushContainer();
  return items;
}
