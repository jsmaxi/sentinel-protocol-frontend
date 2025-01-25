export type Market = {
  id: string;
  name: string;
  description: string;
  underlyingAsset: string;
  assetIcon: string;
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