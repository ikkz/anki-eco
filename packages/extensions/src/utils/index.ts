import type { customElement } from 'lit/decorators.js';

export const customElementOnce: typeof customElement =
  (tagName) => (classOrTarget, context?: ClassDecoratorContext) => {
    const define = () => {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, classOrTarget as CustomElementConstructor);
      }
    };
    if (context) {
      context.addInitializer(define);
    } else {
      define();
    }
  };

export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString() || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function markInteractive(element: HTMLElement) {
  element.classList.add('tappable');
}

export function getAnkiClient() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('iPad')) {
    return 'iPad';
  } else if (userAgent.includes('iPhone')) {
    return 'iPhone';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  }
  return 'Desktop';
}

declare global {
  interface Console {
    patched?: boolean;
  }
}

export function patchConsole() {
  const originalConsole = window.console;
  if (originalConsole.patched) return;

  window.console = new Proxy(originalConsole, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      return Reflect.get(target, 'log', receiver);
    },
  });
  window.console.patched = true;
}
