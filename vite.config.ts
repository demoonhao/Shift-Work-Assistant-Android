import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用相对路径，自动适配各种 GitHub Pages 部署路径（根域名或子目录）
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})