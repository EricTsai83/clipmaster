import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main',
      fileName: 'main',
      formats: ['cjs'],
    },
  },
  resolve: {
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});
