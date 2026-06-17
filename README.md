# WebCreate

<p align="center">
  <strong>专业级 Web 绘图与动画创作工具</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React Version">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/Vite-6-orange" alt="Vite Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## 简介

WebCreate 是一款功能强大的 Web 端绘图与动画创作工具，支持手绘风格图形绘制、AI 智能绘图、帧动画制作、物理引擎动画等多种功能。基于 React + TypeScript 构建，采用 Vite 作为构建工具，提供流畅的创作体验。

## 主要特性

### 绘图功能
- **手绘风格渲染**：基于 RoughJS 引擎，生成自然的手绘风格图形
- **多种元素类型**：矩形、椭圆、菱形、直线、箭头、文本、自由绘制、图片
- **图层管理**：支持图层的增删改查、透明度调节、混合模式设置
- **丰富的画笔工具**：铅笔、马克笔、喷枪等多种画笔类型

### AI 智能绘图
- **多平台支持**：兼容 OpenAI、DeepSeek、智谱 GLM、硅基流动等主流 API
- **本地部署**：支持 Ollama 本地模型部署，保护数据隐私
- **高质量提示词**：基于开发文档自动生成结构化提示词，确保输出质量
- **灵活配置**：用户可自定义 API 地址、模型、温度参数等

### 动画系统
- **帧动画**：支持多帧动画制作，可设置帧率和播放控制
- **补间动画**：自动计算中间帧，平滑过渡
- **物理引擎**：内置物理动画系统，支持重力、碰撞等效果
- **洋葱皮**：可视化显示前后帧，方便动画制作

### 项目管理
- **项目 CRUD**：创建、切换、删除、重命名项目
- **自动保存**：每 30 秒自动保存，支持 Ctrl+S 手动保存
- **导入导出**：支持项目数据的 JSON 格式导入导出
- **项目复制**：一键复制项目，快速迭代

### 导出功能
- **GIF 动画**：导出动画为 GIF 格式
- **多格式支持**：支持多种图像格式导出

## 技术栈

- **前端框架**：React 19
- **类型系统**：TypeScript 5.8
- **构建工具**：Vite 6
- **渲染引擎**：RoughJS（手绘风格）
- **图标库**：Lucide React
- **状态管理**：React Context + useReducer
- **动画库**：自研物理动画系统

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用说明

### 基本绘图
1. 从左侧工具栏选择画笔工具
2. 在画布上绘制图形
3. 使用右侧面板调整颜色和画笔大小

### AI 绘图
1. 点击右上角"AI 绘图"按钮
2. 描述你想绘制的画面
3. AI 会自动生成手绘风格的图形
4. 可在设置中配置 AI 服务

### 项目管理
1. 点击顶部项目名称打开项目管理面板
2. 可以创建新项目、切换项目、删除项目
3. 支持导出和导入项目数据

### 动画制作
1. 切换到动画模式
2. 添加关键帧
3. 使用洋葱皮功能制作逐帧动画
4. 设置帧率和播放速度
5. 预览和导出动画

## 项目结构

```
webcreate/
├── components/          # React 组件
│   ├── Canvas/         # 画布组件
│   ├── Layout/         # 布局组件
│   └── Panels/         # 面板组件
├── services/           # 业务服务
│   ├── aiClient.ts     # AI API 客户端
│   ├── aiConfig.ts     # AI 配置
│   ├── aiPromptBuilder.ts # 提示词构建器
│   └── aiService.ts    # AI 绘图服务
├── data/              # 数据文件
├── utils/             # 工具函数
├── types.ts           # TypeScript 类型定义
├── store.tsx          # 状态管理
└── App.tsx            # 应用入口
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

## 许可证

MIT License
