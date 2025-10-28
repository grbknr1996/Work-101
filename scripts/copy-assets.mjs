/**
 * Script: copy-assets.js
 * Purpose: Copies ngx-extended-pdf-viewer assets into src/assets/pdfjs after install/build.
 * Why: AWS or Linux builds fail with long chained shell commands (like && pug && stylus && copyfiles).
 * This Node script performs the same operation in a reliable, cross-platform way.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../node_modules/ngx-extended-pdf-viewer/assets');
const targetDir = path.resolve(__dirname, '../src/assets/pdfjs');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean target directory first
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log('🧹 Cleaned existing PDF.js assets...');
}

// Copy fresh assets
copyRecursiveSync(sourceDir, targetDir);
console.log('✅ Copied ngx-extended-pdf-viewer assets to src/assets/pdfjs');

// Remove unnecessary folders to reduce build size
try {
  execSync(`rm -rf "${path.join(targetDir, 'locale')}" "${path.join(targetDir, 'cmaps')}"`);
  console.log('🚀 Cleaned up unused locale and cmaps folders.');
} catch (err) {
  console.warn('⚠️ Warning: Cleanup skipped (rm not available on this OS).');
}
