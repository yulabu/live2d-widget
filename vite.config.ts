import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findCubismDir() {
  const buildDir = path.join(__dirname, 'build');
  const candidates = fs
    .readdirSync(buildDir)
    .filter(
      (name) =>
        name.startsWith('CubismSdkForWeb-') &&
        fs.statSync(path.join(buildDir, name)).isDirectory(),
    );
  const dir = candidates[0] ?? 'CubismSdkForWeb-5-r.4';
  return path.join(buildDir, dir);
}

const cubismDir = findCubismDir();

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  resolve: {
    alias: [
      {
        find: '@demo',
        replacement: path.resolve(cubismDir, 'Samples/TypeScript/Demo/src/'),
      },
      {
        find: '@framework',
        replacement: path.resolve(cubismDir, 'Framework/src/'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2017',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        'waifu-tips': path.resolve(__dirname, 'src/waifu-tips.ts'),
        demo: path.resolve(__dirname, 'demo/demo.html'),
        login: path.resolve(__dirname, 'demo/login.html'),
        chat: path.resolve(__dirname, 'demo/chat.html'),
      },
      output: {
        format: 'esm',
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'waifu-tips' ? 'waifu-tips.js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'chunk/[name].js',
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/ui/waifu.css',
          dest: '.',
        },
        {
          src: 'src/waifu-tips.json',
          dest: '.',
        },
        {
          src: 'model',
          dest: '.',
        },
      ],
    }),
  ],
});