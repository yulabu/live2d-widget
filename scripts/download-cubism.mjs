/**
 * Download and extract the Live2D Cubism SDK for Web.
 * The SDK is not bundled in this repo (license restrictions), so it must be
 * fetched once before the first build. Run with: npm run setup
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SDK_VERSION = process.env.CUBISM_SDK_VERSION || '5-r.4';
const SDK_DIR_NAME = `CubismSdkForWeb-${SDK_VERSION}`;
const TARGET_DIR = path.join(ROOT, 'build', SDK_DIR_NAME);
const ZIP_URL = `https://cubism.live2d.com/sdk-web/bin/${SDK_DIR_NAME}.zip`;

function sdkPresent() {
  const hasTsFiles = (dir) => {
    try {
      return fs.readdirSync(dir).some((name) => name.endsWith('.ts') || name.endsWith('.js'));
    } catch {
      return false;
    }
  };
  return (
    hasTsFiles(path.join(TARGET_DIR, 'Framework', 'src')) &&
    hasTsFiles(path.join(TARGET_DIR, 'Samples', 'TypeScript', 'Demo', 'src'))
  );
}

async function main() {
  if (sdkPresent()) {
    console.log(`[setup] Cubism SDK already present at build/${SDK_DIR_NAME}, skip.`);
    return;
  }
  console.log(`[setup] Downloading Cubism SDK for Web ${SDK_VERSION} ...`);
  const response = await fetch(ZIP_URL);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText} (${ZIP_URL})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`[setup] Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)} MB, extracting ...`);
  new AdmZip(buffer).extractAllTo(path.join(ROOT, 'build'), true);
  if (!sdkPresent()) {
    throw new Error(`Extraction failed: expected sources under build/${SDK_DIR_NAME}`);
  }
  console.log(`[setup] SDK ready at build/${SDK_DIR_NAME}`);
}

main().catch((error) => {
  console.error('[setup] FAILED:', error.message);
  process.exit(1);
});