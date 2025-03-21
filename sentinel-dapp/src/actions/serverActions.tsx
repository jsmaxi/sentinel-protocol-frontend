"use server";

import {
  Asset,
  BASE_FEE,
  Contract,
  Horizon,
  Networks,
  scValToNative,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { Api, Server } from "@stellar/stellar-sdk/rpc";
import config from "../config/markets.json";
import { SorobanTypeConverter } from "@/utils/SorobanTypeConverter";
import { AssetBalanceType, PriceAsset, PriceResponse } from "@/types/market";

const SERVER = new Server(config.sorobanRpcUrl);
const NETWORK = config.isTestnet ? Networks.TESTNET : Networks.PUBLIC;
const POLL_INTERVAL_SEC = config.defaultTransactionPollSeconds;
const TIMEOUT_SEC = config.defaultTimeoutSeconds;

async function prepareTx(
  publicKey: string,
  contractId: string,
  operationName: string,
  operationParams: xdr.ScVal[]
): Promise<string> {
  console.log("[server] Prepare transaction");
  const account = await SERVER.getAccount(publicKey);
  const contract = new Contract(contractId);
  const operation = contract.call(operationName, ...operationParams);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(operation)
    .build();
  console.log("[server] Preparing transaction...", transaction);
  const preparedTransaction = await SERVER.prepareTransaction(transaction);
  console.log(preparedTransaction);
  if (!preparedTransaction) throw "Empty prepare transaction response.";
  return preparedTransaction.toEnvelope().toXDR("base64");
}

export async function sendTx(signedTransaction: string): Promise<boolean> {
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
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_SEC));
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

  return true;
}

async function simulateTx(
  publicKey: string,
  contractId: string,
  operationName: string,
  operationParams?: xdr.ScVal[]
): Promise<string | number | bigint | object> {
  // console.log("[server] Simulate transaction");

  const account = await SERVER.getAccount(publicKey);

  const contract = new Contract(contractId);

  const operation =
    operationParams && operationParams.length > 0
      ? contract.call(operationName, ...operationParams)
      : contract.call(operationName);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(operation)
    .build();

  // console.log("[server] Simulating transaction...");
  const simulatedTransaction = await SERVER.simulateTransaction(transaction);
  // console.log(simulatedTransaction);

  if (!simulatedTransaction) throw "Empty simulate transaction response.";

  return handleSimulationResponse(simulatedTransaction);
}

function handleSimulationResponse(
  response: Api.SimulateTransactionResponse
): string | number | bigint {
  if (Api.isSimulationSuccess(response)) {
    if (response.result?.retval) {
      // console.log(
      //   scValToNative(response.result.retval),
      //   " :: ",
      //   typeof scValToNative(response.result.retval)
      // );
      return scValToNative(response.result.retval);
    } else {
      throw "Return value not set";
    }
  } else if (Api.isSimulationError(response)) {
    console.log(response.error);
    throw response.error;
  } else {
    console.log(response);
    throw "Unexpected simulation response";
  }
}

export async function getLatestLedgerSequence(): Promise<number> {
  const server = new Server(config.sorobanRpcUrl);
  const ledger = await server.getLatestLedger();
  if (!ledger) throw "Empty ledger response";
  return ledger.sequence;
}

export async function fetchBalances(
  publicKey: string
): Promise<AssetBalanceType[]> {
  const server = new Horizon.Server(config.horizonRpcUrl);
  const account = await server.accounts().accountId(publicKey).call();
  const balances = account?.balances;
  if (!balances) throw "Account balances not found";
  console.log(balances);
  const mappedBalances: AssetBalanceType[] = balances.map((bal: any) =>
    bal.asset_type === "native"
      ? { symbol: "XLM", balance: bal.balance }
      : { symbol: bal.asset_code, balance: bal.balance }
  );
  return mappedBalances;
}

export async function fetchBalance(
  publicKey: string,
  assetSymbol: string
): Promise<AssetBalanceType | undefined> {
  const balances = await fetchBalances(publicKey);
  if (assetSymbol === "native") return balances.find((b) => b.symbol === "XLM");
  return balances.find((b) => b.symbol === assetSymbol);
}

export async function fetchAssetPriceByCodes(
  baseAssetCode: string,
  quoteAssetCode: string
): Promise<PriceResponse> {
  // Currently we only support a list of configured trusted asset issuers
  // const server = new Horizon.Server(config.horizonRpcUrl);

  let issuer1 = "";
  let issuer2 = "";

  if (baseAssetCode !== "native") {
    // const asset1 = await server.assets().forCode(baseAssetCode).call();
    // issuer1 = asset1?.records[0]?.asset_issuer;
    // console.log(baseAssetCode, issuer1);
    issuer1 =
      config.assetIssuers.find((a) => a.code === baseAssetCode)?.issuer ?? "";
    if (!issuer1) throw "Unable to retrieve base asset issuer";
  }

  if (quoteAssetCode !== "native") {
    // const asset2 = await server.assets().forCode(quoteAssetCode).call();
    // issuer2 = asset2?.records[0]?.asset_issuer;
    // console.log(quoteAssetCode, issuer2);
    issuer2 =
      config.assetIssuers.find((a) => a.code === quoteAssetCode)?.issuer ?? "";
    if (!issuer2) throw "Unable to retrieve quote asset issuer";
  }

  return fetchAssetPrice(
    { code: baseAssetCode, issuer: issuer1 },
    { code: quoteAssetCode, issuer: issuer2 }
  );
}

export async function fetchAssetPrice(
  baseAsset: PriceAsset,
  quoteAsset: PriceAsset
): Promise<PriceResponse> {
  const server = new Horizon.Server(config.horizonRpcUrl);

  let selling =
    baseAsset.code === "native" && !baseAsset.issuer
      ? Asset.native()
      : new Asset(baseAsset.code, baseAsset.issuer);

  let buying =
    quoteAsset.code === "native" && !quoteAsset.issuer
      ? Asset.native()
      : new Asset(quoteAsset.code, quoteAsset.issuer);

  const orderbook = await server.orderbook(selling, buying).call();

  const bestBid = orderbook.bids[0]?.price || "0";
  const bestAsk = orderbook.asks[0]?.price || "0";

  const midPrice = ((Number(bestBid) + Number(bestAsk)) / 2).toFixed(5);
  const spread = (Number(bestAsk) - Number(bestBid)).toString();

  return {
    baseAsset: baseAsset.code,
    quoteAsset: quoteAsset.code,
    bestBid,
    bestAsk,
    midPrice,
    spread,
    lastUpdated: new Date(),
  };
}

export async function simulateGetAction(
  contractId: string,
  operationName: string,
  caller: string
): Promise<string | number | bigint | object> {
  return await simulateTx(caller, contractId, operationName);
}

export async function simulateMarketDetails(
  contractId: string,
  operationName: string,
  caller: string
): Promise<string | number | bigint | object> {
  const params = [SorobanTypeConverter.stringToAddress(caller)];
  return await simulateTx(caller, contractId, operationName, params);
}

export async function simulateTotalSharesOf(
  contractId: string,
  operationName: string,
  caller: string,
  address: string
): Promise<string | number | bigint | object> {
  const params = [SorobanTypeConverter.stringToAddress(address)];
  return await simulateTx(caller, contractId, operationName, params);
}

export async function prepareDepositVault(
  contractId: string,
  operationName: string,
  caller: string,
  receiver: string,
  assets: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.toI128(assets),
    SorobanTypeConverter.stringToAddress(caller),
    SorobanTypeConverter.stringToAddress(receiver),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}

export async function prepareMintVault(
  contractId: string,
  operationName: string,
  caller: string,
  receiver: string,
  shares: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.toI128(shares),
    SorobanTypeConverter.stringToAddress(caller),
    SorobanTypeConverter.stringToAddress(receiver),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}

export async function prepareWithdrawVault(
  contractId: string,
  operationName: string,
  caller: string,
  receiver: string,
  owner: string,
  assets: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.toI128(assets),
    SorobanTypeConverter.stringToAddress(caller),
    SorobanTypeConverter.stringToAddress(receiver),
    SorobanTypeConverter.stringToAddress(owner),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}

export async function prepareRedeemVault(
  contractId: string,
  operationName: string,
  caller: string,
  receiver: string,
  owner: string,
  shares: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.toI128(shares),
    SorobanTypeConverter.stringToAddress(caller),
    SorobanTypeConverter.stringToAddress(receiver),
    SorobanTypeConverter.stringToAddress(owner),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}

export async function prepareApproveShares(
  contractId: string,
  operationName: string,
  caller: string,
  owner: string,
  spender: string,
  approveAmount: bigint,
  expireInDays: number
): Promise<string> {
  const params = [
    SorobanTypeConverter.stringToAddress(owner),
    SorobanTypeConverter.stringToAddress(spender),
    SorobanTypeConverter.toI128(approveAmount),
    SorobanTypeConverter.toU32(expireInDays),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}

export async function prepareApproveAssets(
  assetAddress: string,
  operationName: string,
  caller: string,
  owner: string,
  spender: string,
  approveAmount: bigint,
  expirationLedger: number
): Promise<string> {
  const params = [
    SorobanTypeConverter.stringToAddress(owner),
    SorobanTypeConverter.stringToAddress(spender),
    SorobanTypeConverter.toI128(approveAmount),
    SorobanTypeConverter.toU32(expirationLedger),
  ];
  return await prepareTx(caller, assetAddress, operationName, params);
}

export async function prepareTransferAssets(
  assetAddress: string,
  operationName: string,
  caller: string,
  owner: string,
  receiver: string,
  amount: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.stringToAddress(owner),
    SorobanTypeConverter.stringToAddress(receiver),
    SorobanTypeConverter.toI128(amount),
  ];
  return await prepareTx(caller, assetAddress, operationName, params);
}

export async function prepareTransferShares(
  contractId: string,
  operationName: string,
  caller: string,
  owner: string,
  receiver: string,
  sharesAmount: bigint
): Promise<string> {
  const params = [
    SorobanTypeConverter.stringToAddress(owner),
    SorobanTypeConverter.stringToAddress(receiver),
    SorobanTypeConverter.toI128(sharesAmount),
  ];
  return await prepareTx(caller, contractId, operationName, params);
}
