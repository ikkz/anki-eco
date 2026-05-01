export class ExtensionLifecycleElement extends HTMLElement {
  onConnect?: () => void;
  onDisconnect?: () => void;

  connectedCallback() {
    this.style.display = 'none';
    this.onConnect?.();
  }

  disconnectedCallback() {
    this.onDisconnect?.();
  }
}

const tagName = 'ae-extension-lifecycle';

export function createLifecycleComponent(
  id?: string,
  onConnect?: () => void,
  onDisconnect?: () => void,
) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ExtensionLifecycleElement);
  }
  const el = document.createElement(tagName) as ExtensionLifecycleElement;
  if (id) {
    el.id = id;
  }
  el.onConnect = onConnect;
  el.onDisconnect = onDisconnect;
  return el;
}

export function injectLifecycleComponent(
  id?: string,
  onConnect?: () => void,
  onDisconnect?: () => void,
) {
  if (id && document.getElementById(id)) {
    console.warn(
      `[anki-eco] Lifecycle component with id '${id}' already exists. Ignoring subsequent execution.`,
    );
    return null;
  }

  const el = createLifecycleComponent(id, onConnect, onDisconnect);
  const script = document.currentScript;

  // If the script tag is available, insert next to it
  if (script && script.parentNode) {
    script.parentNode.insertBefore(el, script.nextSibling);
  } else {
    // Fallback to body or a known Anki container
    const fallback = document.querySelector('#qa') || document.body;
    fallback.appendChild(el);
  }

  return el;
}
