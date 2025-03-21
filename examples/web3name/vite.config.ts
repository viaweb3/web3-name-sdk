import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 显式指定要包含的 polyfill
      include: ['buffer', 'process', 'util', 'stream', 'events', 'crypto'],
      // 对 Node.js 全局变量添加 polyfill
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // 解决一些常见的 Node.js 模块
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  define: {
    // 定义全局变量
    global: 'globalThis',
  },
})
