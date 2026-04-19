export function hasSelectedText(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }
  for (let index = 0; index < selection.rangeCount; index++) {
    const range = selection.getRangeAt(index);
    if (range.collapsed) {
      continue;
    }
    if (container.contains(range.commonAncestorContainer)) {
      return true;
    }
  }
  return false;
}
