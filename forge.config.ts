import { resolve } from 'node:path';
import { flipFuses, FuseV1Options, FuseVersion } from '@electron/fuses';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: { asar: true },
  rebuildConfig: {},
  hooks: {
    // Apply fuses before Packager signs the executable. Use the current fuses API
    // directly because Forge 7's fuses plugin still requires fuses v1.
    packageAfterCopy: async (config, buildPath, _version, platform, arch) => {
      const isMac = platform === 'darwin' || platform === 'mas';
      const executable = resolve(buildPath, '../..', isMac ? 'MacOS/Electron' : platform === 'win32' ? 'electron.exe' : 'electron');
      await flipFuses(executable, {
        version: FuseVersion.V1,
        resetAdHocDarwinSignature: isMac && arch === 'arm64' && !config.packagerConfig.osxSign,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      });
    },
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerDeb({}),
    new MakerRpm({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
