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

type InjectStyleTagOptions = {
  id?: string;
  scriptSrcIncludes?: string;
};

function getStyleAnchorScript(scriptSrcIncludes?: string) {
  if (document.currentScript instanceof HTMLScriptElement) {
    return document.currentScript;
  }
  if (!scriptSrcIncludes) {
    return null;
  }

  const scripts = [...document.querySelectorAll<HTMLScriptElement>('script[src]')];
  for (let i = scripts.length - 1; i >= 0; i -= 1) {
    const script = scripts[i];
    if (script.src.includes(scriptSrcIncludes)) {
      return script;
    }
  }
  return null;
}

export function injectStyleTag(cssText: string, options: InjectStyleTagOptions = {}) {
  const { id, scriptSrcIncludes } = options;
  let style = id ? (document.getElementById(id) as HTMLStyleElement | null) : null;

  if (!style) {
    style = document.createElement('style');
    if (id) {
      style.id = id;
    }

    const anchorScript = getStyleAnchorScript(scriptSrcIncludes);
    if (anchorScript) {
      anchorScript.insertAdjacentElement('afterend', style);
    } else {
      document.head.appendChild(style);
    }
  }

  style.textContent = cssText;
  return style;
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

export function isIOSOrIPadOSSafariEngine() {
  const client = getAnkiClient();
  if (client !== 'iPad' && client !== 'iPhone') {
    return false;
  }
  return navigator.userAgent.includes('AppleWebKit');
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
