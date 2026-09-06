import { isAbsolute, relative, resolve, sep } from 'node:path';

export const APP_URL = 'clipmaster://app/index.html';

// Only serve files inside the bundled renderer. Never expose arbitrary disk paths.
export const resolveAppAsset = (requestUrl: string, rendererRoot: string): string | null => {
  try {
    const url = new URL(requestUrl);
    if (url.protocol !== 'clipmaster:' || url.host !== 'app' || url.username || url.password) {
      return null;
    }
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) return null;
    const asset = resolve(rendererRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
    const withinRoot = relative(rendererRoot, asset);
    if (!withinRoot || withinRoot === '..' || withinRoot.startsWith(`..${sep}`) || isAbsolute(withinRoot)) {
      return null;
    }
    return asset;
  } catch {
    return null;
  }
};
