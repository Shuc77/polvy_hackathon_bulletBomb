import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const workspaceDir = path.dirname(fileURLToPath(import.meta.url));
// 子工程就在 SDK 仓库根目录下，产物直接写回 SDK 的静态目录。
// 需要输出到别的 SDK 副本时，仍可用 VITE_LIVE_BUDDY_SDK_DIR 覆盖。
const sdkDir = process.env.VITE_LIVE_BUDDY_SDK_DIR || path.resolve(workspaceDir, '..');

export default defineConfig({
  plugins: [react()],
  base: '/live-buddy/',
  build: {
    outDir: path.resolve(sdkDir, 'external/live-buddy'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(workspaceDir, 'widget.html'),
    },
  },
});
