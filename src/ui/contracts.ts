/**
 * @file UI contract types. The engine only depends on this contract, never
 * on concrete DOM. To redesign the UI, replace the implementation in this
 * folder (template + CSS) without touching the engine.
 *
 * DOM contract (ids/classes the engine relies on, provided by the default UI):
 * - #waifu            root widget container
 * - #waifu-tips       message bubble (class waifu-tips-active when visible)
 * - #waifu-canvas     canvas wrapper
 * - #live2d           rendering canvas (created by resetCanvas())
 * - #waifu-tool       toolbar container
 * - #waifu-toggle     re-enable button (class waifu-toggle-active when expanded)
 * - #waifu .waifu-active / .waifu-hidden   widget state classes
 * - CSS var --live2d-size                   display size of the canvas
 */

export type WidgetState = 'active' | 'hidden';

export interface CanvasSetupOptions {
  /**
   * Display size of the canvas in CSS pixels (default 400).
   */
  size?: number;
  /**
   * Called after the canvas buffer was re-sized (e.g. on DPR change),
   * so the renderer can rebuild its viewport.
   */
  onRefresh?: () => void;
}

export interface WaifuUI {
  /**
   * Inject the widget DOM (container only, not the toggle) into the page.
   */
  mount(): HTMLElement;
  /**
   * Inject the re-enable toggle button into the page.
   */
  mountToggle(): HTMLElement;
  /**
   * Remove the widget DOM from the page.
   */
  unmount(): void;

  getCanvas(): HTMLCanvasElement;
  /**
   * The root widget element (#waifu), used for dragging.
   */
  getWidget(): HTMLElement | null;
  /**
   * Replace the canvas element with a fresh one and return it.
   */
  resetCanvas(): HTMLCanvasElement;

  /**
   * Show a message in the bubble. Only updates the DOM; message priority
   * handling stays in the engine.
   */
  showMessage(text: string): void;
  hideMessage(): void;

  /**
   * Append a tool button to the toolbar.
   */
  addToolButton(id: string, icon: string, onClick: () => void): void;

  setWidgetState(state: WidgetState): void;
  /**
   * Start the slide-out transition (remove waifu-active) without hiding yet.
   */
  slideOut(): void;
  /**
   * Mark the widget as fully hidden (display: none).
   */
  setWidgetHidden(): void;
  setToggleActive(active: boolean): void;
  removeToggle(): void;

  /**
   * Set the display size CSS variable and keep the canvas buffer in sync
   * with the device pixel ratio. Must be called once after mount().
   */
  setupCanvas(options: CanvasSetupOptions): void;
}