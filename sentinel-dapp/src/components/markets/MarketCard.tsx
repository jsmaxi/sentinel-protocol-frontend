"use client";

import {
  MarketRiskScore,
  MarketStatus,
  Market,
  MarketType,
} from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, Users, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const getRiskColor = (risk: Market["riskScore"]) => {
    switch (risk) {
      case MarketRiskScore.LOW:
        return "bg-green-500/20 text-green-500";
      case MarketRiskScore.MEDIUM:
        return "bg-yellow-500/20 text-yellow-500";
      case MarketRiskScore.HIGH:
        return "bg-red-500/20 text-red-500";
      case MarketRiskScore.UNKNOWN:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusColor = (status: Market["status"]) => {
    switch (status) {
      case MarketStatus.LIVE:
        return "bg-green-500/20 text-green-500";
      case MarketStatus.LIQUIDATE | MarketStatus.LIQUIDATED:
        return "bg-yellow-500/20 text-yellow-500";
      case MarketStatus.MATURE | MarketStatus.MATURED:
        return "bg-red-500/20 text-blue-500";
    }
  };

  const getTimeRemaining = (eventTime: Date) => {
    return formatDistanceToNow(eventTime, { addSuffix: true });
  };

  return (
    <Link
      href={`/market/${market.id}?market=${market.marketAddress}&side=${
        MarketType[market.type]
      }`}
    >
      <Card className="hover:scale-[1.02] transition-transform duration-200 glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">{market.name}</CardTitle>
          <Badge
            className={getStatusColor(market.status)}
            title="Market status"
          >
            {MarketStatus[market.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{market.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2" title="Asset">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {market.assetSymbol === "native" ? "XLM" : market.assetSymbol}
              </span>
            </div>
            <div className="flex items-center gap-2" title="Risk score">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge className={getRiskColor(market.riskScore)}>
                {MarketRiskScore[market.riskScore]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{market.totalShares} shares</span>
            </div>
            <div className="flex items-center gap-2" title="Event time">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm">
                  {format(market.eventTime, "PPp")}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({getTimeRemaining(market.eventTime)})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Oracle</span>
              <span className="text-sm font-medium">{market.oracleName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Admin</span>
              <span className="text-sm font-medium">
                {market.creatorAddress.slice(0, 4)}...
                {market.creatorAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vault</span>
              <span className="text-sm font-medium">
                {market.vaultAddress.slice(0, 4)}...
                {market.vaultAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Assets
              </span>
              <span className="text-sm font-medium">{market.totalAssets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Shares
              </span>
              <span className="text-sm font-medium">{market.totalShares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Shares</span>
              <span className="text-sm font-medium">{market.yourShares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Commission</span>
              <span className="text-sm font-medium">
                {market.commissionFee} %
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Possible Return
              </span>
              <span className="text-lg font-semibold text-primary">
                {market.possibleReturn}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
