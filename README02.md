# Live2D Widget — 纳西妲看板娘配置说明

## 1. Fork 仓库

基于 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) fork，仓库地址：

```
https://github.com/yulabu/live2d-widget
```

## 2. 模型文件

`model/Nahida/` 目录下放置纳西妲 Cubism 3 模型，主要文件：

| 文件 | 说明 |
|---|---|
| `Nahida.model3.json` | 模型定义（Version 3，含 Groups、HitAreas） |
| `Nahida.moc3` | 模型二进制数据（~3.5 MB） |
| `Nahida.8192/texture_00.png` | 8192 分辨率纹理（~14.6 MB） |
| `Nahida.physics3.json` | 物理配置 |
| `Nahida.cdi3.json` | 参数/部件显示信息 |
| `*.exp3.json` | 10 个表情文件 |
| `*.motion3.json` | 2 个动作文件 |

### 模型配置修改

`model/Nahida/Nahida.model3.json` 中修改了一处：

- `HitAreas` 从 `[]`（空）改为含 Body 区域的定义，修复 Cubism 5 渲染时的 `getHitAreasCount` 空指针崩溃

## 3. 改动清单

### 3.1 `dist/waifu-tips.json`

- models 数组头部新增 Nahida 模型条目
- 路径使用 `/model/Nahida/Nahida.model3.json`（相对路径，由 autoload.js 动态补全为绝对地址，本地和 CDN 均适用）

### 3.2 `dist/autoload.js`（核心文件）

**1. 自动路径检测**— 替代硬编码 CDN 地址：

```js
const live2d_path = (() => {
  const src = document.currentScript.src;
  return src.substring(0, src.lastIndexOf('/') + 1);
})();
```

无论从本地 `/dist/` 还是 jsDelivr CDN 加载，路径自动适配。

**2. 环境自动识别**：

```js
const isLocal = location.hostname === 'localhost' || location.protocol === 'file:';
```

本地开发时 `isLocal = true`，部署到博客后 `isLocal = false`。同一份代码，自动区分环境。

**3. 环境差异化配置**：

```js
tools: isLocal
  ? ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit']  // 7 个
  : ['hitokoto', 'asteroids', 'photo', 'info', 'quit'],                                   // 5 个
logLevel: isLocal ? 'info' : 'warn',
```

本地调试时保留全部工具栏和详细日志；生产环境精简，去掉无用的"切换模型"和"换装"按钮。

**4. 模型路径动态解析**：

```js
const repoBase = (() => {
  const src = document.currentScript.src;
  const idx = src.indexOf('/dist/');
  return idx >= 0 ? src.substring(0, idx) : '';
})();
```

在 `initWidget` 前手动 fetch `waifu-tips.json`，把以 `/` 开头的模型路径拼接 `repoBase` 前缀，生成 Blob URL 传入。

**5. 强制默认模型**：

```js
localStorage.removeItem('modelId');
localStorage.removeItem('modelTexturesId');
modelId: 0,
```

清除浏览器可能缓存的旧模型 ID，每次加载默认显示纳西妲。

**6. HiDPI 画布尺寸适配**：

```js
document.documentElement.style.setProperty(
  '--live2d-size',
  `${800 / (window.devicePixelRatio || 1)}px`
);
```

按屏幕像素密度自动计算显示尺寸，800px 渲染缓冲区 1:1 映射到物理像素，解决 HiDPI 屏幕模糊问题。

### 3.3 `dist/waifu.css`

```css
#live2d {
  width: var(--live2d-size, 400px) !important;
  height: var(--live2d-size, 400px) !important;
}
```

用 `!important` 强制覆盖 Cubism 5 SDK 的内联样式（SDK 会将画布显示尺寸设为 800px，在 HiDPI 上导致像素拉伸模糊）。

### 3.4 `model/Nahida/Nahida.model3.json`

- `HitAreas` 从 `[]`（空）改为含 Body 区域的定义，修复 Cubism 5 渲染时的 `getHitAreasCount` 空指针崩溃

### 3.5 `demo/local.html`

本地调试专用页面，一行即可加载：

```html
<script src="../dist/autoload.js"></script>
```

### 3.6 Git Tag `v1.0.0`

jsDelivr 的 `@master` 分支别名存在持久化缓存问题（返回 fork 前的旧版本）。通过创建 tag `v1.0.0` 绕过。

## 4. 本地调试

### 启动

```powershell
# 在项目根目录执行（首次运行自动下载 serve，无需预装依赖）
npx serve .
```

### 调试

浏览器打开 `http://localhost:3000/demo/local.html`

`isLocal` 自动识别为 `true`，工具栏全开、日志详细。修改 `dist/` 下任意文件后刷新页面即时生效，无需等 CDN。

### 验证清单

- [ ] 纳西妲模型正常显示
- [ ] 工具栏 7 个按钮全部可用
- [ ] 控制台有 `[Live2D Widget][INFO]` 日志
- [ ] HiDPI 屏幕下画布清晰不模糊

## 5. 部署到博客

### 部署流程

```powershell
# 1. 本地调试确认 OK 后提交
git add -A
git commit -m "描述改动"

# 2. 更新 tag（生产版靠 tag 识别，不是 master 分支）
git tag -f v1.0.0
git push
git push --tags -f
```

### CDN 缓存手动刷新

如果等了 2 分钟博客还没更新：

```
https://purge.jsdelivr.net/gh/yulabu/live2d-widget@v1.0.0/dist/autoload.js
```

### 博客标签（只需配置一次）

```html
<script src="https://cdn.jsdelivr.net/gh/yulabu/live2d-widget@v1.0.0/dist/autoload.js"></script>
```

### 环境自动切换

| | 本地 (localhost) | 博客 (CDN) |
|---|---|---|
| 路径检测 | `document.currentScript` 自动 | 同 |
| 模型路径 | repoBase 动态补全 | 同 |
| 工具栏 | 7 个 | 5 个 |
| 日志 | `info` | `warn` |
| 文件 | `dist/autoload.js` | **同一个文件** |

本地改了什么，部署上去就是什么。不需要手动同步配置。

## 6. 待优化项

| 问题 | 原因 | 方案 |
|---|---|---|
| 加载慢（~18 MB） | 8192px 纹理 14.6 MB | 缩纹理至 2048px |
| 代码冗余 | waifu-tips.json 含 4 个无关模型 | 删掉 Pio/Tia/Neptunia/Hiyori |
