// Copyright 2015-2019 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import { app } from 'electron';
import fs from 'fs';
import { multistream } from 'pino-multi-stream';
import Pino from 'pino';

import { name } from '../../../../package.json';

// Pino by default outputs JSON. We prettify that.
const pretty = Pino.pretty();
pretty.pipe(process.stdout);

const streams = [];

// In production, create 2 output streams:
// - fether.log file (raw JSON)
// - stdout (prettified output)
const IS_TEST = !app;

if (!IS_TEST) {
  // Create userData folder if it doesn't exist
  try {
    fs.statSync(app.getPath('userData'));
  } catch (e) {
    fs.mkdirSync(app.getPath('userData'));
  }

  streams.push({
    level: 'info',
    stream: fs.createWriteStream(`${app.getPath('userData')}/${name}.log`)
  });
}

streams.push({ level: 'info', stream: pretty });

export default opts => Pino({ name, ...opts }, multistream(streams));
