// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// // import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  define: {
    global: 'globalThis', // สำคัญสำหรับ crypto-browserify
  },
})

