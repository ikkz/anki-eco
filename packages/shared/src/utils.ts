export function ensureContainer(containerId: string): HTMLElement {
  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = containerId;
    document.body.appendChild(el);
  }
  return el;
}
