import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // 确保使用相对路径
  server: {
    port: 9966,
    host: 'localhost',
    strictPort: true, // 如果端口被占用则退出
    cors: true,
    hmr: {
      port: 9967, // HMR 端口
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // 生产环境也生成 sourcemap 便于调试
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置 @ 别名
    }
  }
})
