/**
 * @file Default UI implementation (classic look). Implements the contract in
 * contracts.ts on top of template.ts + waifu.css.
 * @module ui
 */

import { WIDGET_HTML, TOGGLE_HTML } from './template.js';
import type { WaifuUI, CanvasSetupOptions, WidgetState } from './contracts.js';

const CANVAS_ID = 'live2d';
const WIDGET_ID = 'waifu';
const TIPS_ID = 'waifu-tips';
const TOOL_ID = 'waifu-tool';
const TOGGLE_ID = 'waifu-toggle';

class ClassicUI implements WaifuUI {
  private widget: HTMLElement | null = null;
  private toggle: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private canvasSize = 400;
  private dprRefreshListener: (() => void) | null = null;

  mount() {
    document.body.insertAdjacentHTML('beforeend', WIDGET_HTML);
    this.widget = document.getElementById(WIDGET_ID);
    this.canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
    return this.widget!;
  }

  mountToggle() {
    document.body.insertAdjacentHTML('beforeend', TOGGLE_HTML);
    this.toggle = document.getElementById(TOGGLE_ID);
    return this.toggle!;
  }

  unmount() {
    this.widget?.remove();
    this.toggle?.remove();
    this.widget = null;
    this.toggle = null;
    this.canvas = null;
  }

  getWidget() {
    return this.widget;
  }

  getCanvas() {
    if (!this.canvas) {
      this.canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
    }
    return this.canvas;
  }

  resetCanvas() {
    const wrapper = document.getElementById('waifu-canvas');
    wrapper!.innerHTML = `<canvas id="${CANVAS_ID}" width="800" height="800"></canvas>`;
    this.canvas = wrapper!.firstElementChild as HTMLCanvasElement;
    this.applyCanvasBuffer();
    return this.canvas;
  }

  showMessage(text: string) {
    const tips = document.getElementById(TIPS_ID);
    if (!tips) return;
    tips.innerHTML = text;
    tips.classList.add('waifu-tips-active');
  }

  hideMessage() {
    document.getElementById(TIPS_ID)?.classList.remove('waifu-tips-active');
  }

  addToolButton(id: string, icon: string, onClick: () => void) {
    const toolbar = document.getElementById(TOOL_ID);
    if (!toolbar) return;
    const element = document.createElement('span');
    element.id = `waifu-tool-${id}`;
    element.innerHTML = icon;
    element.addEventListener('click', onClick);
    toolbar.insertAdjacentElement('beforeend', element);
  }

  setWidgetState(state: WidgetState) {
    if (!this.widget) return;
    if (state === 'active') {
      this.widget.classList.remove('waifu-hidden');
      this.widget.classList.add('waifu-active');
    } else {
      this.widget.classList.remove('waifu-active');
      this.widget.classList.add('waifu-hidden');
    }
  }

  slideOut() {
    this.widget?.classList.remove('waifu-active');
  }

  setWidgetHidden() {
    this.widget?.classList.add('waifu-hidden');
  }

  setToggleActive(active: boolean) {
    this.toggle?.classList.toggle('waifu-toggle-active', active);
  }

  removeToggle() {
    this.toggle?.remove();
    this.toggle = null;
  }

  setupCanvas(options: CanvasSetupOptions) {
    const size = options.size ?? 400;
    this.canvasSize = size;
    document.documentElement.style.setProperty('--live2d-size', `${size}px`);
    this.applyCanvasBuffer();

    // The SDK may not have run yet; set the buffer as soon as the canvas
    // appears so the first frame is already crisp.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const element = node as HTMLElement;
          if (element.id === CANVAS_ID) {
            this.applyCanvasBuffer();
            observer.disconnect();
            return;
          }
          if (element.querySelector?.(`#${CANVAS_ID}`)) {
            this.applyCanvasBuffer();
            observer.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Rebuild the buffer when the device pixel ratio changes.
    let lastDPR = window.devicePixelRatio || 1;
    this.dprRefreshListener = () => {
      const dpr = window.devicePixelRatio || 1;
      if (dpr === lastDPR) return;
      lastDPR = dpr;
      this.applyCanvasBuffer();
      options.onRefresh?.();
    };
    window.addEventListener('resize', this.dprRefreshListener);
  }

  private applyCanvasBuffer() {
    const canvas = this.getCanvas();
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(this.canvasSize * dpr);
    canvas.height = Math.round(this.canvasSize * dpr);
  }
}

const ui: WaifuUI = new ClassicUI();

export { ClassicUI };
export default ui;