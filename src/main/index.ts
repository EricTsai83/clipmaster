import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  app,
  BrowserWindow,
  net,
  protocol,
  session,
  clipboard,
  ipcMain,
  globalShortcut,
  Notification,
  Tray,
} from "electron";
import positioner from "electron-positioner";
import started from "electron-squirrel-startup";
import { APP_URL, resolveAppAsset } from "./app-url";

let tray: Tray | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "clipmaster",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const developmentUrl = !app.isPackaged
  ? MAIN_WINDOW_VITE_DEV_SERVER_URL
  : undefined;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minHeight: 400,
    minWidth: 300,
    maxHeight: 800,
    maxWidth: 450,
    maximizable: false,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  mainWindow.webContents.on("will-redirect", (event) => event.preventDefault());
  void mainWindow.loadURL(developmentUrl ?? APP_URL).catch((error: unknown) => {
    console.error("Unable to load Clipmaster", error);
    app.quit();
  });

  if (developmentUrl) mainWindow.webContents.openDevTools({ mode: "detach" });

  return mainWindow;
};

if (started) {
  // Squirrel runs the executable to create/remove Windows shortcuts.
  app.quit();
} else {
  void app
    .whenReady()
    .then(() => {
      session.defaultSession.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      const rendererRoot = join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}`,
      );
      protocol.handle("clipmaster", async (request) => {
        if (request.method !== "GET")
          return new Response("Method not allowed", { status: 405 });
        const asset = resolveAppAsset(request.url, rendererRoot);
        if (!asset) return new Response("Forbidden", { status: 403 });
        try {
          return await net.fetch(pathToFileURL(asset).toString());
        } catch {
          return new Response("Not found", { status: 404 });
        }
      });
      createWindow();
    })
    .catch((error: unknown) => {
      console.error("Unable to initialize Clipmaster", error);
      app.quit();
    });
}

app.on("ready", () => {
  createWindow();
  const browserWindow = createWindow();

  tray = new Tray("./src/icons/trayTemplate.png");

  globalShortcut.register("CommandOrControl+Shift+Alt+C", () => {
    app.focus();
    browserWindow.show();
    browserWindow.focus();
  });

  globalShortcut.register("CommandOrControl+Shift+Alt+X", async () => {
    let content = await clipboard.readText();
    content = content.toUpperCase();

    clipboard.writeText(content);
    new Notification({
      title: "Capitalized Clipboard",
      subtitle: "Copied to clipboard",
      body: content,
    }).show();
  });
});

app.on("quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!started && app.isReady() && BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("write-to-clipboard", (_, content: string) => {
  clipboard.writeText(content);
});

ipcMain.handle("read-from-clipboard", (_) => {
  return clipboard.readText();
});
