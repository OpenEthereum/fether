// Copyright 2015-2019 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

const isEtcChainId = currentChainIdBN => {
  return currentChainIdBN.eq(61);
};

const chainIdToString = currentChainIdBN => {
  return isEtcChainId(currentChainIdBN) ? 'ETC' : 'ETH';
};

const isNotErc20TokenAddress = tokenAddress => {
  return tokenAddress === 'ETH' || tokenAddress === 'ETC';
};

const isErc20TokenAddress = tokenAddress => {
  return !isNotErc20TokenAddress(tokenAddress);
};

export {
  chainIdToString,
  isErc20TokenAddress,
  isNotErc20TokenAddress,
  isEtcChainId
};