/**
 * @file Default widget DOM template (classic UI).
 * To redesign the UI, edit this template and waifu.css while keeping the
 * ids/classes documented in contracts.ts.
 */

import { fa_child } from '../icons.js';

const WIDGET_HTML = `
<div id="waifu">
  <div id="waifu-tips"></div>
  <div id="waifu-canvas">
    <canvas id="live2d" width="800" height="800"></canvas>
  </div>
  <div id="waifu-tool"></div>
</div>
`;

const TOGGLE_HTML = `
<div id="waifu-toggle">
  ${fa_child}
</div>
`;

export { WIDGET_HTML, TOGGLE_HTML };