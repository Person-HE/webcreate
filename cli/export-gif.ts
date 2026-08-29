import fs from 'fs';
import path from 'path';
import { WebCreateGifInput } from './types.js';
import { withRenderer, WebCreateRenderer } from './renderer.js';
import { resolveOutputPath } from './utils.js';
import { ExcalidrawElement } from '../types';
import { AnimationEasingConfig } from '../utils/tweenAnimation';

export interface ExportGifArgs {
  input: string;
  output?: string;
  duration?: number;
  delayMs?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

function normalizeElements(elements: any[]): any[] {
  return elements.map(el => ({
    ...el,
    visible: el.visible !== false,
    locked: el.locked || false,
    opacity: typeof el.opacity === 'number' ? el.opacity : 100,
    angle: typeof el.angle === 'number' ? el.angle : 0,
    strokeWidth: typeof el.strokeWidth === 'number' ? el.strokeWidth : 2,
    roughness: typeof el.roughness === 'number' ? el.roughness : 1,
    seed: typeof el.seed === 'number' ? el.seed : Math.floor(Math.random() * 100000),
    strokeSharpness: el.strokeSharpness || 'round',
    strokeStyle: el.strokeStyle || 'solid',
    fillStyle: el.fillStyle || 'none',
    backgroundColor: el.backgroundColor || 'transparent',
    strokeColor: el.strokeColor || '#000000',
    cornerRadius: typeof el.cornerRadius === 'number' ? el.cornerRadius : 0,
  }));
}

async function buildFrames(
  renderer: WebCreateRenderer,
  input: WebCreateGifInput,
  frameCount: number
): Promise<ExcalidrawElement[][]> {
  const visibleLayers = input.layers.filter(l => l.visible !== false);
  if (visibleLayers.length < 2) {
    throw new Error('GIF 导出需要至少 2 个可见图层作为关键帧');
  }

  const easingConfig: AnimationEasingConfig = {
    ...input.animationConfig?.easingConfig,
  };

  const frames: ExcalidrawElement[][] = [];
  const framesPerSegment = Math.max(1, Math.floor(frameCount / (visibleLayers.length - 1)));
  const remainder = frameCount - framesPerSegment * (visibleLayers.length - 1);

  for (let i = 0; i < visibleLayers.length - 1; i++) {
    const startElements = normalizeElements(visibleLayers[i].elements);
    const endElements = normalizeElements(visibleLayers[i + 1].elements);
    const segmentFrames = i < remainder ? framesPerSegment + 1 : framesPerSegment;
    const tweenFrameCount = i === visibleLayers.length - 2 ? segmentFrames - 1 : segmentFrames;

    if (tweenFrameCount <= 0) {
      frames.push(startElements);
      continue;
    }

    const tweenFrames = await renderer.generateTweenFrames(
      startElements,
      endElements,
      tweenFrameCount,
      easingConfig
    );
    frames.push(...tweenFrames);
  }

  frames.push(normalizeElements(visibleLayers[visibleLayers.length - 1].elements));
  return frames;
}

export async function exportGif(args: ExportGifArgs): Promise<string> {
  const raw = fs.readFileSync(args.input, 'utf-8');
  const input: WebCreateGifInput = JSON.parse(raw);

  const width = args.width ?? input.canvasWidth ?? 800;
  const height = args.height ?? input.canvasHeight ?? 600;
  const backgroundColor = args.backgroundColor ?? input.backgroundColor ?? '#ffffff';

  const outputPath = resolveOutputPath(args.output ?? '', 'webcreate-output.gif');

  return withRenderer(async (renderer) => {
    const frameCount = 16;
    const frames = await buildFrames(renderer, input, frameCount);
    const delayMs = args.delayMs ?? input.animationConfig?.delayMs
      ?? Math.round((args.duration ?? input.animationConfig?.duration ?? 2) * 1000 / frames.length);
    await renderer.renderGif(frames, {
      width,
      height,
      backgroundColor,
      delayMs,
      outputPath,
    });
    return outputPath;
  });
}
