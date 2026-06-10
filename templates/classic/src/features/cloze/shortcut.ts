type ClozeShortcut = 'reveal-next' | 'toggle-all';

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('input, textarea, select, [contenteditable]'))
  );
}

function getClozeShortcut(event: KeyboardEvent): ClozeShortcut | undefined {
  if (
    event.isComposing ||
    isEditableTarget(event.target) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return undefined;
  }
  if (!event.shiftKey && event.key.toLowerCase() === 'w') {
    return 'reveal-next';
  }
  if (event.shiftKey && (event.key === ' ' || event.code === 'Space')) {
    return 'toggle-all';
  }
  return undefined;
}

export { getClozeShortcut, isEditableTarget };
