import { customElementOnce } from '@/utils/index.js';
import { css, html } from 'lit';
import { unsafeCSS } from 'lit';
import { LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import tldrawStyle from 'tldraw/tldraw.css?inline';
import { createRoot } from 'react-dom/client';
import { App } from './tldraw.js';
import { createElement } from 'react';
import { twStyle } from '@/style.js';

@customElementOnce('tldraw-container')
export class TldrawContainer extends LitElement {
  static override styles = [
    twStyle,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
    css`
      ${unsafeCSS(tldrawStyle)}
    `,
  ];

  @property({ type: String })
  dataUrl = '';

  @property({ type: Number })
  width = 0;

  @property({ type: Number })
  height = 0;

  @query('.el-container')
  container!: HTMLElement;

  reactRoot?: ReturnType<typeof createRoot>;

  override firstUpdated(): void {
    this.reactRoot = createRoot(this.container);
    this.reactRoot.render(
      createElement(App, {
        dataUrl: this.dataUrl,
        width: this.width,
        height: this.height,
      }),
    );
  }

  override disconnectedCallback(): void {
    this.reactRoot?.unmount();
  }

  protected override render(): unknown {
    return html`<div class="el-container w-full h-full"></div>`;
  }
}
