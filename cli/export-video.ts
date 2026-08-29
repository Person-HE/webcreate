import fs from 'fs';
import { WebCreateVideoInput } from './types.js';
import { withRenderer, WebCreateRenderer } from './renderer.js';
import { resolveOutputPath } from './utils.js';
import { ExcalidrawElement } from '../types';
import { AnimationEasingConfig } from '../utils/tweenAnimation';

export interface ExportVideoArgs {
  input: string;
  output?: string;
  fps?: number;
  duration?: number;
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
  input: WebCreateVideoInput,
  fps: number,
  duration: number
): Promise<ExcalidrawElement[][]> {
  const visibleLayers = input.layers.filter(l => l.visible !== false);
  if (visibleLayers.length < 2) {
    throw new Error('视频导出需要至少 2 个可见图层');
  }

  const totalFrames = Math.max(Math.round(fps * duration), visibleLayers.length);
  const config = input.animationConfig;
  const easingConfig: AnimationEasingConfig = {
    ...config?.easingConfig,
    scale: config?.easingConfig?.scale ?? 'easeOutBack',
    rotation: config?.easingConfig?.rotation ?? 'easeInOutCubic',
    opacity: config?.easingConfig?.opacity ?? 'easeInOutSine',
    path: config?.easingConfig?.path ?? 'easeInOutCubic',
    springConfig: config?.easingConfig?.springConfig,
    gravityConfig: config?.easingConfig?.gravityConfig,
    stagger: config?.easingConfig?.stagger,
    trail: config?.easingConfig?.trail,
  };

  const frames: ExcalidrawElement[][] = [];

  if (visibleLayers.length === 2 && duration > 0) {
    // Two keyframes: generate interpolated tween frames
    const startElements = normalizeElements(visibleLayers[0].elements);
    const endElements = normalizeElements(visibleLayers[1].elements);
    const tweenFrames = await renderer.generateTweenFrames(
      startElements,
      endElements,
      totalFrames - 1,
      easingConfig
    );
    return tweenFrames;
  }

  // Multi-layer frame-by-frame mode with simple interpolation between consecutive layers
  const framesPerSegment = Math.max(1, Math.floor(totalFrames / (visibleLayers.length - 1)));
  const remainder = totalFrames - framesPerSegment * (visibleLayers.length - 1);

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

  // Add the final frame
  frames.push(normalizeElements(visibleLayers[visibleLayers.length - 1].elements));

  return frames;
}

export async function exportVideo(args: ExportVideoArgs): Promise<string> {
  const raw = fs.readFileSync(args.input, 'utf-8');
  const input: WebCreateVideoInput = JSON.parse(raw);

  const width = args.width ?? input.canvasWidth ?? 1920;
  const height = args.height ?? input.canvasHeight ?? 1080;
  const backgroundColor = args.backgroundColor ?? input.backgroundColor ?? '#ffffff';
  const fps = args.fps ?? input.animationConfig?.fps ?? 24;
  const duration = args.duration ?? input.animationConfig?.duration ?? 2;

  const outputPath = resolveOutputPath(
    args.output ?? '',
    'webcreate-output.mp4'
  );

  return withRenderer(async (renderer) => {
    const frames = await buildFrames(renderer, input, fps, duration);
    await renderer.renderVideo(frames, {
      width,
      height,
      backgroundColor,
      fps,
      outputPath,
    });
    return outputPath;
  });
}
