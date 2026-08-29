import { ExcalidrawElement } from '../types';
import { renderScene } from '../utils/renderScene';
import { generateTweenFrames } from '../utils/tweenAnimation';
import { AnimationEasingConfig } from '../utils/tweenAnimation';

interface RenderFrameRequest {
  elements: ExcalidrawElement[];
  width: number;
  height: number;
  backgroundColor: string;
}

interface RenderAnimationRequest {
  frames: ExcalidrawElement[][];
  width: number;
  height: number;
  backgroundColor: string;
  format: 'png' | 'jpeg';
}

interface GenerateFramesRequest {
  startElements: ExcalidrawElement[];
  endElements: ExcalidrawElement[];
  frameCount: number;
  easingConfig?: AnimationEasingConfig;
}

async function renderFrameToDataURL(
  request: RenderFrameRequest,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): Promise<string> {
  try {
    await Promise.all([
      document.fonts.load('24px Virgil', 'WebCreate 手绘 0123'),
      document.fonts.load('24px Cascadia', 'const x = 0123'),
    ]);
    await document.fonts.ready;
  } catch { /* ignore */ }
  const canvas = document.createElement('canvas');
  canvas.width = request.width;
  canvas.height = request.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 canvas 上下文');

  renderScene(ctx, request.elements, undefined, undefined, 0.3, request.backgroundColor);

  const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  return canvas.toDataURL(mimeType, quality);
}

function renderAnimationFrames(
  request: RenderAnimationRequest
): string[] {
  return Promise.all(request.frames.map(frame =>
    renderFrameToDataURL({
      elements: frame,
      width: request.width,
      height: request.height,
      backgroundColor: request.backgroundColor,
    }, request.format)
  ));
}

function generateTweenFrameElements(
  request: GenerateFramesRequest
): ExcalidrawElement[][] {
  return generateTweenFrames(
    request.startElements,
    request.endElements,
    request.frameCount,
    request.easingConfig
  );
}

async function renderGifDataURL(
  request: {
    frames: ExcalidrawElement[][];
    width: number;
    height: number;
    backgroundColor: string;
    delayMs: number;
  }
): Promise<string> {
  const GIFCtor = (window as any).GIF;
  if (!GIFCtor) throw new Error('gif.js not loaded');

  const canvas = document.createElement('canvas');
  canvas.width = request.width;
  canvas.height = request.height;

  const dataURLs: string[] = [];
  for (const frame of request.frames) {
    dataURLs.push(await renderFrameToDataURL({
      elements: frame,
      width: request.width,
      height: request.height,
      backgroundColor: request.backgroundColor,
    }, 'png'));
  }

  return new Promise<string>((resolve, reject) => {
    try {
      const gif = new GIFCtor({
        workers: 2,
        quality: 10,
        width: request.width,
        height: request.height,
        workerScript: (window as any).GIF_WORKER_SCRIPT || './gif.worker.js',
      });

      const img = new Image();
      let loaded = 0;
      const onImg = () => {
        loaded++;
        if (loaded === dataURLs.length) {
          gif.on('finished', (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('failed to read gif blob'));
            reader.readAsDataURL(blob);
          });
          gif.render();
        }
      };
      dataURLs.forEach((d) => {
        const im = new Image();
        im.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = request.backgroundColor;
            ctx.fillRect(0, 0, request.width, request.height);
            ctx.drawImage(im, 0, 0);
          }
          gif.addFrame(canvas, { delay: request.delayMs, copy: true });
          onImg();
        };
        im.onerror = () => reject(new Error('failed to decode frame image'));
        im.src = d;
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

// Load gif.js (classic script, UMD) for GIF encoding in the browser
(async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = './gif.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('failed to load gif.js'));
      document.head.appendChild(s);
    });
    (window as any).GIF_WORKER_SCRIPT = './gif.worker.js';
  } catch {
    // gif.js unavailable; GIF export will report an error
  }
})();

(window as any).__WEBCREATE_RENDER__ = {
  renderFrameToDataURL,
  renderAnimationFrames,
  generateTweenFrameElements,
  renderGifDataURL,
};
