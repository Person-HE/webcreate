#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, 'index.ts');

function findTsxEsm() {
  const candidates = [
    path.resolve(__dirname, '..', 'node_modules', 'tsx', 'dist', 'loader.mjs'),
    path.resolve(__dirname, '..', 'node_modules', 'tsx', 'dist', 'loader.js'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

const tsxLoader = findTsxEsm();
const args = tsxLoader
  ? ['--import', pathToFileURL(tsxLoader).href, indexPath, ...process.argv.slice(2)]
  : [indexPath, ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 0));
