// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

function setupSecurity (fetherApp) {
  // Security to prevent window contents from being captured by other apps
  fetherApp.win.setContentProtection(true);
}

export default setupSecurity;
