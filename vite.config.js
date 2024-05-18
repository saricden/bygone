/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
export default defineConfig(() => ({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000
  }
}));