import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        renovations: resolve(__dirname, 'renovations/index.html'),
        contact:     resolve(__dirname, 'contact/index.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap:  ['gsap'],
          swup:  ['swup', '@swup/preload-plugin', '@swup/body-class-plugin'],
        },
      },
    },
  },
})
