// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

function onTrayClick (fetherApp, e, bounds) {
  const { cachedBounds, hideWindow, win } = fetherApp;
  const { altKey, ctrlKey, metaKey, shiftKey } = e;

  if ((win && win.isVisible()) || altKey || shiftKey || ctrlKey || metaKey) {
    return hideWindow(fetherApp);
  }

  // cachedBounds are needed for double-clicked event
  const newCacheBounds = bounds || cachedBounds;
  fetherApp.cachedBounds = newCacheBounds;
  fetherApp.showWindow(fetherApp, newCacheBounds);
}

export default onTrayClick;
