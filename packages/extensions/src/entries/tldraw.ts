patchConsole();

import { LitElement } from 'lit';
import { customElementOnce, markInteractive, patchConsole } from '../utils/index.js';
import { html } from 'lit/static-html.js';

import { initTldraw, ScreenShotType } from '@/features/tldraw/index.js';
import { property } from 'lit/decorators.js';
import { buttonStyle } from '@/style.js';

@customElementOnce('ae-tldraw')
export class TldrawExt extends LitElement {
  static override styles = [buttonStyle];

  @property({ type: String })
  selector = '#qa';

  @property({ type: String })
  screenshot: ScreenShotType = 'html2canvas';

  protected override render(): unknown {
    return html`<slot>Tldraw</slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    markInteractive(this);
    this.addEventListener('click', this.onClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.onClick);
    this.closeCallback?.();
  }

  closeCallback?: () => void;

  private onClick = () => {
    this.closeCallback?.();
    initTldraw(this.selector, this.screenshot).then((close) => {
      if (close) {
        this.closeCallback = close;
      }
    });
  };
}

export { initTldraw };
