import { signTx } from "@/actions/clientActions";
import {
  prepareDepositVault,
  prepareMintVault,
  prepareRedeemVault,
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
