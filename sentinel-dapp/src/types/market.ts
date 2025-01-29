export enum MarketType {
  HEDGE = 0,
  RISK = 1,
}

export enum MarketStatus {
  LIVE = 0,
  MATURE = 1,
  MATURED = 2,
  LIQUIDATE = 3,
  LIQUIDATED = 4,
}

export enum MarketRiskScore {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  UNKNOWN = 3,
}

export type MarketTypeString = keyof typeof MarketType;

export type MarketStatusString = keyof typeof MarketStatus;

export type MarketRiskScoreString = keyof typeof MarketRiskScore;

export type Market = {
  id: string;
  name: string;
  description: string;
  assetAddress: string;
  assetSymbol: string;
  oracleAddress: string;
  oracleName: string;
  creatorAddress: string;
  marketAddress: string;
  vaultAddress: string;
  status: MarketStatus;
  possibleReturn: number;
  totalAssets: bigint;
  totalShares: bigint;
  riskScore: MarketRiskScore;
  yourShares: bigint;
  exercising: string;
  eventTime: Date;
  commissionFee: number;
  type: MarketType;
};

export interface AssetBalanceType {
  symbol: string;
  balance: string;
}

export interface MarketDetailsType {
  name: string,
  description: string,
  status: MarketStatus,
  hedge_address: string,
  risk_address: string,
  oracle_address: string,
  oracle_name: string,
  risk_score: MarketRiskScore,
  event_time: bigint,
  is_automatic: boolean,
  commission_fee: number,
  hedge_admin_address: string,
  hedge_asset_address: string,
  hedge_asset_symbol: string,
  hedge_total_shares: bigint,
  hedge_total_assets: bigint,
  risk_admin_address: string,
  risk_asset_address: string,
  risk_asset_symbol: string,
  risk_total_shares: bigint,
  risk_total_assets: bigint,
}

export type CreateMarketFormData = {
  name: string;
  description: string;
  eventDate: Date;
  eventTime: string;
  asset: string;
  oracleName: string;
  oracleAddress: string;
  commissionFee: number;
  riskScore: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  exercising: "AUTO" | "MANUAL";
  lockPeriod: number;
  eventThreshold: number;
  unlockPeriod: number;
};