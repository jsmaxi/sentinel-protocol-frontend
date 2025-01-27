"use client";

import { signTransaction } from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";
import config from "../config/markets.json";

const NETWORK = config.isTestnet ? Networks.TESTNET : Networks.PUBLIC;

export async function signTx(preparedTransaction: string): Promise<string> {
  if (!preparedTransaction) return preparedTransaction;

  console.log("[client] Signing transaction...");
  const signedTransaction = await signTransaction(preparedTransaction, {
    networkPassphrase: NETWORK,
  });
  console.log(signedTransaction);

  if (!signedTransaction) throw "Empty sign transaction response";
  if (signedTransaction.error) throw signedTransaction?.error;

  return signedTransaction.signedTxXdr;
}
