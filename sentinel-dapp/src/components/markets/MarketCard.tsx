"use client";

import { Market } from "@/types/market";
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
      case "LOW":
        return "bg-green-500/20 text-green-500";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-500";
      case "HIGH":
        return "bg-red-500/20 text-red-500";
    }
  };

  const getStatusColor = (status: Market["status"]) => {
    switch (status) {
      case "LIVE":
        return "bg-green-500/20 text-green-500";
      case "PAUSED":
        return "bg-yellow-500/20 text-yellow-500";
      case "ENDED":
        return "bg-red-500/20 text-red-500";
    }
  };

  const getTimeRemaining = (eventTime: Date) => {
    return formatDistanceToNow(eventTime, { addSuffix: true });
  };

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="hover:scale-[1.02] transition-transform duration-200 glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">{market.name}</CardTitle>
          <Badge className={getStatusColor(market.status)}>
            {market.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{market.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{market.underlyingAsset}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge className={getRiskColor(market.riskScore)}>
                {market.riskScore}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{market.totalShares} shares</span>
            </div>
            <div className="flex items-center gap-2">
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

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Oracle</span>
              <span className="text-sm font-medium">{market.oracleName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Creator</span>
              {/* <a
                href={`https://stellar.expert/explorer/public/account/${market.creatorAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {market.creatorAddress.slice(0, 4)}...
                {market.creatorAddress.slice(-4)}
              </a> */}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vault</span>
              {/* <a
                href={`https://stellar.expert/explorer/public/account/${market.vaultAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {market.vaultAddress.slice(0, 4)}...
                {market.vaultAddress.slice(-4)}
              </a> */}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Shares</span>
              <span className="text-sm font-medium">{market.yourShares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Shares
              </span>
              <span className="text-sm font-medium">{market.totalShares}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
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
