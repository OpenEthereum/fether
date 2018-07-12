// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import { app, dialog, shell } from 'electron';

import { bugs, name, parity } from '../../../package.json';
import Pino from './pino';

export default (err, message = 'An error occurred.') => {

  // `userData` (which Pino also uses) needs to be gotten inside the exports,
  // otherwise it is evaluated straight away, before index.js has set it
  const logFile = `${app.getPath('userData')}/${name}.log`;
  const pino = Pino();

  pino.error(err);
  dialog.showMessageBox(
    {
      buttons: ['OK', 'Open logs'],
      defaultId: 0, // Default button id
      detail: `Please file an issue at ${
        bugs.url
      }. Please attach the following debugging info:
      
OS: ${process.platform}
Arch: ${process.arch}
Channel: ${parity.channel}
Error: ${err.message}

Please also attach the contents of the following file:
${logFile}.
Click on "Open logs" to open this file.`,
      message: `${message}`,
      title: 'Parity Error',
      type: 'error'
    },
    buttonId => {
      switch (buttonId) {
        case 1:
          shell.openItem(logFile);
          break;
        default:
          app.exit(1);
      }
    }
  );
};
