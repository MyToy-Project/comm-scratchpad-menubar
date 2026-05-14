const { app, globalShortcut } = require('electron');
const { menubar } = require('menubar');
const path = require('path');

app.on('ready', () => {
  const mb = menubar({
    index: `file://${path.join(__dirname, 'index.html')}`,
    browserWindow: {
      width: 400,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      alwaysOnTop: true,
    },
    preloadWindow: true,
  });

  mb.on('ready', () => {
    console.log('Menubar app is ready.');

    globalShortcut.register('Control+Shift+S', () => {
      if (mb.window && mb.window.isVisible()) {
        mb.hideWindow();
      } else {
        mb.showWindow();
        mb.window.focus();
      }
    });
  });

  // Force correct position AFTER the menubar library has already placed the window
  mb.on('after-show', () => {
    const trayBounds = mb.tray.getBounds();
    const { width } = mb.window.getBounds();
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - width / 2);
    const y = trayBounds.y + trayBounds.height;
    mb.window.setPosition(x, y, false);
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
});
