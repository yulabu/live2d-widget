/**
 * Downscale the model textures to reduce deployment size.
 * The Nahida model ships an 8192px texture (~14.6 MB); 2048px is ~1 MB.
 *
 * Creates a copy of the model directory with the same relative structure
 * (so Nahida.model3.json needs no edits) and re-scaled textures.
 *
 * Usage: npm run compress-model [-- --size 2048]
 * Then point waifu-tips.json's model path to the compact directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const sizeArg = process.argv.indexOf('--size');
const TARGET_SIZE = sizeArg >= 0 ? parseInt(process.argv[sizeArg + 1], 10) : 2048;

const DEFAULT_MODEL_DIR = 'model/Nahida';
const DEFAULT_OUT_DIR = 'model/Nahida-compact';

function findModelJson(dir) {
  const candidates = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.model3.json'));
  if (candidates.length === 0) throw new Error(`No *.model3.json found in ${dir}`);
  return path.join(dir, candidates[0]);
}

function listTextures(modelJsonPath) {
  const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));
  return modelJson.FileReferences?.Textures ?? [];
}

async function main() {
  const srcDir = path.join(ROOT, process.argv[2] ?? DEFAULT_MODEL_DIR);
  const outDir = path.join(ROOT, process.argv[3] ?? DEFAULT_OUT_DIR);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Model directory not found: ${srcDir}`);
  }

  const modelJsonPath = findModelJson(srcDir);
  const textures = listTextures(modelJsonPath);
  if (textures.length === 0) {
    throw new Error('No textures referenced in model JSON, nothing to compress.');
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  let copied = 0;
  let compressed = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = path.relative(srcDir, path.join(srcDir, entry.name));
    const dest = path.join(outDir, rel);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(path.join(srcDir, entry.name))) {
        const fileRel = path.join(rel, file);
        const textureMatch = textures.some((t) =>
          fileRel.replace(/\\/g, '/').endsWith(t),
        );
        const destFile = path.join(outDir, fileRel);
        if (textureMatch) {
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          await sharp(path.join(srcDir, fileRel))
            .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'inside' })
            .png({ compressionLevel: 9 })
            .toFile(destFile);
          compressed++;
          const kb = (fs.statSync(destFile).size / 1024).toFixed(0);
          console.log(`[compress] ${fileRel} -> ${kb} KB`);
        } else {
          fs.copyFileSync(path.join(srcDir, fileRel), destFile);
          copied++;
        }
      }
    } else {
      fs.copyFileSync(path.join(srcDir, entry.name), dest);
      copied++;
    }
  }
  console.log(
    `[compress] Done: ${copied} files copied, ${compressed} textures resized to ${TARGET_SIZE}px -> ${outDir}`,
  );
}

main().catch((error) => {
  console.error('[compress] FAILED:', error.message);
  process.exit(1);
});