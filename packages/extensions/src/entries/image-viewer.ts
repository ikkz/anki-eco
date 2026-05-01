import Viewer from 'viewerjs';
import viewerStyle from 'viewerjs/dist/viewer.css?inline';
import { pv } from '@/utils/event.js';
import { applyFullScreenGlobalStyle } from '@/utils/full-screen.js';
import { patchConsole, injectStyleTag, markInteractive } from '@/utils/index.js';
import { injectLifecycleComponent } from '@/components/extension-lifecycle.js';

patchConsole();

export type InitImageViewerOptions = {
  selector?: string;
};

const imageViewerScriptSrc = 'image-viewer.js';
const viewerStyleId = 'anki-eco-image-viewer-style';
const configScriptId = 'anki-eco-image-viewer-config';

const defaultOptions = {
  selector: '#qa',
} satisfies Required<InitImageViewerOptions>;

function applyViewerStyle() {
  return injectStyleTag(viewerStyle, {
    id: viewerStyleId,
    scriptSrcIncludes: imageViewerScriptSrc,
  });
}

function isImageVisibleForViewer(image: HTMLImageElement) {
  if (image.getClientRects().length === 0) {
    return false;
  }
  const computedStyle = window.getComputedStyle(image);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    return false;
  }
  if (Number.parseFloat(computedStyle.opacity) <= 0) {
    return false;
  }

  const rect = image.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  return true;
}

function parseScriptConfig(rawConfig: unknown): InitImageViewerOptions {
  if (typeof rawConfig !== 'object' || rawConfig == null || Array.isArray(rawConfig)) {
    throw new Error('config must be a JSON object');
  }

  const config = rawConfig as Record<string, unknown>;
  const parsed: InitImageViewerOptions = {};

  if (config.selector !== undefined) {
    if (typeof config.selector !== 'string' || !config.selector.trim()) {
      throw new Error('"selector" must be a non-empty string');
    }
    parsed.selector = config.selector;
  }

  return parsed;
}

function readScriptOptions(): InitImageViewerOptions | undefined {
  const script = document.getElementById(configScriptId);
  if (!(script instanceof HTMLScriptElement)) {
    return undefined;
  }

  if (script.type !== 'application/json') {
    console.error(`[anki-eco:image-viewer] #${configScriptId} must use type="application/json".`);
    return undefined;
  }

  const rawText = script.textContent?.trim();
  if (!rawText) {
    return undefined;
  }

  try {
    return parseScriptConfig(JSON.parse(rawText));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[anki-eco:image-viewer] Invalid JSON config: ${message}`);
    return undefined;
  }
}

function normalizeOptions(options?: InitImageViewerOptions) {
  return {
    ...defaultOptions,
    ...readScriptOptions(),
    ...options,
  };
}

function initImageViewer(options: InitImageViewerOptions = {}) {
  const selector = options.selector || '#qa';
  const root = document.querySelector(selector) as HTMLElement | null;
  if (!root) {
    throw new Error(`ImageViewer target not found: ${selector}`);
  }

  const styleEl = applyViewerStyle();
  let globalStyle: ReturnType<typeof applyFullScreenGlobalStyle> | undefined;

  let cleaned = false;
  const cleanupDom = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    styleEl.remove();
    globalStyle?.remove();
  };

  const viewer = new Viewer(root, {
    inline: false,
    url(image: HTMLImageElement) {
      const anchor = image.closest('a');
      return (
        anchor?.dataset.src?.trim() ||
        image.dataset.pswpSrc?.trim() ||
        anchor?.getAttribute('href')?.trim() ||
        image.currentSrc ||
        image.src
      );
    },
    filter(image: HTMLImageElement) {
      return isImageVisibleForViewer(image);
    },
    show() {
      globalStyle = applyFullScreenGlobalStyle(imageViewerScriptSrc);
      setTimeout(() => {
        const viewerEl = (viewer as any).viewer;
        if (viewerEl) {
          markInteractive(viewerEl);
        }
      }, 10);
      void pv('/image-viewer');
    },
    hidden() {
      globalStyle?.remove();
      globalStyle = undefined;
    },
  });

  markInteractive(root);

  return () => {
    if (!cleaned) {
      viewer.destroy();
      cleanupDom();
    }
  };
}

let cleanup: (() => void) | undefined;
const lifecycleId = 'ae-image-viewer-lifecycle';

injectLifecycleComponent(
  lifecycleId,
  () => {
    try {
      cleanup = initImageViewer(normalizeOptions());
    } catch (error) {
      console.error(error);
    }
  },
  () => {
    cleanup?.();
    cleanup = undefined;
  },
);
