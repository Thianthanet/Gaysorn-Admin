import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// import { defineConfig } from 'vite'
// import nodePolyfills from 'rollup-plugin-node-polyfills'

// export default defineConfig({
//   plugins: [
//     nodePolyfills() // 👈 เพิ่ม plugin นี้
//   ],
//   resolve: {
//     alias: {
//       crypto: 'crypto-browserify',
//       stream: 'stream-browserify',
//       buffer: 'buffer',
//     }
//   },
//   define: {
//     'process.env': {}
//   }
// })
