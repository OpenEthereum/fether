// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import abi from '@parity/contracts/lib/abi/eip20';
import BigNumber from 'bignumber.js';
import { makeContract } from '@parity/light.js';
import memoize from 'lodash/memoize';
import { toWei } from '@parity/api/lib/util/wei';

import Debug from './debug';

const debug = Debug('estimateGas');
const GAS_MULT_FACTOR = 1.25; // Since estimateGas is not always accurate, we add a 25% factor for buffer.

export const contractForToken = memoize(tokenAddress =>
  makeContract(tokenAddress, abi)
);

/**
 * Estimate the amount of gas for our transaction.
 */
export const estimateGas = (tx, token, api) => {
  if (!tx || !Object.keys(tx).length) {
    return Promise.reject(new Error('Tx not set.'));
  }

  if (token.address === 'ETH') {
    return estimateGasForEth(txForEth(tx), api).then(estimatedGasForEth => {
      // do not add any buffer in case of an account to account transaction
      return estimatedGasForEth.eq(21000)
        ? estimatedGasForEth
        : addBuffer(estimatedGasForEth);
    });
  } else {
    return estimateGasForErc20(txForErc20(tx, token), token).then(addBuffer);
  }
};

/**
 * Estimate gas to transfer in ERC20 contract. Expensive function, so we
 * memoize it.
 */
const estimateGasForErc20 = memoize((txForErc20, token) => {
  debug(`Estimating gas for tx on token contract.`, token, txForErc20);
  return contractForToken(
    token.address
  ).contractObject.instance.transfer.estimateGas(
    txForErc20.options,
    txForErc20.args
  );
}, JSON.stringify);

/**
 * Estimate gas to transfer to an ETH address. Expensive function, so we
 * memoize it.
 */
const estimateGasForEth = memoize((txForEth, api) => {
  debug(`Estimating gas for tx.`, txForEth);
  return api.eth.estimateGas(txForEth);
}, JSON.stringify);

/**
 * Add some extra gas buffer just to be sure user has enough balance.
 *
 * @param {BigNumber} estimated - The estimated gas price returned by
 * estimateGas.
 */
const addBuffer = estimated => {
  // Add a buffer to the estimated gas, and round the number
  const withBuffer = estimated.multipliedBy(GAS_MULT_FACTOR).decimalPlaces(0);
  debug(`Estimated gas ${+estimated}, with buffer ${+withBuffer}.`);
  return withBuffer;
};

/**
 * This.tx is a user-friendly tx object. We convert it now as it can be
 * passed to makeContract.transfer(...).
 */
export const txForErc20 = (tx, token) => {
  const output = {
    args: [
      tx.to,
      new BigNumber(tx.amount).multipliedBy(
        new BigNumber(10).pow(token.decimals)
      )
    ],
    options: {
      from: tx.from,
      gasPrice: toWei(tx.gasPrice, 'shannon') // shannon == gwei
    }
  };

  if (tx.gas) {
    output.options.gas = tx.gas;
  }

  return output;
};

/**
 * This.tx is a user-friendly tx object. We convert it now as it can be
 * passed to post$(tx).
 */
export const txForEth = tx => {
  const output = {
    from: tx.from,
    gasPrice: toWei(tx.gasPrice, 'shannon'), // shannon == gwei
    to: tx.to,
    value: toWei(tx.amount.toString())
  };
  // gas field should not be present when the function is called for gas estimation.
  if (tx.gas) {
    output.gas = tx.gas;
  }
  return output;
};
