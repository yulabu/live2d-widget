/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */

// Automatically detect base path from script URL
// Works both locally (e.g. /dist/) and on CDN (jsDelivr)
const live2d_path = (() => {
  const src = document.currentScript.src;
  return src.substring(0, src.lastIndexOf('/') + 1);
})();
const repoBase = (() => {
  const src = document.currentScript.src;
  const idx = src.indexOf('/dist/');
  return idx >= 0 ? src.substring(0, idx) : '';
})();
const isLocal = location.hostname === 'localhost' || location.protocol === 'file:';

// Set canvas CSS size based on device pixel ratio
// 800px buffer mapped 1:1 to physical pixels on HiDPI screens
document.documentElement.style.setProperty(
  '--live2d-size',
     `${480 / (window.devicePixelRatio || 1)}px`
);

// Method to encapsulate asynchronous resource loading
// 封装异步加载资源的方法
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.type = 'module';
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

(async () => {
  // If you are concerned about display issues on mobile devices, you can use screen.width to determine whether to load
  // 如果担心手机上显示效果不佳，可以根据屏幕宽度来判断是否加载
  // if (screen.width < 768) return;

  // Avoid cross-origin issues with image resources
  // 避免图片资源跨域问题
  const OriginalImage = window.Image;
  window.Image = function(...args) {
    const img = new OriginalImage(...args);
    img.crossOrigin = "anonymous";
    return img;
  };
  window.Image.prototype = OriginalImage.prototype;
  // Load waifu.css and waifu-tips.js
  // 加载 waifu.css 和 waifu-tips.js
  await Promise.all([
    loadExternalResource(live2d_path + 'waifu.css', 'css'),
    loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
  ]);
  // For detailed usage of configuration options, see README.en.md
  // 配置选项的具体用法见 README.md
  localStorage.removeItem('modelId');
  localStorage.removeItem('modelTexturesId');

  // Fetch waifu-tips.json and resolve model paths relative to repo base
  let waifuPath = live2d_path + 'waifu-tips.json';
  if (repoBase) {
    const resp = await fetch(waifuPath);
    const tips = await resp.json();
    if (tips.models) {
      tips.models.forEach(m => {
        m.paths = m.paths.map(p => p.startsWith('/') ? repoBase + p : p);
      });
    }
    const blob = new Blob([JSON.stringify(tips)], { type: 'application/json' });
    waifuPath = URL.createObjectURL(blob);
  }

  initWidget({
    waifuPath: waifuPath,
    // cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    cubism2Path: live2d_path + 'live2d.min.js',
    cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
    modelId: 0,
    tools: ['hitokoto', 'asteroids', 'switch-texture', 'photo', 'info', 'quit'],
    logLevel: isLocal ? 'info' : 'warn',
    drag: true,
  });
})();

console.log(`\n%cLive2D%cWidget%c\n`, 'padding: 8px; background: #cd3e45; font-weight: bold; font-size: large; color: white;', 'padding: 8px; background: #ff5450; font-size: large; color: #eee;', '');

/*
く__,.ヘヽ.        /  ,ー､ 〉
         ＼ ', !-─‐-i  /  /´
         ／｀ｰ'       L/／｀ヽ､
       /   ／,   /|   ,   ,       ',
     ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
      ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
        !,/7 '0'     ´0iソ|    |
        |.从"    _     ,,,, / |./    |
        ﾚ'| i＞.､,,__  _,.イ /   .i   |
          ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
            | |/i 〈|/   i  ,.ﾍ |  i  |
           .|/ /  ｉ：    ﾍ!    ＼  |
            kヽ>､ﾊ    _,.ﾍ､    /､!
            !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
            ﾚ'ヽL__|___i,___,ンﾚ|ノ
                ﾄ-,/  |___./
                'ｰ'    !_,.:
*/
