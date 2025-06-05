import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: true,
    outDir: '.vite',
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', ...builtinModules, 'serialport', 'drivelist'],
    },
  },
})
