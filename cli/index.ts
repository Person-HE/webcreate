#!/usr/bin/env node
import { exportImage, ExportImageArgs } from './export-image.js';
import { exportVideo, ExportVideoArgs } from './export-video.js';
import { exportGif, ExportGifArgs } from './export-gif.js';

function showHelp(): void {
  console.log(`
WebCreate CLI - 将 WebCreate JSON 导出为图片或视频

用法:
  webcreate image <input.json> [options]
  webcreate video <input.json> [options]

命令:
  image   将 JSON 的第一个可见图层导出为图片
  video   将 JSON 的多个图层导出为视频

图片选项:
  -o, --output <path>        输出路径
  -f, --format <png|jpeg|webp>  输出格式 (默认 png)
  -w, --width <number>       画布宽度 (默认 1920)
  -h, --height <number>      画布高度 (默认 1080)
  -b, --background <color>   背景色 (默认 #ffffff)

视频选项:
  -o, --output <path>        输出路径
  --fps <number>             帧率 (默认 24)
  -d, --duration <seconds>   动画时长 (默认 2)
  -w, --width <number>       画布宽度 (默认 1920)
  -h, --height <number>      画布高度 (默认 1080)
  -b, --background <color>   背景色 (默认 #ffffff)

示例:
  webcreate image scene.json -o scene.png -w 800 -h 600
  webcreate video animation.json -o anim.mp4 --fps 30 -d 3
`);
}

function parseArgs(argv: string[]): { command: string; input: string; options: Record<string, any> } {
  const [command, input, ...rest] = argv;

  if (!command || !input || ['-h', '--help'].includes(command)) {
    showHelp();
    process.exit(0);
  }

  const options: Record<string, any> = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    switch (arg) {
      case '-o':
      case '--output':
        options.output = rest[++i];
        break;
      case '-f':
      case '--format':
        options.format = rest[++i];
        break;
      case '-w':
      case '--width':
        options.width = parseInt(rest[++i], 10);
        break;
      case '-h':
      case '--height':
        options.height = parseInt(rest[++i], 10);
        break;
      case '-b':
      case '--background':
        options.backgroundColor = rest[++i];
        break;
      case '--fps':
        options.fps = parseInt(rest[++i], 10);
        break;
      case '-d':
      case '--duration':
        options.duration = parseFloat(rest[++i]);
        break;
      default:
        console.warn(`未知选项: ${arg}`);
    }
  }

  return { command, input, options };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || ['-h', '--help'].includes(args[0])) {
    showHelp();
    process.exit(0);
  }

  const { command, input, options } = parseArgs(args);

  try {
    if (command === 'gif') {
      const outputPath = await exportGif({ input, ...options } as ExportGifArgs);
      console.log(`GIF 已导出: ${outputPath}`);
    } else if (command === 'image') {
      const outputPath = await exportImage({ input, ...options } as ExportImageArgs);
      console.log(`图片已导出: ${outputPath}`);
    } else if (command === 'video') {
      const outputPath = await exportVideo({ input, ...options } as ExportVideoArgs);
      console.log(`视频已导出: ${outputPath}`);
    } else {
      console.error(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
    }
  } catch (error) {
    console.error('导出失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
