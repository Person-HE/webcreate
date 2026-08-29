import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium, Browser, Page } from 'playwright';
import { ExcalidrawElement } from '../types';
import { AnimationEasingConfig } from '../utils/tweenAnimation';
import { dataURLToBuffer, createTempDir, cleanTempDir, ensureDir, startStaticServer } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_RENDER_PAGE = path.resolve(__dirname, '..', 'dist', 'cli', 'render.html');
const SOURCE_RENDER_PAGE = path.resolve(__dirname, 'render.html');

function getRenderPagePath(): string {
  if (fs.existsSync(DIST_RENDER_PAGE)) {
    return DIST_RENDER_PAGE;
  }
  return SOURCE_RENDER_PAGE;
}

function findSystemChrome(): string | undefined {
  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';

  const candidates = [
    path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

interface RenderAPI {
  renderFrameToDataURL: (
    request: {
      elements: ExcalidrawElement[];
      width: number;
      height: number;
      backgroundColor: string;
    },
    format?: 'png' | 'jpeg' | 'webp'
  ) => string;
  renderAnimationFrames: (
    request: {
      frames: ExcalidrawElement[][];
      width: number;
      height: number;
      backgroundColor: string;
      format: 'png';
    }
  ) => string[];
  generateTweenFrameElements: (
    request: {
      startElements: ExcalidrawElement[];
      endElements: ExcalidrawElement[];
      frameCount: number;
      easingConfig?: AnimationEasingConfig;
    }
  ) => ExcalidrawElement[][];
  renderGifDataURL: (
    request: {
      frames: ExcalidrawElement[][];
      width: number;
      height: number;
      backgroundColor: string;
      delayMs: number;
    }
  ) => Promise<string>;
}

export class WebCreateRenderer {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private server: { url: string; close: () => void } | null = null;

  async init(): Promise<void> {
    const renderPagePath = getRenderPagePath();
    this.server = await startStaticServer(path.dirname(renderPagePath));

    const executablePath = findSystemChrome();
    this.browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    this.page = await this.browser.newPage();

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('[Browser]', msg.text());
      }
    });
    this.page.on('pageerror', (err) => {
      console.error('[Browser Error]', err.message);
    });

    await this.page.goto(this.server.url, { waitUntil: 'networkidle' });

    await this.page.waitForFunction(() => {
      return !!(window as any).__WEBCREATE_RENDER__;
    }, { timeout: 30000 });
  }

  private getAPI(): RenderAPI {
    if (!this.page) throw new Error('Renderer not initialized');
    const api = (this.page as any).__WEBCREATE_RENDER__;
    if (!api) throw new Error('Render API not ready');
    return api as RenderAPI;
  }

  async renderImage(
    elements: ExcalidrawElement[],
    options: {
      width: number;
      height: number;
      backgroundColor: string;
      format: 'png' | 'jpeg' | 'webp';
      outputPath: string;
    }
  ): Promise<string> {
    if (!this.page) throw new Error('Renderer not initialized');

    const dataURL = await this.page.evaluate(
      ({ elements, width, height, backgroundColor, format }) => {
        const api = (window as any).__WEBCREATE_RENDER__ as RenderAPI;
        return api.renderFrameToDataURL(
          { elements, width, height, backgroundColor },
          format
        );
      },
      {
        elements,
        width: options.width,
        height: options.height,
        backgroundColor: options.backgroundColor,
        format: options.format,
      }
    );

    const buffer = dataURLToBuffer(dataURL);
    ensureDir(path.dirname(options.outputPath));
    fs.writeFileSync(options.outputPath, buffer);
    return options.outputPath;
  }

  async renderVideo(
    frames: ExcalidrawElement[][],
    options: {
      width: number;
      height: number;
      backgroundColor: string;
      fps: number;
      outputPath: string;
    }
  ): Promise<string> {
    if (!this.page) throw new Error('Renderer not initialized');

    const tempDir = createTempDir('webcreate-video-');
    try {
      const dataURLs = await this.page.evaluate(
        ({ frames, width, height, backgroundColor }) => {
          const api = (window as any).__WEBCREATE_RENDER__ as RenderAPI;
          return api.renderAnimationFrames({
            frames,
            width,
            height,
            backgroundColor,
            // Playwright's bundled ffmpeg only ships an mjpeg decoder, so feed JPEG frames
            format: 'jpeg',
          });
        },
        {
          frames,
          width: options.width,
          height: options.height,
          backgroundColor: options.backgroundColor,
        }
      );

      ensureDir(path.dirname(options.outputPath));

      const { resolveFfmpeg, spawnFfmpegPipe, ffmpegSupports } = await import('./utils.js');
      const ffmpegPath = resolveFfmpeg();
      if (!ffmpegPath) {
        // No ffmpeg at all: fall back to PNG frame sequence on disk
        dataURLs.forEach((dataURL, index) => {
          const buffer = dataURLToBuffer(dataURL);
          const filename = `frame-${String(index).padStart(5, '0')}.png`;
          const seqPath = options.outputPath.replace(/\.[^.]+$/, '') || options.outputPath;
          fs.mkdirSync(seqPath, { recursive: true });
          fs.writeFileSync(path.join(seqPath, filename), buffer);
        });
        const seqDir = options.outputPath.replace(/\.[^.]+$/, '');
        console.warn(`[webcreate] ffmpeg not found, wrote PNG frame sequence to: ${seqDir}`);
        return seqDir;
      }

      const imageBuffers = dataURLs.map((d) => dataURLToBuffer(d));
      const mp4Requested = path.extname(options.outputPath).toLowerCase() === '.mp4';

      // Encode via stdin pipe (works with minimal ffmpeg builds that lack the image2 file demuxer)
      // Candidate order: requested format first (if supported), then practical fallbacks
      const candidates: Array<{ args: string[]; out: string; note?: string }> = [];
      const hasX264 = ffmpegSupports('libx264');
      const hasVpx = ffmpegSupports('libvpx');
      if (mp4Requested && hasX264) {
        candidates.push({
          args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium'],
          out: options.outputPath,
        });
      }
      if (hasVpx) {
        const webmOut = mp4Requested ? options.outputPath.replace(/\.mp4$/i, '.webm') : options.outputPath;
        candidates.push({
          args: ['-c:v', 'libvpx', '-b:v', '4M', '-crf', '12', '-auto-alt-ref', '0', '-pix_fmt', 'yuv420p'],
          out: webmOut,
          note: mp4Requested ? 'mp4 encoder (libx264) unavailable in this ffmpeg build; wrote WebM (VP8) instead' : undefined,
        });
      }
      if (!mp4Requested && hasX264 && path.extname(options.outputPath).toLowerCase() !== '.webm') {
        candidates.push({
          args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium'],
          out: options.outputPath,
        });
      }
      if (!candidates.length) {
        throw new Error(
          'No usable video encoder found in ffmpeg build (need libx264 or libvpx). ' +
          'Install full ffmpeg and set WEBCREATE_FFMPEG to its path.'
        );
      }

      let lastErr: Error | null = null;
      for (const cand of candidates) {
        const args = [
          '-y',
          '-f', 'image2pipe',
          '-c:v', 'mjpeg',
          '-framerate', String(options.fps),
          '-i', '-',
          ...cand.args,
          cand.out,
        ];
        try {
          await spawnFfmpegPipe(ffmpegPath, args, imageBuffers);
          if (cand.note) console.warn(`[webcreate] ${cand.note}`);
          return cand.out;
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
        }
      }
      throw lastErr || new Error('video encoding failed');
    } finally {
      cleanTempDir(tempDir);
    }
  }

  async renderGif(
    frames: ExcalidrawElement[][],
    options: {
      width: number;
      height: number;
      backgroundColor: string;
      delayMs: number;
      outputPath: string;
    }
  ): Promise<string> {
    if (!this.page) throw new Error('Renderer not initialized');

    const dataURL = await this.page.evaluate(
      async ({ frames, width, height, backgroundColor, delayMs }) => {
        const api = (window as any).__WEBCREATE_RENDER__ as RenderAPI;
        return await api.renderGifDataURL({
          frames,
          width,
          height,
          backgroundColor,
          delayMs,
        });
      },
      {
        frames,
        width: options.width,
        height: options.height,
        backgroundColor: options.backgroundColor,
        delayMs: options.delayMs,
      }
    );

    const buffer = dataURLToBuffer(dataURL);
    ensureDir(path.dirname(options.outputPath));
    fs.writeFileSync(options.outputPath, buffer);
    return options.outputPath;
  }

  async generateTweenFrames(
    startElements: ExcalidrawElement[],
    endElements: ExcalidrawElement[],
    frameCount: number,
    easingConfig?: AnimationEasingConfig
  ): Promise<ExcalidrawElement[][]> {
    if (!this.page) throw new Error('Renderer not initialized');

    return this.page.evaluate(
      ({ startElements, endElements, frameCount, easingConfig }) => {
        const api = (window as any).__WEBCREATE_RENDER__ as RenderAPI;
        return api.generateTweenFrameElements({
          startElements,
          endElements,
          frameCount,
          easingConfig,
        });
      },
      {
        startElements,
        endElements,
        frameCount,
        easingConfig,
      }
    );
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

export async function withRenderer<T>(
  fn: (renderer: WebCreateRenderer) => Promise<T>
): Promise<T> {
  const renderer = new WebCreateRenderer();
  try {
    await renderer.init();
    return await fn(renderer);
  } finally {
    await renderer.close();
  }
}
