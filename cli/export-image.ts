import fs from 'fs';
import path from 'path';
import { WebCreateImageInput, OutputFormat } from './types.js';
import { withRenderer } from './renderer.js';
import { resolveOutputPath } from './utils.js';

export interface ExportImageArgs {
  input: string;
  output?: string;
  format?: OutputFormat;
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

export async function exportImage(args: ExportImageArgs): Promise<string> {
  const raw = fs.readFileSync(args.input, 'utf-8');
  const input: WebCreateImageInput = JSON.parse(raw);

  const width = args.width ?? input.canvasWidth ?? 1920;
  const height = args.height ?? input.canvasHeight ?? 1080;
  const backgroundColor = args.backgroundColor ?? input.backgroundColor ?? '#ffffff';
  const format = args.format ?? inferFormat(args.output) ?? 'png';

  const outputPath = resolveOutputPath(
    args.output ?? '',
    `webcreate-output.${format}`
  );

  const visibleLayers = input.layers.filter(l => l.visible !== false && l.elements.length);
  if (!visibleLayers.length) {
    throw new Error('输入 JSON 中没有可见图层或元素');
  }

  // Merge all visible layers so every element renders (layerId kept per element)
  const elements = normalizeElements(visibleLayers.flatMap(l => l.elements));

  return withRenderer(async (renderer) => {
    await renderer.renderImage(elements, {
      width,
      height,
      backgroundColor,
      format,
      outputPath,
    });
    return outputPath;
  });
}

function inferFormat(outputPath?: string): OutputFormat | undefined {
  if (!outputPath) return undefined;
  const ext = path.extname(outputPath).toLowerCase();
  if (ext === '.png') return 'png';
  if (ext === '.jpg' || ext === '.jpeg') return 'jpeg';
  if (ext === '.webp') return 'webp';
  return undefined;
}
