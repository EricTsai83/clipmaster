import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { APP_URL, resolveAppAsset } from '../src/main/app-url.ts';

const root = resolve('fixture', 'renderer');

test('serves the app page and nested assets under the renderer root', () => {
  assert.equal(resolveAppAsset(APP_URL, root), resolve(root, 'index.html'));
  assert.equal(resolveAppAsset('clipmaster://app/', root), resolve(root, 'index.html'));
  assert.equal(resolveAppAsset('clipmaster://app/assets/main.js?v=1', root), resolve(root, 'assets/main.js'));
  assert.equal(resolveAppAsset('clipmaster://app/assets/my%20icon.png', root), resolve(root, 'assets/my icon.png'));
});

test('rejects foreign origins, malformed paths, and encoded directory escapes', () => {
  for (const url of [
    'https://app/index.html', 'clipmaster://other/index.html',
    'clipmaster://user@app/index.html', 'clipmaster://app:123/index.html',
    'clipmaster://app/%2e%2e%2fsecret', 'clipmaster://app/assets/%2e%2e%2f%2e%2e%2fsecret',
    'clipmaster://app/%5c..%5csecret', 'clipmaster://app/%00', 'clipmaster://app/%ZZ',
    'not a url',
  ]) assert.equal(resolveAppAsset(url, root), null, url);
});
