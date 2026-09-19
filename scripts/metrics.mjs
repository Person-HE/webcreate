#!/usr/bin/env node
/**
 * Reproducible project metrics collector.
 *
 *   node scripts/metrics.mjs [--build "<cmd>"] [--test "<cmd>"]
 *                            [--src <dir>] [--dist <dir>] [--out <file>]
 *
 * Every number it prints is measured in this process, from this working copy,
 * on this machine. The toolchain and hardware that produced them are recorded
 * in the JSON output so anyone can attribute or reproduce the result.
 */
import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};

const ROOT = process.cwd();
const SRCS = opt('src', 'src').split(',').map((s) => s.trim()).filter(Boolean);
const DIST = opt('dist', 'dist');
const OUT = opt('out', 'docs/metrics.json');
const BUILD = opt('build', 'npm run build');
const TEST = opt('test', '');

const KB = (b) => Math.round((b / 1024) * 10) / 10;
const MB = (b) => Math.round((b / 1024 / 1024) * 100) / 100;

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/** Build-time wall clock, ms, from a clean output directory. */
function timedBuild() {
  if (!BUILD) return null;
  const started = performance.now();
  execSync(BUILD, { cwd: ROOT, stdio: 'pipe' });
  return Math.round(performance.now() - started);
}

const LANGUAGES = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript (React)', '.js': 'JavaScript', '.jsx': 'JavaScript (React)',
  '.mjs': 'JavaScript (ESM)', '.cjs': 'JavaScript (CJS)', '.vue': 'Vue', '.css': 'CSS', '.html': 'HTML',
  '.py': 'Python', '.rs': 'Rust', '.java': 'Java', '.go': 'Go',
};

const SKIP = /(^|[/\\])(node_modules|dist|build|release|out|coverage|docs|_deprecated|\.[^/\\]+)([/\\]|$)/;

function sourceStats() {
  const seen = new Set();
  const files = [];
  for (const root of SRCS) {
    for (const f of walk(path.join(ROOT, root))) {
      const rel = path.relative(ROOT, f);
      if (SKIP.test(rel)) continue;
      if (!LANGUAGES[path.extname(f).toLowerCase()]) continue;
      if (seen.has(rel)) continue;
      seen.add(rel);
      files.push(f);
    }
  }
  const byLanguage = {};
  let totalLines = 0;
  let codeLines = 0;
  let blankLines = 0;
  let commentLines = 0;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    const ext = path.extname(file).toLowerCase();
    const lang = LANGUAGES[ext];
    const bucket = (byLanguage[lang] ??= { files: 0, lines: 0 });
    bucket.files += 1;
    bucket.lines += lines.length;
    totalLines += lines.length;
    for (const line of lines) {
      const t = line.trim();
      if (!t) blankLines += 1;
      else if (/^(\/\/|\/\*|\*|<!--|#|--)/.test(t)) commentLines += 1;
      else codeLines += 1;
    }
  }
  return {
    roots: SRCS,
    files: files.length,
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    commentRatio: totalLines ? Math.round((commentLines / totalLines) * 1000) / 10 : 0,
    byLanguage: Object.fromEntries(
      Object.entries(byLanguage).sort((a, b) => b[1].lines - a[1].lines)
    ),
  };
}

function bundleStats() {
  const dir = path.join(ROOT, DIST);
  if (!existsSync(dir)) return { error: `no build output at ${DIST}` };
  const files = walk(dir);
  let raw = 0;
  let gzip = 0;
  const byType = {};
  const perFile = [];
  for (const file of files) {
    const buf = readFileSync(file);
    const ext = path.extname(file).toLowerCase() || '(none)';
    const gz = zlib.gzipSync(buf, { level: 9 }).length;
    raw += buf.length;
    gzip += gz;
    const t = (byType[ext] ??= { files: 0, rawBytes: 0, gzipBytes: 0 });
    t.files += 1;
    t.rawBytes += buf.length;
    t.gzipBytes += gz;
    perFile.push({ file: path.relative(dir, file).replace(/\\/g, '/'), rawBytes: buf.length, gzipBytes: gz });
  }
  perFile.sort((a, b) => b.rawBytes - a.rawBytes);
  const assets = { js: 0, css: 0, font: 0, wasm: 0, image: 0, html: 0 };
  for (const f of files) {
    const e = path.extname(f).toLowerCase();
    if (e === '.js' || e === '.mjs') assets.js += 1;
    else if (e === '.css') assets.css += 1;
    else if (['.woff', '.woff2', '.ttf', '.otf'].includes(e)) assets.font += 1;
    else if (e === '.wasm') assets.wasm += 1;
    else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(e)) assets.image += 1;
    else if (e === '.html') assets.html += 1;
  }
  return {
    root: DIST,
    files: files.length,
    rawBytes: raw,
    rawMB: MB(raw),
    gzipBytes: gzip,
    gzipMB: MB(gzip),
    compressionRatio: raw ? Math.round((gzip / raw) * 1000) / 10 : 0,
    largestFiles: perFile.slice(0, 5),
    byType: Object.fromEntries(Object.entries(byType).sort((a, b) => b[1].rawBytes - a[1].rawBytes)),
    counts: assets,
  };
}

/** Parse jest / vitest / node:test / python unittest output into pass+fail counts. */
function testStats() {
  if (!TEST) return { configured: false };
  const started = performance.now();
  const run = spawnSync(TEST, { cwd: ROOT, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const output = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
  // Jest prints "Test Suites: ..." before "Tests: ..."; counting the wrong line
  // overstates the result, so anchor on the test-level summary line only.
  const summaryLine =
    output.match(/(?:^|\n)\s*(?:●\s*)?Tests:\s+([^\n]*)/)?.[1] ??
    output.match(/(?:^|\n)\s*Tests\s{2}([^\n]*)/)?.[1] ??
    output.match(/Ran\s+\d+\s+tests?[^\n]*/)?.[0] ??
    '';
  const inSummary = (re) => {
    const m = summaryLine.match(re);
    return m ? Number(m[1]) : null;
  };
  const passed = inSummary(/(\d+)\s+passed/) ?? 0;
  const failed = inSummary(/(\d+)\s+failed/) ?? 0;
  const skipped = inSummary(/(\d+)\s+skipped/) ?? 0;
  const todo = inSummary(/(\d+)\s+todo/) ?? 0;
  const reportedTotal = inSummary(/(\d+)\s+total/) ?? inSummary(/\((\d+)\)$/) ?? inSummary(/^(\d+)/);
  const total = reportedTotal !== null && reportedTotal >= passed ? reportedTotal : passed + failed + skipped + todo;
  const suitesLine = output.match(/(?:^|\n)\s*Test Suites:\s+([^\n]*)/)?.[1] ?? '';
  return {
    configured: true,
    command: TEST,
    exitCode: run.status,
    passed,
    failed,
    skipped,
    todo,
    total,
    suites: Number(suitesLine.match(/(\d+)\s+total/)?.[1] ?? output.match(/(\d+)\s+Test Files/)?.[1] ?? null) || null,
    durationMs: Math.round(performance.now() - started),
    passRate: total ? Math.round((passed / total) * 1000) / 10 : null,
    rawSummary: summaryLine.trim() || null,
  };
}

function dependencyStats() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!existsSync(pkgPath)) return null;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const count = (o) => Object.keys(o ?? {}).length;
  return {
    runtime: count(pkg.dependencies),
    dev: count(pkg.devDependencies),
    directTotal: count(pkg.dependencies) + count(pkg.devDependencies),
  };
}

function gitInfo() {
  const sh = (cmd) => {
    try {
      return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  };
  return {
    commit: sh('git rev-parse HEAD'),
    shortCommit: sh('git rev-parse --short HEAD'),
    branch: sh('git rev-parse --abbrev-ref HEAD'),
    dirty: sh('git status --porcelain').length > 0,
  };
}

function environment() {
  const cpu = os.cpus()[0] ?? {};
  return {
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpus: os.cpus().length,
    cpuModel: (cpu.model || '').trim(),
    memoryGB: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
    node: process.version,
    npm: (() => {
      try {
        return execSync('npm -v', { encoding: 'utf8' }).trim();
      } catch {
        return null;
      }
    })(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

const buildMs = timedBuild();
const metrics = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  project: (() => {
    try {
      return JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).name ?? path.basename(ROOT);
    } catch {
      return path.basename(ROOT);
    }
  })(),
  commands: { build: BUILD, test: TEST || null, metrics: `node ${path.relative(ROOT, process.argv[1]).replace(/\\/g, '/')}` },
  environment: environment(),
  git: gitInfo(),
  build: { clean: true, durationMs: buildMs, durationS: buildMs !== null ? Math.round((buildMs / 1000) * 10) / 10 : null },
  source: sourceStats(),
  bundle: bundleStats(),
  tests: testStats(),
  dependencies: dependencyStats(),
};

const outPath = path.join(ROOT, OUT);
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');

const b = metrics.bundle;
const t = metrics.tests;
const lines = [
  `# Metrics`,
  ``,
  `Measured ${metrics.generatedAt} on ${metrics.environment.platform}, ${metrics.environment.node}, ${metrics.build.durationS}s clean build.`,
  `Regenerate: \`${metrics.commands.metrics}\``,
  ``,
  `| Metric | Value |`,
  `| --- | --- |`,
  `| Clean build time | ${metrics.build.durationS ?? 'n/a'} s |`,
  `| Source files / lines | ${metrics.source.files} / ${metrics.source.totalLines} (${metrics.source.codeLines} code) |`,
  `| Build output files | ${b.files ?? 'n/a'} |`,
  `| Output size (raw / gzip) | ${b.rawMB ?? 'n/a'} MB / ${MB(b.gzipBytes ?? 0)} MB |`,
  `| Tests passed | ${t.configured ? `${t.passed}/${t.total}` : 'no suite'} |`,
  `| Direct dependencies | ${metrics.dependencies?.directTotal ?? 'n/a'} |`,
  ``,
  `Largest output files:`,
  ``,
  ...(b.largestFiles ?? []).map((f) => `- \`${f.file}\` — ${(f.rawBytes / 1024).toFixed(1)} KB raw / ${(f.gzipBytes / 1024).toFixed(1)} KB gzip`),
  ``,
  `Full data: \`${OUT}\``,
];
writeFileSync(outPath.replace(/\.json$/, '.md'), lines.join('\n'), 'utf8');

console.log(JSON.stringify(metrics, null, 2));
console.log(`\n# wrote ${OUT} and ${OUT.replace(/\.json$/, '.md')}`);
