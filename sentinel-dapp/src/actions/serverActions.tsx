"use server";

import {
  BASE_FEE,
  Contract,
  Networks,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import config from "../config/markets.json";

const SERVER = new Server(config.sorobanRpcUrl);
const NETWORK = config.isTestnet ? Networks.TESTNET : Networks.PUBLIC;
const TIMEOUT_SEC = config.defaultTimeoutSeconds;
const POLL_SEC = config.defaultTransactionPollSeconds;

export async function prepareTx(
  publicKey: string,
  contractId: string,
  operation: string
): Promise<string> {
  console.log("[server] Prepare transaction");

  const account = await SERVER.getAccount(publicKey);

  const contract = new Contract(contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(contract.call(operation))
    .build();

  console.log("[server] Preparing transaction...");
  const preparedTransaction = await SERVER.prepareTransaction(transaction);
  console.log(preparedTransaction);

  if (!preparedTransaction) throw "Empty prepare transaction response.";

  return preparedTransaction.toEnvelope().toXDR("base64");
}

export async function sendTx(signedTransaction: string) {
  console.log("[server] Send transaction");

  const transaction = TransactionBuilder.fromXDR(
    signedTransaction,
    NETWORK
  ) as Transaction;

  console.log("[server] Sending transaction...");
  const sent = await SERVER.sendTransaction(transaction);
  console.log(sent);

  if (!sent) throw "Empty send transaction response.";

  if (sent.status !== "PENDING") {
    throw "Something went Wrong. Transaction status: " + sent.status;
  }

  const hash = sent.hash;
  let getResponse = await SERVER.getTransaction(hash);

  // Poll `getTransaction` until the status is not "NOT_FOUND"
  while (getResponse.status === "NOT_FOUND") {
    console.log("[server] Waiting for transaction confirmation...");
    getResponse = await SERVER.getTransaction(hash);
    await new Promise((resolve) => setTimeout(resolve, POLL_SEC));
  }

  if (getResponse.status === "SUCCESS") {
    // Make sure the transaction's resultMetaXDR is not empty
    if (!getResponse.resultMetaXdr) {
      throw "Empty resultMetaXDR in getTransaction response";
    }
  } else {
    throw `Transaction failed: ${getResponse.resultXdr}`;
  }

  const returnValue = getResponse.resultMetaXdr
    .v3()
    .sorobanMeta()
    ?.returnValue();

  console.log("[server] Return value:", returnValue);
}

export async function simulateTx(
  publicKey: string,
  contractId: string,
  operation: string
) {
  console.log("[server] Simulate transaction");

  const account = await SERVER.getAccount(publicKey);

  const contract = new Contract(contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(contract.call(operation))
    .build();

  console.log("[server] Simulating transaction...");
  const simulatedTransaction = await SERVER.simulateTransaction(transaction);
  console.log(simulatedTransaction);

  if (!simulatedTransaction) throw "Empty simulate transaction response.";
}
