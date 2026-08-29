# WebCreate · 专业级 Web 端手绘创作与动画导出工具

> 在浏览器里手绘、套模板、让 AI 起稿，一键导出 PNG / GIF / WebM / MP4。
> 配套 CLI 可把 JSON 关键帧批量渲染为图片或视频。

<p align="center">
  <img src="docs/assets/01-welcome.png" alt="WebCreate 欢迎页" width="920" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Private-lightgrey?style=flat-square" alt="License" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white&style=flat-square" alt="Node 22+" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white&style=flat-square" alt="React 19" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite 6" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript 5.8" /></a>
  <img src="https://img.shields.io/badge/roughjs-hand%20drawn-orange?style=flat-square" alt="roughjs hand drawn" />
  <img src="https://img.shields.io/badge/Playwright-CLI%20export-2EAD33?logo=playwright&logoColor=white&style=flat-square" alt="Playwright CLI" />
</p>

## 📑 目录

- [一句话简介](#一句话简介)
- [演示截图与录屏](#演示截图与录屏)
- [核心能力](#核心能力)
- [工具集（13 种）](#工具集13-种)
- [AI 智能绘图](#ai-智能绘图)
- [模板库与动画模板](#模板库与动画模板)
- [快速开始](#快速开始)
- [CLI 命令行工具](#cli-命令行工具)
- [CLI 真实导出演示](#cli-真实导出演示非模拟)
- [项目架构](#项目架构)
- [常见问题 FAQ](#常见问题-faq)
- [关键词索引（SEO / GEO）](#关键词索引seo--geo)
- [License](#license)

---

## 🎯 一句话简介

**WebCreate** 是一款开箱即用的 **Web 端手绘风格创作工具**，集 **画布编辑器 + 模板库 + AI 起稿 + 物理动画 + 多端导出** 于一身：

- 编辑器基于 React 19 + Vite 6 + roughjs，**手绘风格笔触 + 压力感应自由绘图**
- 内置 **133 套静态模板 + 22 套动画模板**，覆盖社交配图、卡片、贺卡、漫画、数据图等场景
- 集成 **OpenAI 兼容 / Ollama / 自定义 / 内置演示** 4 种 AI 服务，文字描述即可起稿
- 配套 **Playwright CLI**，把 JSON 关键帧渲染为 **PNG / GIF / WebM / MP4**，便于自动化产出

**适用场景**：社交媒体运营配图、产品草图、教学插画、漫画分镜、动画短视频、批量视频工厂、AI 配图流水线。

---

## 🖼 演示截图与录屏

### 工作区 · 三栏布局（左侧图层面板 / 中央画布 / 右侧工具栏）

![WebCreate 三栏工作区](docs/assets/02-studio.png)

### 模板库 · 133 套精选

![WebCreate 模板库](docs/assets/03-templates.png)

### AI 智能绘图 · 自然语言起稿

![WebCreate AI 智能绘图](docs/assets/05-ai-draw.png)

### AI 服务配置 · 多 Provider

![WebCreate AI 服务配置](docs/assets/06-ai-settings.png)

### 图层 + 画笔 + 颜色面板

![WebCreate 图层与画笔面板](docs/assets/08-panels.png)

### 录屏：从空白画布到手绘笔触

[▶ 在 GitHub 查看录屏（docs/assets/09-demo-draw.webm）](docs/assets/09-demo-draw.webm)

> 浏览器无法直接播放 webm？请把视频下载到本地，用 VLC / PotPlayer 打开。

---

## ✨ 核心能力

| 模块 | 关键能力 |
|------|---------|
| **画布编辑** | 无限画布、缩放 / 移动 / 撤销重做、图层管理、对齐与吸附 |
| **手绘渲染** | roughjs 引擎 + `fillStyle: hachure / cross-hatch / solid / none`、可调 `roughness` 让笔触更"糙"或更"工整" |
| **自由绘图** | perfect-freehand 笔压感知，支持 `points: [[x, y, pressure], ...]` 三元组数据 |
| **GIF 动图** | 客户端 gif.js 编码，多图层顺序播放，无需服务端 |
| **物理动画** | 33 种 easing（spring / gravity / easeOutBack / easeOutBounce ...），支持 stagger 错峰、关键帧插值 |
| **AI 起稿** | 一句话生成图（OpenAI 兼容 + Ollama + 自定义 + 演示四种模式），画笔粗细 + 主题精修 |
| **模板套用** | 133 套静态模板 + 22 套动画模板，分类筛选 + 实时搜索 + 一键套用编辑 |
| **CLI 批量导出** | 把 JSON 关键帧批量渲染为图片 / 视频 / GIF，CI / 自动化集成 |
| **项目管理** | localStorage 持久化，未命名 / 已保存状态、撤销历史 |

---

## 🛠 工具集（13 种）

源码位置：`components/Toolbar/Toolbar.tsx`，`types.ts` 中 `ToolType` 枚举。

| ID | 名称 | 用途 |
|----|------|------|
| `hand` | 移动画布 | 拖动画布视野 |
| `brush` | 绘画 | 自由手绘（笔压感知） |
| `eraser` | 擦除 | 元素擦除 |
| `fill` | 填充 | 区域颜色填充 |
| `text` | 文本 | 文字元素（含 Virgil 等手绘字体） |
| `image` | 图片 | 上传 / 引用图片元素 |
| `selection` | 选区 | 选择 / 变换 / 旋转元素 |
| `rectangle` | 矩形 | roughjs 手绘矩形 |
| `ellipse` | 圆形 | roughjs 手绘椭圆 |
| `diamond` | 菱形 | roughjs 手绘菱形 |
| `line` | 线条 | 手绘线段 |
| `arrow` | 箭头 | 带箭头的连接线 |
| — | 颜色 / 画笔 / 图层面板 | 左侧三栏辅助面板 |

---

## 🤖 AI 智能绘图

- **多 Provider 一键切换**：内置演示、OpenAI 兼容、Ollama（本地）、自定义 API 端点
- **预设 Provider**：`GPT-4o`、`DeepSeek`、`SiliconFlow 硅基流动`、`智谱 GLM-4-Flash`、`Ollama qwen2.5:7b` 等
- **API Key 存储位置**：`localStorage[webcreate_ai_config]`（**不写入任何文件 / 仓库**，仅本机浏览器内可见）
- **请求参数**：`temperature` / `maxTokens` / `customHeaders` 可调
- **主题精修**：内置 6 个常用主题（小房子、日落风景、花朵、小猫、山水、火箭），画笔粗细 1-5 档可调

> 🔒 安全提示：**所有 API Key 走 localStorage，不会被提交到仓库，也不会被任何 AI 供应商之外的第三方记录。**

---

## 📚 模板库与动画模板

- **静态模板（133 套）**：社交配图、贺卡、漫画、心情卡、日记手帐、励志卡、心愿卡、节日卡 ……
- **动画模板（22 套）**：基于物理引擎的关键帧动画，效果丝滑自然
- **分类筛选**：全部 / 社交配图 / 贺卡 / 日记手帐 / 趣味 / 商务
- **搜索**：模糊匹配标题 + 标签

---

## 🚀 快速开始

> 前置环境：**Node.js ≥ 22**、**pnpm ≥ 9**、**Git**。
> 中国大陆用户建议先配置 `pnpm` 与 `playwright` 国内镜像（见下方说明）。

```bash
# 1. 克隆
git clone https://github.com/Person-HE/webcreate.git
cd webcreate

# 2. 安装依赖（pnpm 优先）
npm install -g pnpm          # 首次安装 pnpm
pnpm install

# 3. 安装 Playwright 浏览器内核（CLI 导出依赖）
pnpm exec playwright install chromium
```

### 启动开发服务器

```bash
pnpm dev
# → http://localhost:3000
```

打开浏览器，访问 [http://localhost:3000](http://localhost:3000)。三栏工作区即开即用。

### 构建生产版本

```bash
pnpm build       # 静态资源 → dist/
pnpm preview     # 本地预览生产构建
```

### 中国大陆用户镜像加速

```bash
# pnpm 国内镜像
pnpm config set registry https://registry.npmmirror.com

# Playwright 浏览器下载镜像
# Windows PowerShell
$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://npmmirror.com/mirrors/playwright"
pnpm exec playwright install chromium

# macOS / Linux
PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright pnpm exec playwright install chromium
```

---

## ⌨️ CLI 命令行工具

WebCreate 提供名为 **`webcreate`** 的命令行工具，基于 **Playwright** 把 JSON 关键帧渲染为图片 / 视频 / GIF。完整 AI 调用指南见 [`cli/AI-GUIDE.md`](cli/AI-GUIDE.md)。

### 用法

```bash
# 在项目根目录
pnpm cli         # 等价于 build:cli + node cli/bin.js

# 或直接调用
node cli/bin.js image <input.json> -o out.png  [-w 1920 -h 1080 -b "#ffffff"]
node cli/bin.js video <input.json> -o out.webm --fps 24 -d 3
node cli/bin.js gif   <input.json> -o out.gif  [-d 秒数]
```

### 命令清单

| 命令 | 用途 | 关键参数 |
|------|------|---------|
| `image` | 把 JSON 第一个可见图层导出为图片 | `-f png\|jpeg\|webp`（默认 png） |
| `video` | 把 JSON 多个图层导出为视频 | `--fps 24` `-d 2`（秒） |
| `gif` | 把 JSON 多图层导出为 GIF | `-d 2`（秒） |

### 输入 JSON 模板

```jsonc
{
  "canvasWidth": 1280,
  "canvasHeight": 800,
  "backgroundColor": "#fef9ec",
  "layers": [
    {
      "id": "l1", "name": "main", "visible": true,
      "elements": [
        {
          "id": "唯一id必须",
          "type": "rectangle | ellipse | diamond | line | arrow | free_draw | text | image",
          "x": 0, "y": 0, "width": 100, "height": 100,
          "angle": 0,
          "strokeColor": "#57534e",
          "backgroundColor": "#fef3c7",
          "fillStyle": "hachure | cross-hatch | solid | none",
          "strokeWidth": 3,
          "strokeStyle": "solid | dashed | dotted",
          "roughness": 1.4, "seed": 42,
          "opacity": 100, "cornerRadius": 12,
          "strokeSharpness": "round", "layerId": "l1",
          "text": "文字内容（text 类型）",
          "fontSize": 32, "fontFamily": "Virgil",
          "textAlign": "left | center | right",
          "points": [[x, y, 笔压], ...]   // free_draw 绝对坐标
        }
      ]
    }
  ],
  "animationConfig": {
    "fps": 24, "duration": 2,
    "easingConfig": {
      "position": "easeInOutCubic | spring | gravity | easeOutBounce | ... 33种",
      "scale": "easeOutBack",
      "rotation": "easeInOutCubic",
      "opacity": "easeInOutSine",
      "springConfig": { "mass": 1, "stiffness": 170, "damping": 12 },
      "gravityConfig": { "gravity": 9.8, "bounceRestitution": 0.5 },
      "stagger": { "enabled": true, "delayPerElement": 0.08, "maxDelay": 0.4 }
    }
  }
}
```

### 风格速查

| 风格 | 关键参数 |
|------|---------|
| 手绘插画 | `roughness 1.2-2.2` + `hachure / cross-hatch` 填充 + `Virgil` 字体 |
| 漫画 | 黑色粗边框分格 + 几何角色 + 椭圆气泡 + Virgil 文字 |
| 图表 | 矩形柱体 + `line` 折线 + `ellipse` 环形 + 图例色块 |
| 速写笔迹 | `free_draw` + `strokeWidth 8-16`（笔压取 `points` 第三位） |
| 透明底 | `backgroundColor: "transparent"`，输出 `png` / `webp` |

### 动画速查

- **视频/动图**：`layers` 即关键帧（首层=起点，末层=终点），同 `id` 元素自动插值
- **弹跳落地**：`position: "gravity"` + `gravityConfig`
- **弹性过冲**：`position/scale: "spring"` 或 `easeOutBack` / `easeOutElastic`
- **依次出现**：`stagger.enabled: true` + `delayPerElement`
- **多于 2 层**时按层序分段插值（逐帧动画）
- **ffmpeg 回退**：本机无完整 ffmpeg 时输出 `.webm`（自动回退）；装 ffmpeg 后可输出 `.mp4`

---

## 🎬 CLI 真实导出演示（非模拟）

> 以下均为 **CLI 实际运行产物**，由 `node cli/bin.js ...` 从 JSON 关键帧渲染生成，未做任何后期修饰。

### 静态导出（PNG · roughjs 手绘风）

| 数据图表 | 漫画分镜 | 自由笔触 |
|----------|----------|----------|
| ![手绘数据图表](docs/assets/cli-demo/charts.png) | ![手绘漫画分镜](docs/assets/cli-demo/comic-panels.png) | ![自由笔触](docs/assets/cli-demo/freehand.png) |

| 房屋插画 | 多图层合成 | 透明底导出 |
|----------|-----------|-----------|
| ![手绘房屋插画](docs/assets/cli-demo/illu-house.png) | ![多图层合成](docs/assets/cli-demo/multilayer.png) | ![透明底 PNG](docs/assets/cli-demo/transparent.png) |

### 动画导出（GIF · 客户端 gif.js 编码）

![动画示例 anim1](docs/assets/cli-demo/anim1.gif)
![综合导出校验 final-check](docs/assets/cli-demo/final-check.gif)

### 高清动画（WebM · 物理引擎驱动）

- [▶ 物理弹跳 gravity（physics-bounce.webm）](docs/assets/cli-demo/physics-bounce.webm)
- [▶ 弹簧形变 spring（morph-spring.webm）](docs/assets/cli-demo/morph-spring.webm)

> 这些素材由仓库内 `outputs/test/` 下的 JSON（如 `charts.json`、`comic-panels.json`、`anim1.json`）经 CLI 导出得到，可作为你自己的输入输出范例参考。

---

## 🏗 项目架构

```
webcreate/
├── App.tsx                      # 应用根组件（路由 / 模态状态）
├── index.tsx                    # 应用入口
├── store.tsx                    # 全局状态管理
├── types.ts                     # 元素 / 工具 / 图层 / 笔刷类型定义
├── metadata.json                # 元数据
│
├── components/                  # 14 个 React 组件
│   ├── Layout/                  # Header / SidebarLeft / Footer
│   ├── Canvas/CanvasBoard.tsx   # 主画布（roughjs + perfect-freehand）
│   ├── Panels/                  # 图层 / 画笔 / 颜色面板
│   ├── Toolbar/Toolbar.tsx      # 13 种工具栏
│   ├── WelcomeScreen.tsx        # 欢迎页
│   ├── AIDrawModal.tsx          # AI 智能绘图弹窗
│   ├── AISettingsModal.tsx      # AI 服务配置弹窗
│   ├── TemplateModal.tsx        # 静态模板库
│   ├── AnimationTemplateModal.tsx # 动画模板库
│   └── ProjectManagerModal.tsx  # 项目管理
│
├── services/                    # 4 个服务模块
│   ├── aiClient.ts              # AI HTTP 客户端
│   ├── aiConfig.ts              # AI Provider 配置 / 预设
│   ├── aiPromptBuilder.ts       # AI 提示词构造器
│   └── aiService.ts             # AI 业务封装
│
├── data/                        # 内置数据
│   ├── templates.ts             # 133 套静态模板
│   └── animationTemplates.ts    # 22 套动画模板
│
├── utils/                       # 5 个工具函数
│   ├── elementTransformers.ts   # 元素变换
│   ├── exportGif.ts             # GIF 导出
│   ├── physicsAnimation.ts      # 物理动画引擎
│   ├── renderScene.ts           # 场景渲染
│   └── tweenAnimation.ts        # 缓动动画引擎（33 种 easing）
│
├── cli/                         # CLI 命令行工具
│   ├── bin.js                   # CLI 入口（shebang: #!/usr/bin/env node）
│   ├── index.ts                 # CLI 启动器
│   ├── export-image.ts          # 图片导出
│   ├── export-video.ts          # 视频导出
│   ├── export-gif.ts            # GIF 导出
│   ├── renderer.ts              # Playwright 渲染引擎
│   ├── render-page.ts           # 渲染页面
│   ├── types.ts / utils.ts
│   ├── public/                  # 渲染用静态资源
│   ├── AI-GUIDE.md              # AI 调用指南（JSON 模板 / 风格速查）
│   └── render.html
│
├── docs/                        # 文档
│   └── assets/                  # README 演示截图与录屏
│
├── vite.config.ts               # Vite 主配置
├── vite.cli.config.ts           # Vite CLI 配置
├── tsconfig.json
├── vercel.json                  # Vercel 部署（SPA 路由回退）
├── package.json
├── package-lock.json
├── .gitignore
└── README.md / README.en.md     # 本文件 / 英文版
```

**关键依赖**：

| 库 | 用途 |
|----|------|
| `react 19` + `react-dom 19` | 最新 React 主版本 |
| `roughjs 3` | 手绘风格图形渲染 |
| `perfect-freehand 1.2` | 笔压感知自由绘图 |
| `gif.js 0.2` | 客户端 GIF 编码 |
| `lucide-react` | SVG 图标 |
| `uuid 13` | 唯一标识符 |
| `playwright 1.50` | CLI 浏览器自动化 |
| `vite 6` + `@vitejs/plugin-react 5` | 构建工具 |
| `typescript 5.8` | 类型系统 |

---

## ❓ 常见问题 FAQ

<details>
<summary><b>Q1: 启动 <code>pnpm dev</code> 提示端口 3000 被占用？</b></summary>

WebCreate 默认监听 3000。如被占用：

```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :3000
kill -9 <PID>
```

或修改 `vite.config.ts` 中的 `server.port`。
</details>

<details>
<summary><b>Q2: Playwright 浏览器下载失败 / 超时？</b></summary>

详见 [中国大陆用户镜像加速](#中国大陆用户镜像加速)。最稳的兜底：

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install
pnpm exec playwright install chromium
```
</details>

<details>
<summary><b>Q3: CLI 导出报 <code>browser not found</code>？</b></summary>

同上，安装 Chromium 即可：

```bash
pnpm exec playwright install chromium
```
</details>

<details>
<summary><b>Q4: AI 绘图不响应 / 报 401？</b></summary>

打开工作区 → 顶栏 **AI 绘图** → 右上角齿轮 → 切到 **OpenAI / Ollama / 自定义** → 填入正确的 `apiUrl` 和 `apiKey` → 保存。

API Key 存于 `localStorage`，**不会写入任何文件**。
</details>

<details>
<summary><b>Q5: 视频导出没有声音 / 没有 MP4？</b></summary>

CLI 默认按本机能力回退：装好 `ffmpeg` 后会自动输出 `.mp4`，否则输出 `.webm`（所有现代浏览器均支持）。
</details>

<details>
<summary><b>Q6: pnpm 提示 <code>ERR_PNPM_PEER_DEP_ISSUE</code>？</b></summary>

在项目根目录创建 `.npmrc`：

```ini
strict-peer-dependencies=false
```

然后 `pnpm install`。
</details>

<details>
<summary><b>Q7: 可以把项目部署到 Vercel / Netlify 吗？</b></summary>

可以。执行 `pnpm build` → 上传 `dist/` 即可。已附带 `vercel.json` 处理 SPA 路由回退。**注意：CLI 工具需要本地 Chromium，不能在纯静态托管中调用；可单独跑在任意 Node 机器上**。
</details>

<details>
<summary><b>Q8: 模板中的素材可以商用吗？</b></summary>

WebCreate 模板库的视觉元素（矩形 / 椭圆 / 线条 / 文字）由 roughjs 程序化生成，**不包含第三方版权素材**。你可以自由用于商业用途。
</details>

---

## 🔎 关键词索引（SEO / GEO）

> 本节用于让搜索引擎、AI 搜索（Bing / Perplexity / SearchGPT / 文心 / Kimi）、GEO 生成式引擎更精准地命中本仓库。

### 主题 / Topic

`webcreate`, `excalidraw alternative`, `tldraw alternative`, `sketch app`, `hand drawn drawing`, `手绘风格`, `白板工具`, `白板应用`, `画布编辑器`, `在线画图工具`, `web drawing tool`, `browser sketch`, `roughjs`, `perfect-freehand`, `vite drawing app`, `react canvas editor`, `excalidraw 替代`, `tldraw 替代`

### 技术栈 / Tech Stack

`React 19`, `Vite 6`, `TypeScript 5.8`, `roughjs`, `perfect-freehand`, `gif.js`, `Playwright`, `lucide-react`, `OpenAI 兼容 API`, `Ollama`, `DeepSeek`, `SiliconFlow 硅基流动`, `智谱 GLM`, `localStorage 持久化`, `手绘 SVG`, `物理动画引擎`, `33 种 easing`, `关键帧动画`, `关键帧插值`, `CLI 工具`, `Node.js 22`

### 场景 / Use Case

`社交配图生成器`, `小红书配图工具`, `公众号封面`, `B 站封面`, `抖音短视频素材`, `AI 起稿`, `AI 配图`, `漫画分镜`, `教学插画`, `产品草图`, `数据可视化手绘`, `信息图手绘`, `白板协作`, `在线白板`, `动画短视频生成`, `批量视频工厂`, `视频自动化`, `批量出图`, `keyframe animation`, `stagger animation`, `spring physics`

### 同义 / 拼写

`Excalidraw`, `tldraw`, `Figma 草图`, `Miro 替代`, `Microsoft Whiteboard`, `Whimsical`, `draw.io`, `diagrams.net`, `sketch.io`, `autodraw`, `quickdraw`, `笔画`, `手绘风`, `插画工具`, `作图工具`, `画图在线`

### 一句话定位（供 AI 搜索摘要抽取）

> WebCreate 是一款 **Web 端手绘风格画布编辑器**，集 **roughjs 手绘渲染 + perfect-freehand 笔压自由绘图 + 133 套模板 + 22 套物理动画 + AI 一句话起稿（OpenAI / Ollama / DeepSeek / 智谱） + Playwright CLI 导出 PNG / GIF / WebM / MP4** 于一身，是 **Excalidraw / tldraw 的中文友好替代品**，适合社交配图、教学插画、漫画分镜、批量视频工厂。

---

## 📜 License

Private. 仓库为个人项目，请勿未经授权使用源代码 / 品牌 / 素材。
