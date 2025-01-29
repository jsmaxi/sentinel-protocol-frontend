import { signTx } from "@/actions/clientActions";
import {
  prepareApproveAssets,
  prepareApproveShares,
  prepareDepositVault,
  prepareMintVault,
  prepareRedeemVault,
  prepareTransferAssets,
  prepareTransferShares,
  prepareWithdrawVault,
  sendTx,
  simulateTotalShares,
  simulateTotalSharesOf,
} from "@/actions/serverActions";

export async function totalShares(
  vaultAddress: string,
  caller: string
): Promise<string | number | bigint> {
  return await simulateTotalShares(vaultAddress, "total_shares", caller);
}

export async function totalSharesOf(
  vaultAddress: string,
  caller: string,
  address: string
): Promise<string | number | bigint> {
  return await simulateTotalSharesOf(
    vaultAddress,
    "balance_of_shares",
    caller,
    address
  );
}

export async function deposit(
  vaultAddress: string,
  caller: string,
  receiver: string,
  assets: bigint
): Promise<boolean> {
  const prep = await prepareDepositVault(
    vaultAddress,
    "deposit",
    caller,
    receiver,
    assets
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function mint(
  vaultAddress: string,
  caller: string,
  receiver: string,
  shares: bigint
): Promise<boolean> {
  const prep = await prepareMintVault(
    vaultAddress,
    "mint",
    caller,
    receiver,
    shares
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function withdraw(
  vaultAddress: string,
  caller: string,
  receiver: string,
  owner: string,
  assets: bigint
): Promise<boolean> {
  const prep = await prepareWithdrawVault(
    vaultAddress,
    "withdraw",
    caller,
    receiver,
    owner,
    assets
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function redeem(
  vaultAddress: string,
  caller: string,
  receiver: string,
  owner: string,
  shares: bigint
): Promise<boolean> {
  const prep = await prepareRedeemVault(
    vaultAddress,
    "redeem",
    caller,
    receiver,
    owner,
    shares
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function approveShares(
  vaultAddress: string,
  caller: string,
  owner: string,
  spender: string,
  approveAmount: bigint,
  expireInDays: number
): Promise<boolean> {
  const prep = await prepareApproveShares(
    vaultAddress,
    "approve_shares",
    caller,
    owner,
    spender,
    approveAmount,
    expireInDays
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function approveAssets(
  assetAddress: string,
  caller: string,
  owner: string,
  spender: string,
  approveAmount: bigint,
  expirationLedger: number
): Promise<boolean> {
  const prep = await prepareApproveAssets(
    assetAddress,
    "approve",
    caller,
    owner,
    spender,
    approveAmount,
    expirationLedger
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function transferAssets(
  assetAddress: string,
  caller: string,
  owner: string,
  receiver: string,
  amount: bigint
): Promise<boolean> {
  // decimals ** ?
  const prep = await prepareTransferAssets(
    assetAddress,
    "transfer",
    caller,
    owner,
    receiver,
    amount
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}

export async function transferShares(
  vaultAddress: string,
  caller: string,
  owner: string,
  receiver: string,
  sharesAmount: bigint
): Promise<boolean> {
  const prep = await prepareTransferShares(
    vaultAddress,
    "transfer_shares",
    caller,
    owner,
    receiver,
    sharesAmount
  );
  const sgn = await signTx(prep);
  return await sendTx(sgn);
}
