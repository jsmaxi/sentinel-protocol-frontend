"use client";

import { ArrowLeft, Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Market } from "@/types/market";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const mockMarkets: Market[] = [
  {
    id: "1",
    name: "Flight Delay Insurance",
    description: "Insurance against flight delays for major airlines",
    underlyingAsset: "USDC",
    assetIcon: "/usdc.png",
    oracleName: "FlightAPI",
    creatorAddress: "GBBD47385729XJKD",
    vaultAddress: "GBBD47385729XJKE",
    status: "LIVE" as const,
    possibleReturn: 12.5,
    totalAssets: 100000,
    totalShares: 1000,
    riskScore: "LOW" as const,
    yourShares: 10,
    exercising: "AUTO" as const,
    eventTime: new Date(),
    type: "HEDGE" as const,
  },
  {
    id: "2",
    name: "Weather Insurance",
    description: "Insurance against bad weather",
    underlyingAsset: "USDT",
    assetIcon: "/usdt.png",
    oracleName: "WeatherAPI",
    creatorAddress: "GBBD47385729XJKE",
    vaultAddress: "GBBD47385729XJKF",
    status: "PAUSED" as const,
    possibleReturn: 15.0,
    totalAssets: 200000,
    totalShares: 2000,
    riskScore: "MEDIUM" as const,
    yourShares: 20,
    exercising: "MANUAL" as const,
    eventTime: new Date(),
    type: "RISK" as const,
  },
];

const Portfolio = () => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<"ALL" | "HEDGE" | "RISK">(
    "ALL"
  );
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "LIVE" | "PAUSED" | "ENDED"
  >("ALL");
  const [selectedAsset, setSelectedAsset] = useState<"ALL" | "USDC" | "USDT">(
    "ALL"
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Market;
    direction: "asc" | "desc";
  } | null>(null);

  // Mock wallet balances
  const walletBalances = [
    { symbol: "XLM", balance: "1,234.5678" },
    { symbol: "USDC", balance: "10,000.00" },
    { symbol: "USDT", balance: "5,000.00" },
    { symbol: "BTC", balance: "0.12345678" },
    { symbol: "ETH", balance: "1.23456789" },
  ];

  const showComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development.",
    });
  };

  const userMarkets = mockMarkets.filter((market) => market.yourShares > 0);

  const filteredMarkets = useMemo(() => {
    return userMarkets.filter((market) => {
      const typeMatch = selectedType === "ALL" || market.type === selectedType;
      const statusMatch =
        selectedStatus === "ALL" || market.status === selectedStatus;
      const assetMatch =
        selectedAsset === "ALL" || market.underlyingAsset === selectedAsset;
      return typeMatch && statusMatch && assetMatch;
    });
  }, [selectedType, selectedStatus, selectedAsset]);

  const sortedMarkets = useMemo(() => {
    if (!sortConfig) return filteredMarkets;

    return [...filteredMarkets].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredMarkets, sortConfig]);

  const requestSort = (key: keyof Market) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/markets">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">Explore your positions</p>
            </div>
          </div>
          <Button onClick={showComingSoon}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) =>
                  setSelectedType(value as typeof selectedType)
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ALL" id="type-all" />
                  <Label htmlFor="type-all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HEDGE" id="type-hedge" />
                  <Label htmlFor="type-hedge">Hedge</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RISK" id="type-risk" />
                  <Label htmlFor="type-risk">Risk</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as typeof selectedStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Asset</Label>
              <Select
                value={selectedAsset}
                onValueChange={(value) =>
                  setSelectedAsset(value as typeof selectedAsset)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-muted-foreground">
              Total positions found:{" "}
            </span>
            <span className="font-semibold">{sortedMarkets.length}</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("name")}
                >
                  Market{" "}
                  {sortConfig?.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("type")}
                >
                  Type{" "}
                  {sortConfig?.key === "type" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("underlyingAsset")}
                >
                  Asset{" "}
                  {sortConfig?.key === "underlyingAsset" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("yourShares")}
                >
                  Your Shares{" "}
                  {sortConfig?.key === "yourShares" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("eventTime")}
                >
                  Event Time{" "}
                  {sortConfig?.key === "eventTime" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("status")}
                >
                  Status{" "}
                  {sortConfig?.key === "status" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary"
                  onClick={() => requestSort("possibleReturn")}
                >
                  Possible Return{" "}
                  {sortConfig?.key === "possibleReturn" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMarkets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell>
                    <Link
                      href={`/market/${market.id}`}
                      className="hover:text-primary"
                    >
                      {market.name}
                    </Link>
                  </TableCell>
                  <TableCell>{market.type}</TableCell>
                  <TableCell>{market.underlyingAsset}</TableCell>
                  <TableCell>{market.yourShares}</TableCell>
                  <TableCell>{format(market.eventTime, "PPp")}</TableCell>
                  <TableCell>{market.status}</TableCell>
                  <TableCell>{market.possibleReturn}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Wallet Balances Section */}
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Wallet Balances</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {walletBalances.map((balance) => (
              <div
                key={balance.symbol}
                className="p-4 rounded-lg border border-border/40 backdrop-blur-sm bg-background/80"
              >
                <div className="text-sm text-muted-foreground">
                  {balance.symbol}
                </div>
                <div className="text-lg font-semibold">{balance.balance}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-left text-sm text-muted-foreground mt-8">
          <strong>Warning:</strong> The Sentinel protocol may contain bugs. Use
          it at your own risk.
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                © {new Date().getFullYear()} Sentinel Protocol. All rights
                reserved.
              </div>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/"
                  target="_blank"
                  className="hover:text-primary"
                >
                  Documentation
                </Link>
                <Link href="/policy" className="hover:text-primary">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-primary">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Portfolio;
