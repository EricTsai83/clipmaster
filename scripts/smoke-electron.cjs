// Exercise the real Electron protocol and production bundles without using
// the user's normal app profile. Run after `pnpm package` or `pnpm make`.
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

if (!process.versions.electron) {
  const { spawn } = require('node:child_process');
  const profile = mkdtempSync(join(tmpdir(), 'clipmaster-smoke-'));
  const env = { ...process.env, CLIPMASTER_SMOKE_PROFILE: profile };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(require('electron'), [__filename], { env, stdio: 'inherit' });
  const timeout = setTimeout(() => child.kill('SIGKILL'), 20000);
  child.on('error', (error) => { console.error(error); process.exitCode = 1; });
  child.on('close', (code) => {
    clearTimeout(timeout);
    rmSync(profile, { recursive: true, force: true });
    process.exitCode = code ?? 1;
  });
} else {
  const { app } = require('electron');
  app.setPath('userData', process.env.CLIPMASTER_SMOKE_PROFILE);
  app.on('web-contents-created', (_event, contents) => {
    contents.on('did-fail-load', (_event, code, description) => {
      console.error({ code, description });
      app.exit(1);
    });
    contents.once('did-finish-load', async () => {
      try {
        const page = await contents.executeJavaScript(`({
          title: document.title,
          url: location.href,
          heading: document.querySelector('h1')?.textContent,
          color: getComputedStyle(document.querySelector('header')).backgroundColor,
          nodeAvailable: typeof window.require !== 'undefined',
          csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]').content
        })`);
        assert.equal(page.title, 'Clipmaster');
        assert.equal(page.heading, 'Clipmaster');
        assert.equal(page.url, 'clipmaster://app/index.html');
        assert.equal(page.color, 'rgb(199, 136, 234)');
        assert.equal(page.nodeAvailable, false);
        assert.ok(!page.csp.includes('unsafe-inline'));
        console.log('Electron smoke test passed: app protocol, React, CSS, CSP, and renderer isolation.');
        app.exit(0);
      } catch (error) {
        console.error(error);
        app.exit(1);
      }
    });
  });
  require(resolve(__dirname, '../.vite/build/main.js'));
}
