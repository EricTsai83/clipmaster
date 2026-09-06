[![Frontend Masters](https://static.frontendmasters.com/assets/brand/logos/full.png)][fem]

# Clipmaster 9000

This is a companion repo for the [Electron-v3][course] course on [Frontend Masters][fem].

## Setup
Make sure you have [Node.js](https://nodejs.org/) v24 or newer, [Git](https://git-scm.com/), and pnpm 12.3.4 installed. The package manager version is pinned in `package.json`.

The following commands will install the repo dependencies and start the Clipmaster application.
```sh
pnpm install
pnpm start
```

## Development checks

```sh
pnpm check       # Oxlint, TypeScript, and Node's test runner
pnpm package     # Build the application for the current platform
pnpm test:electron # Smoke-test the production bundles after packaging
pnpm make        # Package and create the platform's distributable
pnpm audit
```

The renderer uses React's automatic JSX transform and Tailwind 4's Vite plugin.
Theme tokens live in `src/renderer/index.css`. Main-process output remains CommonJS
for Electron; `src/package.json` marks the original sources as modules for Node tests.

Packaged pages use the restricted `clipmaster://app` protocol, a production CSP,
sandboxed renderers, ASAR integrity validation, and disabled Node CLI/environment
fuses. The development CSP permits Vite's refresh preamble and local HMR sockets.
Fuses use the current `@electron/fuses` API in a pre-signing Forge hook.

The current app supports adding and deleting in-memory entries. System clipboard
read/write and persistent history are not implemented in this course starter;
the unconnected copy controls are disabled. There is no preload bridge until a
native feature needs one.

## Build dependencies and release status

`pnpm-workspace.yaml` pins newer `@electron/rebuild` and `tmp` versions to fix
vulnerabilities in Forge 7's transitive dependencies. Retest packaging when these
overrides change, and remove them when Forge adopts the fixed versions.

As of 2026-09-06, the full audit still reports one high-severity advisory in
Forge → `@electron/packager` → `extract-zip`:
[GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv).
It affects the build toolchain, not the runtime bundle; the production audit is
clean. Packager 20 removes that dependency but is incompatible with Forge 7's
callback hooks, so it is not forced through an override. Use trusted Electron
archives while awaiting an upstream-compatible fix.

macOS arm64 packaging is verified locally. Windows/Linux installers still need
testing on their target systems. Windows Squirrel startup handling is connected.
Distribution signing/notarization requires your own developer certificates and
credentials; no release signing or publisher is configured. Local macOS ad-hoc
signatures are not distribution signatures. See the
[Forge signing guide](https://www.electronforge.io/guides/code-signing).

[fem]: https://frontendmasters.com
[course]: https://frontendmasters.com/courses/electron-v3/
