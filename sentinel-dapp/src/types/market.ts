export type Market = {
  id: string;
  name: string;
  description: string;
  underlyingAsset: string;
  assetIcon: string;
  oracleName: string;
  creatorAddress: string;
  vaultAddress: string;
  status: 'LIVE' | 'PAUSED' | 'ENDED';
  possibleReturn: number;
  totalAssets: number;
  totalShares: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  yourShares: number;
  exercising: 'MANUAL' | 'AUTO';
  eventTime: Date;
  type: 'HEDGE' | 'RISK';
};