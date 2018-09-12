// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import { action, observable } from "mobx";
import addHocToLight from "@parity/light.js-react";
import Api from "@parity/api";
import isElectron from "is-electron";
import Light from "@parity/light.js";
import store from "store";

import Debug from "../utils/debug";
import LS_PREFIX from "./utils/lsPrefix";

const debug = Debug("parityStore");
const electron = isElectron() ? window.require("electron") : null;

const LS_KEY = `${LS_PREFIX}::secureToken`;

export class ParityStore {
  @observable
  downloadProgress = 0;
  @observable
  isApiConnected = false;
  @observable
  isParityRunning = false;
  @observable
  token = null;

  constructor() {
    // Retrieve token from localStorage
    const token = store.get(LS_KEY);
    if (token) {
      debug("Got token from localStorage.");
      this.setToken(token);
    }

    if (!electron) {
      debug(
        "Not in Electron, ParityStore will only have limited capabilities."
      );
      return;
    }

    const { ipcRenderer, remote } = electron;

    // Check if isParityRunning
    this.setIsParityRunning(!!remote.getGlobal("isParityRunning"));
    // We also listen to future changes
    ipcRenderer.on("parity-running", (_, isParityRunning) => {
      this.setIsParityRunning(isParityRunning);
    });

    // Set download progress
    ipcRenderer.on("parity-download-progress", (_, progress) => {
      this.setDownloadProgress(progress);
    });
  }

  connectToApi = () => {
    // Get the provider, optionally from --ws-interface and --ws-port flags
    const [defaultInterface, defaultPort] = ["127.0.0.1", "8546"];
    let providerUrl = `ws://${defaultInterface}:${defaultPort}`;
    if (electron) {
      const { remote } = electron;
      const wsInterface = remote.getGlobal("wsInterface");
      const wsPort = remote.getGlobal("wsPort");
      providerUrl = `ws://${wsInterface || defaultInterface}:${wsPort ||
        defaultPort}`;
    }

    debug(`Connecting to ${providerUrl}.`);
    const provider = new Api.Provider.Ws(
      providerUrl,
      this.token.replace(/[^a-zA-Z0-9]/g, "") // Sanitize token
    );

    // Initialize the light.js lib
    this.light = addHocToLight(new Light(provider));

    // Also set api as member for React Components to use it if needed
    this.api = this.light.api;

    // TODO This is not working
    // api.on('connected', () => this.setIsApiConnected(true));
    // api.on('disconnected', () => this.setIsApiConnected(false));
    // So instead, we poll every 1s
    setInterval(() => {
      this.setIsApiConnected(this.light.api.isConnected);
    }, 1000);
  };

  requestNewToken = () => {
    const { ipcRenderer } = electron;

    // Request new token from Electron
    debug("Requesting new token.");
    ipcRenderer.send("asynchronous-message", "signer-new-token");
    ipcRenderer.once("signer-new-token-reply", (_, token) => {
      if (!token) {
        return;
      }
      // If `parity signer new-token` has successfully given us a token back,
      // then we submit it
      debug("Successfully received new token.");
      this.setToken(token);
    });
  };

  @action
  setDownloadProgress = downloadProgress => {
    this.downloadProgress = downloadProgress;
  };

  @action
  setIsApiConnected = isApiConnected => {
    if (isApiConnected === this.isApiConnected) {
      return;
    }
    debug(`Api is now ${isApiConnected ? "connected" : "disconnected"}.`);
    this.isApiConnected = isApiConnected;
  };

  @action
  setIsParityRunning = isParityRunning => {
    if (isParityRunning === this.isParityRunning) {
      return;
    }

    this.isParityRunning = isParityRunning;

    // Request new token if parity's running but we still don't have a token
    if (isParityRunning && !this.token) {
      this.requestNewToken();
    }
  };

  @action
  setToken = token => {
    if (token === this.token) {
      return;
    }

    this.token = token;

    // If we receive a new token, then we try to connect to the Api with this
    // new token
    this.connectToApi();

    this.updateLS();
  };

  updateLS = () => store.set(LS_KEY, this.token);
}

export default new ParityStore();
