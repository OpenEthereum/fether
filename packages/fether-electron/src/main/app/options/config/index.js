// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import path from 'path';
import url from 'url';

import staticPath from '../../utils/staticPath';

const INDEX_HTML_PATH =
  process.env.ELECTRON_START_URL ||
  url.format({
    pathname: path.join(staticPath, 'build', 'index.html'),
    protocol: 'file:',
    slashes: true
  });

// Icon path differs when started with `yarn electron` or `yarn start`
let iconPath = path.join(staticPath, 'assets', 'icons', 'icon.png');
let iconDockPath = '';

if (process.platform === 'win32') {
  iconPath = path.join(staticPath, 'assets', 'icons', 'win', 'icon.ico');
} else if (process.platform === 'darwin') {
  // https://github.com/electron/electron/blob/master/docs/api/native-image.md#template-image
  iconPath = path.join(
    staticPath,
    'assets',
    'icons',
    'mac',
    'iconTemplate.png'
  );
  iconDockPath = path.join(
    staticPath,
    'assets',
    'icons',
    'mac',
    'iconDock.png'
  );
}

// Fether window must have a "frame" otherwise the menu
// does not appear on Windows 10 or Linux Mint
const shouldUseFrame =
  process.platform === 'win32' || process.platform === 'linux';

const windowPosition =
  process.platform === 'win32' ? 'trayBottomCenter' : 'trayCenter';

// API docs: https://electronjs.org/docs/api/browser-window
const DEFAULT_OPTIONS = {
  alwaysOnTop: true,
  dir: staticPath,
  frame: true,
  height: 640,
  hasShadow: true,
  icon: iconPath,
  iconDock: iconDockPath,
  index: INDEX_HTML_PATH,
  resizable: false,
  show: false, // Run showWindow later
  showDockIcon: true, // macOS usage only
  tabbingIdentifier: 'parity',
  webPreferences: {
    devTools: true,
    enableRemoteModule: true // Remote is required in fether-react parityStore.js
  },
  width: 360,
  windowPosition: windowPosition, // Required
  withTaskbar: false
};

const TASKBAR_OPTIONS = {
  frame: shouldUseFrame,
  height: 464,
  // On Linux the user must click the tray icon and then click the tooltip
  // to toggle the Fether window open/close
  tooltip: 'Click to toggle Fether window',
  width: 352,
  withTaskbar: true
};

export { DEFAULT_OPTIONS, TASKBAR_OPTIONS };
