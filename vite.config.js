import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vite 8 minifies CSS with lightningcss, which collapses a prefixed +
    // unprefixed pair down to whichever was declared LAST. Without targets it
    // has no basis to choose, so hand-written `-webkit-` fallbacks silently ate
    // the standard property in the build (backdrop-filter died in prod, dev was
    // fine). Declare the standard property only and let these targets drive
    // prefixing — Safari < 18 needs -webkit-backdrop-filter and gets it here.
    cssTarget: ['chrome107', 'edge107', 'firefox104', 'safari15.4'],
  },
})
