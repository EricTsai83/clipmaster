import { defineConfig, type ConfigEnv } from 'vite';
import type { VitePluginBuildConfig } from '@electron-forge/plugin-vite/dist/Config';

export default defineConfig((env) => {
  // Forge supplies the build entry when loading this Vite configuration.
  const { forgeConfigSelf } = env as ConfigEnv & { forgeConfigSelf: VitePluginBuildConfig };

  return {
    build: {
      lib: {
        entry: forgeConfigSelf.entry,
        fileName: () => 'main.cjs',
        formats: ['cjs'],
      },
    },
  };
});
