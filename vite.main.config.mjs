import { defineConfig } from 'vite';

export default defineConfig(({ forgeConfigSelf }) => ({
  build: {
    lib: {
      entry: forgeConfigSelf.entry,
      fileName: 'main',
      formats: ['cjs'],
    },
  },
}));
