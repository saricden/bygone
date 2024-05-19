/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

export default defineConfig(() => ({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg']
  },
  plugins: [
    // other plugins...
    crossOriginIsolation()
  ]
}));