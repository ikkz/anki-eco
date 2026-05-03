import { blobToBase64 } from '@/utils/index.js';
import '@/components/full-screen.js';
import './element.js';
import { toBlob } from 'html-to-image';
import { imageDimensionsFromData } from 'image-dimensions';
import html2canvas from 'html2canvas';
import { pv } from '@/utils/event.js';

export type ScreenShotType = 'html2canvas' | 'html-to-image';

export async function initTldraw(selector = '#qa', screenshot: ScreenShotType = 'html2canvas') {
  pv('/tldraw');
  try {
    const target = document.querySelector(selector);
    if (!target || !(target instanceof HTMLElement)) {
      throw new Error('QA element not found');
    }

    let png: Blob | null;

    if (screenshot === 'html-to-image') {
      png = await toBlob(target, {
        filter: (node) => !node.tagName?.startsWith('AE-'),
      });
    } else {
      const canvas: HTMLCanvasElement = await (
        html2canvas as unknown as typeof import('html2canvas').default
      )(target, {
        backgroundColor: null,
        ignoreElements: (node) => node.tagName?.startsWith('AE-'),
      });

      png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
          } else {
            resolve(blob);
          }
        });
      });
    }

    if (!png) {
      throw new Error('Failed to convert QA element to PNG');
    }

    const dim = imageDimensionsFromData(new Uint8Array(await png.arrayBuffer()));
    if (!dim) {
      throw new Error('Failed to get dimensions of PNG');
    }

    const { width, height } = dim;

    const el = document.createElement('ae-full-screen');
    el.setAttribute('docs', 'https://anki.ikkz.fun/extension/tldraw.html');

    const tldraw = document.createElement('tldraw-container');
    tldraw.setAttribute('width', width.toString());
    tldraw.setAttribute('height', height.toString());
    tldraw.setAttribute('dataurl', await blobToBase64(png));
    el.appendChild(tldraw);
    document.body.appendChild(el);

    return () => el.remove();
  } catch (error: any) {
    alert(`Error initializing Tldraw: ${error.message}`);
    return undefined;
  }
}
