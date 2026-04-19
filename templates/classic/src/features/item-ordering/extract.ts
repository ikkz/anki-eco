export function isBrNode(node?: Node | null): node is HTMLBRElement {
  return node?.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR';
}

function trimContainerEdges(container: HTMLDivElement) {
  // Removes leading and trailing <br> or empty text nodes
  while (container.firstChild) {
    const fc = container.firstChild;
    if (isBrNode(fc) || (fc.nodeType === Node.TEXT_NODE && !fc.textContent?.trim())) {
      fc.remove();
    } else {
      break;
    }
  }
  while (container.lastChild) {
    const lc = container.lastChild;
    if (isBrNode(lc) || (lc.nodeType === Node.TEXT_NODE && !lc.textContent?.trim())) {
      lc.remove();
    } else {
      break;
    }
  }
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
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (/={3,}/.test(text)) {
        const parts = text.split(/={3,}/);
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) pushContainer();
          if (parts[i]) {
            currentContainer.appendChild(document.createTextNode(parts[i]));
          }
        }
      } else {
        currentContainer.appendChild(node.cloneNode(true));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const textContext = node.textContent || '';
      if (/={3,}/.test(textContext)) {
        // If it's effectively just the separator
        if (/^={3,}$/.test(textContext.trim())) {
          pushContainer();
        } else {
          // It contains some content AND a separator.
          const htmlSegments = (node as HTMLElement).innerHTML.split(/={3,}/);
          for (let i = 0; i < htmlSegments.length; i++) {
            if (i > 0) pushContainer();
            if (htmlSegments[i]) {
              const wrapper = node.cloneNode(false) as HTMLElement;
              wrapper.innerHTML = htmlSegments[i];
              currentContainer.appendChild(wrapper);
            }
          }
        }
      } else {
        currentContainer.appendChild(node.cloneNode(true));
      }
    } else {
      currentContainer.appendChild(node.cloneNode(true));
    }
  }

  pushContainer();
  return items;
}
