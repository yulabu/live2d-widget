/**
 * @file Contains functions for initializing the waifu widget.
 * @module widget
 */

import { ModelManager, Config, ModelList } from './model.js';
import { showMessage, welcomeMessage, Time } from './message.js';
import { randomSelection } from './utils.js';
import { ToolsManager } from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';
import ui from './ui/index.js';

const WAIFU_DISABLED_KEY = 'waifu-disabled';

interface Tips {
  /**
   * Default message configuration.
   */
  message: {
    /**
     * Default message array.
     * @type {string[]}
     */
    default: string[];
    /**
     * Console message.
     * @type {string}
     */
    console: string;
    /**
     * Copy message.
     * @type {string}
     */
    copy: string;
    /**
     * Visibility change message.
     * @type {string}
     */
    visibilitychange: string;
    changeSuccess: string;
    changeFail: string;
    photo: string;
    goodbye: string;
    hitokoto: string;
    welcome: string;
    referrer: string;
    hoverBody: string | string[];
    tapBody: string | string[];
  };
  /**
   * Time configuration.
   * @type {Time}
   */
  time: Time;
  /**
   * Mouseover message configuration.
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  mouseover: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * Click message configuration.
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  click: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * Season message configuration.
   * @type {Array<{date: string, text: string | string[]}>}
   */
  seasons: {
    date: string;
    text: string | string[];
  }[];
  models: ModelList[];
}

/**
 * Register event listeners.
 * @param {Tips} tips - Result configuration.
 */
function registerEventListener(tips: Tips) {
  // Detect user activity and display messages when idle
  let userAction = false;
  let userActionTimer: any;
  const messageArray = tips.message.default;
  tips.seasons.forEach(({ date, text }) => {
    const now = new Date(),
      after = date.split('-')[0],
      before = date.split('-')[1] || after;
    if (
      Number(after.split('/')[0]) <= now.getMonth() + 1 &&
      now.getMonth() + 1 <= Number(before.split('/')[0]) &&
      Number(after.split('/')[1]) <= now.getDate() &&
      now.getDate() <= Number(before.split('/')[1])
    ) {
      text = randomSelection(text);
      text = (text as string).replace('{year}', String(now.getFullYear()));
      messageArray.push(text);
    }
  });
  let lastHoverElement: any;
  window.addEventListener('mousemove', () => (userAction = true));
  window.addEventListener('keydown', () => (userAction = true));
  setInterval(() => {
    if (userAction) {
      userAction = false;
      clearInterval(userActionTimer);
      userActionTimer = null;
    } else if (!userActionTimer) {
      userActionTimer = setInterval(() => {
        showMessage(messageArray, 6000, 9);
      }, 20000);
    }
  }, 1000);

  window.addEventListener('mouseover', (event) => {
    // eslint-disable-next-line prefer-const
    for (let { selector, text } of tips.mouseover) {
      if (!(event.target as HTMLElement)?.closest(selector)) continue;
      if (lastHoverElement === selector) return;
      lastHoverElement = selector;
      text = randomSelection(text);
      text = (text as string).replace(
        '{text}',
        (event.target as HTMLElement).innerText,
      );
      showMessage(text, 4000, 8);
      return;
    }
  });
  window.addEventListener('click', (event) => {
    // eslint-disable-next-line prefer-const
    for (let { selector, text } of tips.click) {
      if (!(event.target as HTMLElement)?.closest(selector)) continue;
      text = randomSelection(text);
      text = (text as string).replace(
        '{text}',
        (event.target as HTMLElement).innerText,
      );
      showMessage(text, 4000, 8);
      return;
    }
  });
  window.addEventListener('live2d:hoverbody', () => {
    const text = randomSelection(tips.message.hoverBody);
    showMessage(text, 4000, 8, false);
  });
  window.addEventListener('live2d:tapbody', () => {
    const text = randomSelection(tips.message.tapBody);
    showMessage(text, 4000, 9);
  });

  const devtools = () => {};
  console.log('%c', devtools);
  devtools.toString = () => {
    showMessage(tips.message.console, 6000, 9);
  };
  window.addEventListener('copy', () => {
    showMessage(tips.message.copy, 6000, 9);
  });
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden)
      showMessage(tips.message.visibilitychange, 6000, 9);
  });
}

/**
 * Load the waifu widget.
 * @param {Config} config - Waifu configuration.
 */
async function loadWidget(config: Config) {
  localStorage.removeItem('waifu-display');
  sessionStorage.removeItem('waifu-message-priority');
  ui.mount();
  ui.setupCanvas({
    size: config.size ?? 400,
    onRefresh: () => {
      (window as any).waifuModel?.refreshCanvas?.();
    },
  });
  let models: ModelList[] = [];
  let tips: Tips | null;
  if (config.waifuPath) {
    const response = await fetch(config.waifuPath);
    tips = await response.json();
    models = tips.models;
    registerEventListener(tips);
    showMessage(welcomeMessage(tips.time, tips.message.welcome, tips.message.referrer), 7000, 11);
  }
  const model = await ModelManager.initCheck(config, models);
  await model.loadModel('');
  registerTapCountHide(model, config);
  new ToolsManager(model, config, tips).registerTools();
  if (config.drag) registerDrag();
  ui.setWidgetState('active');
  (window as any).waifuModel = model;
}

/**
 * Nahida easter egg: tap the body N times to hide the widget for a while,
 * then come back (with leftover pose parameters reset).
 * @param {ModelManager} model - Model manager.
 * @param {Config} config - Waifu configuration.
 */
function registerTapCountHide(model: ModelManager, config: Config) {
  const options = config.tapCountHide;
  if (!options) return;
  const {
    count = 3,
    expression,
    hideDuration = 15000,
    resetParameters = [],
  } = options;
  let tapCount = 0;
  let tapTimer: any = null;
  window.addEventListener('live2d:tapbody', () => {
    tapCount++;
    if (tapTimer) clearTimeout(tapTimer);
    if (tapCount >= count) {
      tapCount = 0;
      ui.slideOut();
      if (expression) model.setExpression(expression);
      setTimeout(() => {
        model.resetParameters(resetParameters);
        ui.setWidgetState('active');
      }, hideDuration);
    } else {
      tapTimer = setTimeout(() => {
        tapCount = 0;
      }, 2000);
    }
  });
}

/**
 * Initialize the waifu widget.
 * @param {string | Config} config - Waifu configuration or configuration path.
 */
function initWidget(config: string | Config) {
  if (typeof config === 'string') {
    logger.error('Your config for Live2D initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
    return;
  }
  if (localStorage.getItem(WAIFU_DISABLED_KEY) === 'true') {
    return;
  }
  logger.setLevel(config.logLevel);
  if (config.forceDefaultModel) {
    // Always start from the configured default model, ignoring any
    // previously persisted model selection.
    localStorage.removeItem('modelId');
    localStorage.removeItem('modelTexturesId');
  }
  const toggle = ui.mountToggle();
  toggle.addEventListener('click', () => {
    ui.setToggleActive(false);
    if (toggle.getAttribute('first-time')) {
      loadWidget(config as Config);
      toggle.removeAttribute('first-time');
    } else {
      localStorage.removeItem('waifu-display');
      ui.setWidgetState('active');
    }
  });
  if (
    localStorage.getItem('waifu-display') &&
    Date.now() - Number(localStorage.getItem('waifu-display')) <= 86400000
  ) {
    toggle.setAttribute('first-time', 'true');
    setTimeout(() => {
      ui.setToggleActive(true);
    }, 0);
  } else {
    loadWidget(config as Config);
  }
}

export { initWidget, Tips };
