# Clipmaster

A desktop text-snippet app built with Electron, React, and TypeScript. Uses Vite for development, Tailwind CSS for styling, and Electron Forge for packaging.

Based on the [Frontend Masters Electron v3 course](https://frontendmasters.com/courses/electron-v3/) by Steve Kinney. This is a work in progress, not yet a full clipboard-history manager.

## Features

- Add text snippets by typing and pressing Enter.
- View the newest snippets first in a scrollable list.
- Hover over a snippet and select **Delete** to remove it.

### Current limitations

- Snippets live in memory only and are lost when the window closes or reloads.
- System clipboard access is not implemented. **Copy** and **Copy from Clipboard** are disabled.
- **Save to Clipboard** currently adds a snippet to the list; it does not change the system clipboard.
- Editing UI, search, clipboard monitoring, tray controls, and automatic updates are not implemented.

## Getting started

Requires **Node.js 24+**, **pnpm 12.3.4**, Git, and a desktop environment that can run Electron.

```sh
git clone https://github.com/EricTsai83/clipmaster.git
cd clipmaster
pnpm install --frozen-lockfile
pnpm start
```

Development mode starts Electron with Vite hot reload and a separate DevTools window. No API keys, backend, or `.env` file are required. Press `Ctrl+C` in the terminal to stop.

Use pnpm for project dependencies; Yarn is not needed. Commit `pnpm-lock.yaml` when dependencies change. The package-manager version and installation settings are defined in [package.json](package.json) and [pnpm-workspace.yaml](pnpm-workspace.yaml).

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start the development app |
| `pnpm lint` | Check code with Oxlint |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm test` | Run unit tests |
| `pnpm check` | Run lint, type checking, and unit tests |
| `pnpm package` | Build and package the app for the current platform |
| `pnpm make` | Package the app and create distributable files |
| `pnpm test:electron` | Smoke-test production bundles with Electron |
| `pnpm audit` | Check all dependencies for known vulnerabilities |
| `pnpm audit --prod` | Check production dependencies only |
| `pnpm publish` | Publish through Forge; requires publisher configuration |

## Testing

Stop the development app, then run:

```sh
pnpm check
pnpm make
pnpm test:electron
```

Use `pnpm package` instead of `pnpm make` if you do not need distributable files. Do not run `pnpm start` between packaging and the smoke test: it replaces production build output with development output.

Unit tests cover snippet state updates and safe app-resource path handling. The smoke test uses a temporary profile to check the app protocol, React rendering, styles, CSP, and renderer isolation. It loads the production bundles, not the packaged installer, so installation and signing still need separate verification.

## Packaging

Build output goes to `.vite/`, packaged apps to `out/`, and distributables to `out/make/`. These generated directories are not committed.

| Platform | Configured output | Status |
| --- | --- | --- |
| macOS | ZIP containing the `.app` | Packaging verified locally on arm64 |
| Windows | Squirrel installer | Not yet verified on Windows |
| Linux | DEB and RPM packages | Not yet verified on Linux |

Platform-specific build tools may be required; see the Forge documentation for [Squirrel.Windows](https://www.electronforge.io/config/makers/squirrel.windows), [DEB](https://www.electronforge.io/config/makers/deb), and [RPM](https://www.electronforge.io/config/makers/rpm).

Release signing, macOS notarization, and publishers are not configured. Local macOS ad-hoc signatures are not distribution signatures, and `pnpm make` does not upload a release. See the [Forge signing guide](https://www.electronforge.io/guides/code-signing) before distribution.

## Project structure

```text
src/
  main/                   Electron lifecycle, window, and app protocol
  renderer/
    components/           React UI
    clipping-state.ts     Snippet creation and reducer
    use-clipping.ts       React state hook
    index.css             Tailwind theme and styles
    index.tsx             React entry point
  clipping.d.ts           Shared snippet types
tests/                    Unit tests
scripts/smoke-electron.cjs Electron smoke test
forge.config.ts           Packaging, makers, and security fuses
vite.*.config.ts          Main-process and renderer build settings
```

The package uses ESM by default (`"type": "module"`). Application code and Forge/Vite configurations use TypeScript and are included in type checking. Forge uses typed maker and plugin instances. The main process builds to `.vite/build/main.cjs` as CommonJS; generated output is ignored by Git. The Electron smoke-test launcher uses `.cjs` to run directly in Node and Electron. React uses the automatic JSX transform, and Tailwind 4 theme tokens live in `src/renderer/index.css`. There is no preload or IPC bridge yet; future native features should use a limited bridge rather than enabling Node.js in the renderer.

## Security and known issues

The renderer uses sandboxing and context isolation with Node.js integration disabled. Packaged pages load through the restricted `clipmaster://app` protocol with a production CSP. Navigation, new windows, and permission requests are denied. Packaging enables ASAR integrity settings and disables Node CLI/environment fuses and DevTools.

As of **2026-09-06**, `pnpm audit` reports **one high-severity issue** in Forge → Packager → `extract-zip`; `pnpm audit --prod` reports **zero known vulnerabilities**. The issue allows unsafe symlink targets in malicious ZIP files. See [GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv).

This is a build-time dependency, but a compromised build environment can still affect release artifacts. Use trusted, checksum-verified Electron archives. A clean production audit is not a complete security guarantee.

`pnpm-workspace.yaml` overrides `@electron/rebuild` and `tmp` to address other transitive dependency issues. The `extract-zip` replacement has **not** been applied. Forcing Packager 20 into Forge 7 breaks its hook API; a targeted extractor replacement or migration to Forge 8 requires testing. [Forge 8 alpha](https://github.com/electron/forge/releases/tag/v8.0.0-alpha.10) includes the new extractor but is still a prerelease.

## Troubleshooting

- **Install fails with `--frozen-lockfile`:** Confirm you are using pnpm 12.3.4 and matching manifest/lockfile versions. Run `pnpm install` to update the lockfile only when intentionally changing dependencies.
- **Electron executable is missing:** Check installation logs, network access, and the `allowBuilds` settings. After correcting the cause, run `pnpm rebuild electron`.
- **Smoke test cannot load the app:** Stop development mode, run `pnpm package`, then retry `pnpm test:electron` in a desktop environment.

## Credits and license

Adapted from [Steve Kinney's clipmaster-v3](https://github.com/stevekinney/clipmaster-v3). Original author attribution is retained.

`package.json` declares MIT. This repository does not currently include a standalone `LICENSE` file; confirm and include the applicable upstream license and copyright notices before redistribution.
