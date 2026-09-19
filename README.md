# WebCreate

**A hand-drawn animation studio in the browser — layers, frames, GIF/WebM export — plus a headless CLI that renders projects to video.**

[![Live demo](https://img.shields.io/badge/Live%20demo-webcreate.pages.dev-2f7cf6?style=flat-square)](https://webcreate.pages.dev)
![Templates](https://img.shields.io/badge/templates-24%20%C2%B7%2010%20animated-1a7f37?style=flat-square)
![Size](https://img.shields.io/badge/gzipped%20bundle-120%20KB-informational?style=flat-square)
![Backend](https://img.shields.io/badge/backend-none-blueviolet?style=flat-square)

Paint with pressure-aware freehand strokes and rough.js shapes, compose them on layers, animate with a timeline, and export GIF or video. Projects are stored in `localStorage`. There is no server, no account, and an AI drawing path that defaults to a local mock so the feature is testable without a key.

**→ [webcreate.pages.dev](https://webcreate.pages.dev)**

| | |
| --- | --- |
| ![Studio](docs/assets/02-studio.png) | ![Templates](docs/assets/03-templates.png) |
| Layered studio | Template library |
| ![AI draw](docs/assets/05-ai-draw.png) | ![Panels](docs/assets/08-panels.png) |

Motion samples: [`09-demo-draw.webm`](docs/assets/09-demo-draw.webm) ·
[`10-demo-animation.webm`](docs/assets/10-demo-animation.webm) ·
[`cli-demo/`](docs/assets/cli-demo)

## Capabilities

- **Painting** — freehand with pressure taper, eraser, fill, text, image, selection, and shape primitives (rect, circle, diamond, line, arrow).
- **Layers** — blend modes (`multiply`, `normal`, …), per-layer opacity and visibility, reordering, per-layer export.
- **Animation** — frame timeline, preview playback, animated template library.
- **Templates** — 24 static + 10 animated starting points (`node scripts/count-templates.mjs`).
- **AI drawing** — pluggable provider; ships in mock mode, point it at a compatible endpoint if you want real generation.
- **CLI rendering** — drive the same canvas through Playwright to produce GIF / WebM / MP4 without opening the UI.

## Measured, not claimed

`npm run metrics` builds, walks the output, records the machine, and writes `docs/metrics.json`.

| Metric | Value |
| --- | --- |
| Clean build | 13.1 s |
| Build output | 3 files · 0.44 MB raw · **0.12 MB gzip** |
| Largest chunk | `assets/index-*.js` — 449 KB raw / 130 KB gzip |
| Source | 60 files · 13,633 lines (11,672 code) |
| Direct dependencies | 13 (7 runtime, 6 dev) |
| Templates | 24 static + 10 animated |

Live behaviour, cold cache, real browser, deployed site:

| Metric | Value |
| --- | --- |
| TTFB | 742 ms |
| `load` event | **5.09 s** |
| First-page transfer | ~126 KB |
| DOM after mount | 1 canvas · 50 buttons · 48 SVG icons |

That 5.09 s is a real problem and it is explained below, not hidden.

## Known performance problem

`index.html` loads `https://cdn.tailwindcss.com` — Tailwind's JIT runtime, which the
provider explicitly says is not for production. It downloads and executes a compiler
in the page, blocks first paint, and adds the CDN as a hard availability dependency.
The same file also declares an `esm.sh` import map for React and lucide-react, but the
bundle already inlines them, so those entries are dead weight.

Net effect: a 120 KB gzip application is carried by a render-blocking third-party
runtime. Fixing this is the single highest-leverage change in the repo — install
Tailwind as a Vite/PostCSS plugin and delete the import map. Until then, treat the
hosted demo as functional but slow to first paint, and expect it to fail if that CDN
is unreachable from your network.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run metrics  # docs/metrics.json + docs/metrics.md
```

Headless rendering:

```bash
npm run cli -- image   <project> -o frame.png
npm run cli -- video   <project> -o clip.webm
# requires Playwright's browser:  npx playwright install chromium
```

## Layout

```
App.tsx, components/   studio UI: canvas, layers, timeline, toolbar
services/              AI provider config (mock by default)
store.tsx              project state, localStorage persistence
data/                  template library
cli/                   Playwright-driven renderer (bin.js, render.html)
docs/assets/           screenshots and demo clips used above
scripts/               counters, capture helpers, metrics collector
```

## Honest gaps

- **No automated tests.**
- Render-blocking third-party CSS runtime in production (detailed above).
- Persistence is `localStorage` only: no file export/import round-trip for projects beyond what the CLI offers, and clearing site data loses work.
- Screens and templates are Chinese-labelled.
- The `docs/assets` media in this repo adds ~2.4 MB to the checkout.

## 中文说明

WebCreate 是浏览器内的手绘动画工坊：压感笔迹、rough.js 形状、图层混合模式、逐帧动画时间轴、GIF / WebM / MP4 导出，并提供一套基于 Playwright 的无头 CLI，可在不开 UI 的情况下把工程渲染成视频。作品保存在 `localStorage`，无账号、无后端；AI 绘图默认走 mock 模式，可自行替换为兼容端点。

- 在线体验：<https://webcreate.pages.dev>
- 模板：24 静态 + 10 动画；构建产物仅 0.12 MB（gzip）
- **必须提醒**：`index.html` 目前使用 Tailwind 官方禁止用于生产环境的 CDN 运行时，且存在无效的 esm.sh import map，导致首屏 `load` 达 5.09 s。这是当前最该修的性能问题，修复方式是改用 Vite/PostCSS 插件并删除 import map。
- 数据复现：`npm run metrics` → `docs/metrics.json`

## License

All rights reserved.
