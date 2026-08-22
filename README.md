# Live2D Widget

![](https://forthebadge.com/images/badges/built-with-love.svg)
![](https://forthebadge.com/images/badges/made-with-typescript.svg)
![](https://forthebadge.com/images/badges/uses-css.svg)
![](https://forthebadge.com/images/badges/contains-cat-gifs.svg)
![](https://forthebadge.com/images/badges/powered-by-electricity.svg)
![](https://forthebadge.com/images/badges/makes-people-smile.svg)

[English](README.en.md)

## 特性

- 在网页中添加 Live2D 看板娘
- 轻量级，除 Live2D Cubism Core 外无其他运行时依赖
- 核心代码由 TypeScript 编写，易于集成

<img src="demo/screenshots/screenshot-2.png" width="280"><img src="demo/screenshots/screenshot-3.png" width="280"><img src="demo/screenshots/screenshot-1.png" width="270">

*注：以上人物模型仅供展示之用，本仓库并不包含任何模型。*

你也可以查看示例网页：

- 在 [米米的博客](https://zhangshuqiao.org) 的左下角可查看效果
- [demo/demo.html](https://live2d-widget.pages.dev/demo/demo)，展现基础功能
- [demo/login.html](https://live2d-widget.pages.dev/demo/login)，仿 NPM 的登陆界面

## 使用

如果你是小白，或者只需要最基础的功能，那么只用将这一行代码加入 html 页面的 `head` 或 `body` 中，即可加载看板娘：

```html
<script src="https://Nahida_moe.pages.dev/autoload.js"></script>
```

添加代码的位置取决于你的网站的构建方式。例如，如果你使用的是 [Hexo](https://hexo.io)，那么需要在主题的模版文件中添加以上代码。对于用各种模版引擎生成的页面，修改方法类似。  
如果网站启用了 PJAX，由于看板娘不必每页刷新，需要注意将该脚本放到 PJAX 刷新区域之外。

**但是！我们强烈推荐自己进行配置，让看板娘更加适合你的网站！**  
如果你有兴趣自己折腾的话，请看下面的详细说明。

## 配置

你可以对照 `dist/autoload.js` 的源码查看可选的配置项目。`autoload.js` 会自动加载两个文件：`waifu.css` 和 `waifu-tips.js`。`waifu-tips.js` 会创建 `initWidget` 函数，这就是加载看板娘的主函数。`initWidget` 函数接收一个 Object 类型的参数，作为看板娘的配置。以下是配置选项：

| 选项 | 类型 | 默认值 | 说明 |
| - | - | - | - |
| `waifuPath` | `string` | `dist/waifu-tips.json` | 看板娘资源路径(消息文本与模型列表) |
| `cdnPath` | `string` | 无 | 外部模型 API 路径(可选) |
| `cubism2Path` | `string` | `dist/live2d.min.js` | Cubism 2 Core 路径 |
| `cubism5Path` | `string` | 官方 CDN | Cubism 5 Core 路径 |
| `modelId` | `number` | `0` | 默认模型 id |
| `tools` | `string[]` | 全部 7 个工具 | 加载的小工具按钮 |
| `drag` | `boolean` | `false` | 支持拖动看板娘 |
| `size` | `number` | `400` | 画布显示尺寸(CSS 像素) |
| `showToggleAfterQuit` | `boolean` | `true` | 点击关闭后是否显示重新唤起按钮 |
| `forceDefaultModel` | `boolean` | `true` | 每次加载忽略本地缓存,强制使用默认模型 |
| `tapCountHide` | `object` | `null` | 连点身体 N 次隐藏看板娘一段时间(彩蛋),含 `count`/`expression`/`hideDuration`/`resetParameters` |
| `logLevel` | `string` | `error` | 日志等级,支持 `error`，`warn`，`info`，`trace` |

本仓库所有行为配置(`tools`、`logLevel`、`size`、`drag`、`tapCountHide` 等)统一维护在根目录 `widget.config.json`,`dist/autoload.js` 由它自动生成,本地调试与部署使用同一份配置。

## 模型仓库

本仓库中并不包含任何模型，需要单独配置模型仓库，并通过 `cdnPath` 选项进行设置。  
旧版本的 `initWidget` 函数支持 `apiPath` 参数，这要求用户自行搭建后端，可以参考 [live2d_api](https://github.com/fghrsh/live2d_api)。后端接口会对模型资源进行整合并动态生成 JSON 描述文件。自 1.0 版本起，相关功能已通过前端实现，因此不再需要专门的 `apiPath`，所有模型资源都可通过静态方式提供。只要存在 `model_list.json` 和模型对应的 `textures.cache`，即可支持换装等功能。

## 开发

本仓库的目录结构如下:

- `src` — 引擎 TypeScript 源码,其中:
  - `src/ui/` — **UI 层**(DOM 模板 + 样式 + 契约),引擎只通过 `src/ui/contracts.ts` 定义的接口操作 DOM,与具体样式解耦。**自定义 UI 只需修改此目录,引擎零改动**;
  - `src/widget.ts` — 初始化与事件监听;
  - `src/model.ts` — 模型加载管理(Cubism 2 / 5 自动识别);
  - `src/message.ts` — 气泡消息与优先级;
  - `src/tools.ts` — 工具栏工具注册表;
  - `src/cubism2/`、`src/cubism5/` — 两种 Cubism 版本的渲染封装;
- `src/waifu-tips.json` — 消息文本与模型列表;
- `widget.config.json` — **唯一行为配置**,本地与部署同源;
- `scripts/` — 工具脚本(下载 SDK / 生成 autoload / 压缩模型);
- `dist/` — **构建产物,全部自动生成,不要手动修改**;
- `model/` — 模型文件;
- `demo/` — 部署后的示例页面。

### 环境准备(仅首次)

需要 Node.js(推荐 25,仓库提供 `.nvmrc` 锁定版本)与 npm。

```bash
npm install
npm run setup    # 自动下载解压 Cubism SDK for Web 5(受许可限制,SDK 不随仓库分发)
```

### 本地调试

```bash
npm run dev
```

一条命令启动 Vite dev server(默认 `http://127.0.0.1:5173/`),HMR 热更新,修改 `src/` 或 `src/ui/waifu.css` 即时生效。模型与 SDK Core 均走本地路径,无需外网。

### 构建与提交前验证

```bash
npm run check        # 一键验证:tsc 类型检查 + eslint + build,提交前必跑
npm run build        # 类型检查 + 打包,产出 dist/
npm run preview      # 本地预览构建产物
```

`dist/autoload.js` 由 `scripts/gen-autoload.mjs` 根据 `widget.config.json` 生成,并注入当前 git commit hash(部署后浏览器控制台可见 `[Live2D Widget] build <hash>`,可用来确认线上版本),`waifu-tips.js` 由 Vite 打包 —— **dist 中没有任何手改文件**。

### 模型压缩(可选)

本仓库的模型已使用 2048px 纹理(仓库约 5 MB)。如果你拿到了新的高分辨率模型,可以压缩以加快加载:

```bash
npm run compress-model    # 生成 model/Nahida-compact/(纹理降至 2048px,约 1.5 MB)
```

注意 `model/Nahida-compact/` 为生成目录,已在 `.gitignore` 中,CF 云端构建无法访问它 —— 若要用压缩版部署,请**原地替换** `model/Nahida/` 下的纹理文件并提交。

## 部署

在本地完成修改后,将改动推送到 GitHub,即可自动部署(见下文 Cloudflare Pages)。本地调试与线上部署使用**同一个** `dist/autoload.js` 与同一份 `widget.config.json`,无需手动同步任何配置。

### 使用 Cloudflare Pages(唯一方式)

**方式一:面板直连(零配置,推荐)**

1. 在 [Cloudflare Pages](https://pages.cloudflare.com) 创建新项目,连接你的 GitHub 仓库;
2. 项目名填 `Nahida_moe`,构建命令填 `npm ci && npm run setup && npm run build`,输出目录填 `dist`;
3. 每次 `git push` 自动构建部署。

**方式二:GitHub Actions**

仓库已附带 `.github/workflows/pages.yml`(项目名已配置为 `Nahida_moe`,Node 25),只需在 GitHub 仓库设置中添加两个 Secrets:`CLOUDFLARE_API_TOKEN`(Pages 权限)与 `CLOUDFLARE_ACCOUNT_ID`,之后每次 `git push` 自动部署。注意两种方式**二选一**,面板直连模式下请删除 `pages.yml` 避免重复部署。

部署完成后,在你的网页中加入一行即可加载看板娘:

```html
<script src="https://Nahida_moe.pages.dev/autoload.js"></script>
```

### 如何保证「本地调试结果 = 线上结果」

本地与线上消费的是**同一份输入**(git 中的源码、`widget.config.json`、`src/waifu-tips.json`、`model/`),执行的是**同一个构建命令**(`npm run build`),依赖由 `package-lock.json` 锁定,Node 版本由 `.nvmrc` 锁定 —— 因此不需要任何手动同步。

日常迭代流程:

```bash
# 1. 修改代码,npm run dev 即时预览
# 2. 一键验证(类型 + lint + 构建)
npm run check
# 3. 确认没有遗漏的修改(尤其是 model/、widget.config.json)
git status
# 4. 推送,云端自动构建部署
git add -A && git commit -m "..." && git push
```

推送后 GitHub Actions 显示绿勾 = 云端构建成功;部署后浏览器控制台会打印 `[Live2D Widget] build <commit hash>`,与本地 `git log -1 --format=%h` 对比即可确认线上是最新代码。

### Self-host

把 `dist/` 目录上传到你的服务器即可。在要添加看板娘的界面加入:

```html
<script src="https://example.com/path/to/live2d-widget/dist/autoload.js"></script>
```

`autoload.js` 会自动探测自身所在目录,加载同目录下的 `waifu.css`、`waifu-tips.js` 等文件;模型路径(以 `/` 开头)会自动补全为仓库根路径,因此可以放在站点的任意子路径下。

## 鸣谢

<a href="https://www.browserstack.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" height="80" srcset="https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780">
    <source media="(prefers-color-scheme: light)" height="80" srcset="https://live.browserstack.com/images/opensource/browserstack-logo.svg">
    <img alt="BrowserStack Logo" height="80" src="https://live.browserstack.com/images/opensource/browserstack-logo.svg">
  </picture>
</a>

> 感谢 BrowserStack 容许我们在真实的浏览器中测试此项目。  
> Thanks to [BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test in real browsers!

<a href="https://www.jsdelivr.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" height="80" srcset="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/white/svg/jsdelivr-logo-horizontal.svg">
    <source media="(prefers-color-scheme: light)" height="80" srcset="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/default/svg/jsdelivr-logo-horizontal.svg">
    <img alt="jsDelivr Logo" height="80" src="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/default/svg/jsdelivr-logo-horizontal.svg">
  </picture>
</a>

> 感谢 jsDelivr 提供的 CDN 服务。  
> Thanks jsDelivr for providing public CDN service.

感谢 fghrsh 提供的 API 服务。

感谢 [一言](https://hitokoto.cn) 提供的语句接口。

点击看板娘的纸飞机按钮时，会出现一个彩蛋，这来自于 [WebsiteAsteroids](http://www.websiteasteroids.com)。

## 更多

代码自这篇博文魔改而来：  
https://www.fghrsh.net/post/123.html

更多内容可以参考：  
https://nocilol.me/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02  
https://github.com/guansss/pixi-live2d-display

更多模型仓库：  
https://github.com/zenghongtu/live2d-model-assets

除此之外，还有桌面版本：  
https://github.com/TSKI433/hime-display  
https://github.com/amorist/platelet  
https://github.com/akiroz/Live2D-Widget  
https://github.com/zenghongtu/PPet  
https://github.com/LikeNeko/L2dPetForMac

以及 Wallpaper Engine：  
https://github.com/guansss/nep-live2d

Live2D 官方网站：  
https://www.live2d.com/en/

## 许可证

本仓库并不包含任何模型，用作展示的所有 Live2D 模型、图片、动作数据等版权均属于其原作者，仅供研究学习，不得用于商业用途。

本仓库的代码（不包括受 Live2D Proprietary Software License 和 Live2D Open Software License 约束的部分）基于 GNU General Public License v3 协议开源  
http://www.gnu.org/licenses/gpl-3.0.html

Live2D 相关代码的使用请遵守对应的许可：

Live2D Cubism SDK 2.1 的许可证：  
[Live2D SDK License Agreement (Public)](https://docs.google.com/document/d/10tz1WrycskzGGBOhrAfGiTSsgmyFy8D9yHx9r_PsN8I/)

Live2D Cubism SDK 5 的许可证：  
Live2D Cubism Core は Live2D Proprietary Software License で提供しています。  
https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_cn.html  
Live2D Cubism Components は Live2D Open Software License で提供しています。  
https://www.live2d.com/eula/live2d-open-software-license-agreement_cn.html

## 更新日志

2025年起,本项目重构了开发与部署流程:

- UI 与引擎解耦:引擎只依赖 `src/ui/contracts.ts` 定义的契约,自定义 UI 只需修改 `src/ui/`;
- 构建链迁移至 Vite:`npm run dev` 一条命令本地调试(HMR),`npm run build` 全自动产出 `dist/`(含 `autoload.js` 生成、静态资源拷贝),dist 不再有任何手改文件;
- 行为配置统一到根目录 `widget.config.json`,本地与部署同源;
- 部署迁移至 Cloudflare Pages(项目 `Nahida_moe`),`git push` 即发布,不再需要手动打 tag 与刷新 CDN;
- 提供 `npm run compress-model` 纹理压缩脚本,仓库模型已瘦身至 ~5 MB;
- `npm run check` 一键验证(tsc + eslint + build),`.nvmrc` 锁定 Node 25,`autoload.js` 注入 commit hash 便于核对线上版本。

2020年1月1日起，本项目不再依赖于 jQuery。

2022年11月1日起，本项目不再需要用户单独加载 Font Awesome。
