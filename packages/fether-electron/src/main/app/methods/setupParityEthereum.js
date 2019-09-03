// Copyright 2015-2019 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import ParityEthereum from '../parityEthereum';

function setupParityEthereum () {
  // Run Parity Ethereum if not running and requested
  return new ParityEthereum();
}

export default setupParityEthereum;
