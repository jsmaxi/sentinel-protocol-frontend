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

export enum MarketKind {
  HEDGE = 0,
  RISK = 1,
}

export type Market = {
  id: string;
  name: string;
  description: string;
  underlyingAsset: string;
  oracleName: string;
  creatorAddress: string;
  vaultAddress: string;
  status: 'LIVE' | 'LIQUIDATED' | 'MATURED';
  possibleReturn: number;
  totalAssets: number;
  totalShares: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  yourShares: number;
  exercising: 'MANUAL' | 'AUTO';
  eventTime: Date;
  type: 'HEDGE' | 'RISK';
};

export type MarketX = {
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
  type: MarketKind;
};