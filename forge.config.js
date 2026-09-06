const { resolve } = require('node:path');
const { flipFuses, FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
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
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/index.ts',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
  ],
};
