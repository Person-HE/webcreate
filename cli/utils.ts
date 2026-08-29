import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { spawn, execSync } from 'child_process';

export function dataURLToBuffer(dataURL: string): Buffer {
  const base64 = dataURL.split(',')[1];
  if (!base64) throw new Error('Invalid data URL');
  return Buffer.from(base64, 'base64');
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createTempDir(prefix = 'webcreate-'): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function cleanTempDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

export function resolveOutputPath(inputPath: string, defaultName: string): string {
  if (!inputPath) return path.resolve(process.cwd(), defaultName);
  const resolved = path.resolve(inputPath);
  ensureDir(path.dirname(resolved));
  return resolved;
}

export function startStaticServer(rootDir: string, port: number = 0): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url?.split('?')[0] || '/';

      if (urlPath === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }

      const filePath = path.join(rootDir, urlPath === '/' ? 'render.html' : urlPath);

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.json': 'application/json',
      };

      res.writeHead(200, { 'Content-Type': contentType[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    });

    server.listen(port, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      resolve({
        url: `http://localhost:${actualPort}`,
        close: () => server.close(),
      });
    });

    server.on('error', reject);
  });
}

let cachedFfmpeg: string | null | undefined;

export function resolveFfmpeg(): string | null {
  if (cachedFfmpeg !== undefined) return cachedFfmpeg;
  const candidates: string[] = [];
  if (process.env.WEBCREATE_FFMPEG) candidates.push(process.env.WEBCREATE_FFMPEG);
  try {
    const out = execSync('where ffmpeg', { stdio: ['pipe','pipe','pipe'] }).toString().trim();
    if (out) candidates.push(...out.split(/\r?\n/));
  } catch { /* not on PATH */ }
  const localAppData = process.env.LOCALAPPDATA || '';
  const pwDir = path.join(localAppData, 'ms-playwright');
  try {
    if (fs.existsSync(pwDir)) {
      const dirs = fs.readdirSync(pwDir).filter(d => d.startsWith('ffmpeg-')).sort().reverse();
      for (const d of dirs) {
        const exePath = path.join(pwDir, d, 'ffmpeg-win64.exe');
        if (fs.existsSync(exePath)) candidates.push(exePath);
        const exePath2 = path.join(pwDir, d, 'ffmpeg-linux');
        if (fs.existsSync(exePath2)) candidates.push(exePath2);
        const exePath3 = path.join(pwDir, d, 'ffmpeg-mac');
        if (fs.existsSync(exePath3)) candidates.push(exePath3);
      }
    }
  } catch { /* ignore */ }
  for (const cand of candidates) {
    if (cand && (cand.includes(path.sep) ? fs.existsSync(cand) : true)) {
      cachedFfmpeg = cand;
      return cand;
    }
  }
  cachedFfmpeg = null;
  return null;
}

let cachedEncoders: string | null | undefined;

export function getFfmpegEncoders(): string {
  if (cachedEncoders !== undefined) return cachedEncoders;
  const ff = resolveFfmpeg();
  if (!ff) { cachedEncoders = ''; return cachedEncoders; }
  try {
    cachedEncoders = execSync('"' + ff + '"' + ' -hide_banner -encoders', { stdio: ['pipe','pipe','pipe'] }).toString();
  } catch {
    cachedEncoders = '';
  }
  return cachedEncoders;
}

export function ffmpegSupports(encoder: 'libx264' | 'libvpx'): boolean {
  return getFfmpegEncoders().includes(encoder);
}

export function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegPath = resolveFfmpeg();
    const ffmpeg = spawn(ffmpegPath || 'ffmpeg', args, { stdio: 'pipe' });
    let stderr = '';

    ffmpeg.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to run ffmpeg: ${err.message}`));
    });
  });
}

export function spawnFfmpegPipe(ffmpegPath: string, args: string[], imageBuffers: Buffer[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Minimal ffmpeg builds (e.g. Playwright's bundled one) only expose the pipe: protocol
    const usePipeProto = !getFfmpegEncoders().includes('libx264');
    const finalArgs = usePipeProto ? args.map((a) => (a === '-' ? 'pipe:0' : a)) : args;
    const ffmpeg = spawn(ffmpegPath, finalArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';

    ffmpeg.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const tail = stderr.split(/\r?\n/).filter(Boolean).slice(-6).join('\n');
        reject(new Error(`ffmpeg exited with code ${code}:\n${tail}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to run ffmpeg: ${err.message}`));
    });

    ffmpeg.stdin.on('error', () => {
      // EPIPE etc.: ffmpeg closed stdin early; the 'close' event delivers the real error
    });

    // Feed image frames via stdin using image2pipe demuxer
    let i = 0;
    const writeNext = (): void => {
      while (i < imageBuffers.length) {
        const buf = imageBuffers[i++];
        const canContinue = (ffmpeg.stdin as any).write(buf);
        if (!canContinue) {
          (ffmpeg.stdin as any).once('drain', writeNext);
          return;
        }
      }
      ffmpeg.stdin.end();
    };
    writeNext();
  });
}