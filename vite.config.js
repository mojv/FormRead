import obfuscator from 'rollup-plugin-obfuscator';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        plugins: [ // <-- use plugins inside output to not merge chunks on one file
          obfuscator({
            fileOptions: {
              // options
            }
          })
        ]
      }
    },
  }
})
