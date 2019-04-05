// Copyright 2015-2019 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import { IS_PACKAGED } from '../utils/paths';

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Security. Additional network security is configured after `cli` is available:
 * in fether-electron/src/main/app/options/config/index.js
 *
 * Note: 127.0.0.1 is a trusted loopback and more trustworthy than localhost.
 * See https://letsencrypt.org/docs/certificates-for-localhost/
 */
const DEFAULT_CHAIN = 'kovan';
const DEFAULT_WS_PORT = '8546';
const TRUSTED_LOOPBACK = '127.0.0.1';
const TRUSTED_WS_ORIGINS = 'parity://1.ui.parity';

export {
  DEFAULT_CHAIN,
  DEFAULT_WS_PORT,
  IS_PACKAGED,
  IS_PROD,
  TRUSTED_LOOPBACK,
  TRUSTED_WS_ORIGINS
};