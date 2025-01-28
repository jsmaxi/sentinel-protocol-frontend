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
  underlyingAsset: string;
  oracleName: string;
  creatorAddress: string;
  vaultAddress: string;
  status: MarketStatus;
  possibleReturn: number;
  totalAssets: bigint;
  totalShares: bigint;
  riskScore: MarketRiskScore;
  yourShares: bigint;
  exercising: string;
  eventTime: Date;
  type: MarketType;
};