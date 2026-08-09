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
- 路径使用 `/model/Nahida/Nahida.model3.json`（相对路径，由 autoload.js 动态补全为绝对地址）

### 3.2 `dist/autoload.js`

**核心改动**：

1. **自动路径检测**（替代硬编码 CDN 地址）：

   ```js
   const live2d_path = (() => {
     const src = document.currentScript.src;
     return src.substring(0, src.lastIndexOf('/') + 1);
   })();
   ```

   好处：无论从本地 `/dist/` 还是 jsDelivr CDN 加载，路径自动适配。

2. **模型路径动态解析**：

   ```js
   const repoBase = (() => {
     const src = document.currentScript.src;
     const idx = src.indexOf('/dist/');
     return idx >= 0 ? src.substring(0, idx) : '';
   })();
   ```

   在 `initWidget` 前手动 fetch `waifu-tips.json`，把以 `/` 开头的模型路径拼接 `repoBase` 前缀，生成 Blob URL 传入。确保模型文件在本地和 CDN 环境都能正确加载。

3. **强制默认模型**：

   ```js
   localStorage.removeItem('modelId');
   localStorage.removeItem('modelTexturesId');
   // initWidget 中：
   modelId: 0,
   ```

   清除可能缓存的其他模型 ID，确保每次加载默认显示纳西妲。

4. **日志级别**：`logLevel: 'info'`（调试期，后续改回 `warn`）

5. **移除了 `cdnPath` 配置**

### 3.3 `demo/local.html`

新增本地调试页面：

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Live2D 本地调试</title>
</head>
<body>
<script src="../dist/autoload.js"></script>
</body>
</html>
```

配合项目根目录本地 HTTP 服务器使用，无需等 CDN 缓存。

### 3.4 Git Tag `v1.0.0`

jsDelivr 的 `@master` 分支别名存在持久化缓存问题（返回 fork 前的旧版本）。通过创建 tag `v1.0.0` 绕过。

更新时重新打 tag：

```bash
git tag -f v1.0.0 && git push --tags -f
```

## 4. 博客端使用

在博客页面 HTML 中插入一行（**必须用 `@v1.0.0`，不要用 `@master`**）：

```html
<script src="https://cdn.jsdelivr.net/gh/yulabu/live2d-widget@v1.0.0/dist/autoload.js"></script>
```

## 5. 本地调试

### 启动本地服务器

```powershell
# 在项目根目录执行（不需要安装任何依赖）
npx serve .
```

### 访问调试页面

打开 `http://localhost:3000/demo/local.html`

### 调试流程

1. 修改 `dist/` 下的代码
2. 本地刷新页面 → 即时生效
3. 确认无误后：

   ```powershell
   git add -A
   git commit -m "描述改动"
   git tag -f v1.0.0
   git push
   git push --tags -f
   ```

4. 等 1-2 分钟 CDN 刷新，博客生效

### CDN 缓存手动刷新

```url
https://purge.jsdelivr.net/gh/yulabu/live2d-widget@v1.0.0/dist/autoload.js
```

### 注意事项

- 本地调试时模型文件从本地路径加载（autoload.js 自动检测，无需改配置）
- 博客线上时模型文件从 jsDelivr CDN 加载（同上，自动适配）
- 本地和线上共用同一套代码，不需要区分环境

## 6. 待优化项

| 问题 | 原因 | 方案 |
|---|---|---|
| 加载慢（~18 MB） | 8192px 纹理 14.6 MB | 缩纹理至 2048px |
| 显示模糊 | SDK 内联样式覆盖 CSS，HiDPI 像素拉伸 | CSS `!important` 强制显示尺寸 |
| 代码冗余 | 4 个无关模型、多余工具栏、Blob URL | 精简 waifu-tips.json 和 autoload.js |
