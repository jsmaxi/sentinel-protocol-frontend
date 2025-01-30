"use client";

import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AssetBalanceType,
  Market,
  MarketDetailsType,
  MarketRiskScore,
  MarketStatus,
  MarketStatusString,
  MarketType,
  MarketTypeString,
} from "@/types/market";
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
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import {
  ParsedSorobanError,
  SorobanErrorParser,
} from "../../utils/SorobanErrorParser";
import Processing from "../shared/Processing";
import ConnectWallet from "../shared/ConnectWallet";
import NetworkInfo from "../shared/NetworkInfo";
import config from "../../config/markets.json";
// import { simulateTx } from "@/actions/serverActions";
import ContactEmail from "../shared/ContactEmail";
import { fetchBalances } from "@/actions/serverActions";
import { marketDetails } from "@/utils/MarketContractCaller";
import { DateTimeConverter } from "@/utils/DateTimeConverter";

const CONTRACT_ID = config.marketContracts[0];

const mockMarkets: Market[] = [
  {
    id: "1",
    name: "Flight Delay Insurance",
    description: "Insurance against flight delays for major airlines",
    assetSymbol: "USDC",
    assetAddress: "GBBD47385729XJKD",
    oracleName: "FlightAPI",
    oracleAddress: "GBBD47385729XJKD",
    creatorAddress: "GBBD47385729XJKD",
    marketAddress: "GBBD47385729XJKD",
    vaultAddress: "GBBD47385729XJKE",
    status: MarketStatus.LIVE,
    possibleReturn: 12.5,
    totalAssets: BigInt(100000),
    totalShares: BigInt(1000),
    riskScore: MarketRiskScore.LOW,
    yourShares: BigInt(10),
    exercising: "AUTO" as const,
    eventTime: new Date(),
    commissionFee: 10,
    type: MarketType.HEDGE,
  },
  {
    id: "2",
    name: "Weather Insurance",
    description: "Insurance against bad weather",
    assetSymbol: "USDT",
    assetAddress: "GBBD47385729XJKD",
    oracleName: "WeatherAPI",
    oracleAddress: "GBBD47385729XJKD",
    creatorAddress: "GBBD47385729XJKE",
    marketAddress: "GBBD47385729XJKD",
    vaultAddress: "GBBD47385729XJKF",
    status: MarketStatus.LIQUIDATED,
    possibleReturn: 15.0,
    totalAssets: BigInt(200000),
    totalShares: BigInt(2000),
    riskScore: MarketRiskScore.MEDIUM,
    yourShares: BigInt(20),
    exercising: "MANUAL" as const,
    eventTime: new Date(),
    commissionFee: 5,
    type: MarketType.RISK,
  },
];

const Portfolio = () => {
  const [userMarkets, setUserMarkets] = useState<Market[]>([]);
  const [balances, setBalances] = useState<AssetBalanceType[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"ALL" | MarketType>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | MarketStatus>(
    "ALL"
  );
  const [selectedAsset, setSelectedAsset] = useState<"ALL" | "USDC" | "USDT">(
    "ALL"
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Market;
    direction: "asc" | "desc";
  } | null>(null);

  // const mockWalletBalances = [
  //   { symbol: "XLM", balance: "1,234.5678" },
  //   { symbol: "USDC", balance: "10,000.00" },
  //   { symbol: "USDT", balance: "5,000.00" },
  //   { symbol: "BTC", balance: "0.12345678" },
  //   { symbol: "ETH", balance: "1.23456789" },
  // ];

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await isConnected();
        if (!connected) throw "Freigher connection returned empty response";
        if (connected.error)
          throw `Freighter connection error: ${connected.error}`;
        if (connected.isConnected) {
          const pubKey = await getAddress();
          if (!pubKey) throw "Freigher address returned empty response";
          if (pubKey.error) throw `Freighter address error: ${pubKey.error}`;
          setPublicKey(pubKey.address);
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
        alert("Freighter wallet error. Please check the console for details.");
      }
    };

    checkFreighter();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (isMounted) {
          if (publicKey) {
            const bal = await fetchBalances(publicKey);
            const displayBal = bal.slice(0, 10); // Display maximum 10 balances
            setBalances(displayBal);
          }
        }
      } catch (error) {
        console.log("Error loading balances.", error);
        setError("Error occurred while fetching wallet balances.");
      }
    };
    if (publicKey) fetchData();
    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  const handleConnectWallet = async () => {
    try {
      const isAllowed = await setAllowed();
      if (!isAllowed) throw "Freigher returned empty allowed response";
      if (isAllowed.error) throw `Freighter allowed error: ${isAllowed.error}`;
      else
        console.log(
          "Successfully added the app to Freighter's Allow List " +
            isAllowed.isAllowed
        );
      const pubKey = await getAddress();
      if (!pubKey) throw "Freigher address returned empty response";
      if (pubKey.error) throw `Freighter address error: ${pubKey.error}`;
      setPublicKey(pubKey.address);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
      alert("Error connecting wallet. Please check the console for details.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) {
          setUserMarkets([]);
          setLoading(true);
          setError(null);

          if (!publicKey) {
            console.log("Wallet not connected");
            return;
          }

          if (config.marketContracts.length === 0) {
            console.log("No market contracts found");
            return;
          }

          console.time("Fetch Portfolio Timer");

          for (let i = 0; i < config.marketContracts.length; i++) {
            const CONTRACT_ID = config.marketContracts[i];

            const market: MarketDetailsType = (await marketDetails(
              CONTRACT_ID,
              publicKey
            )) as MarketDetailsType;

            if (market) {
              if (market.hedge_address_shares > BigInt(0)) {
                const marketHedgeSide: Market = {
                  id: Math.random().toString(36),
                  name: market.name,
                  description: market.description,
                  assetAddress: market.hedge_asset_address,
                  assetSymbol: market.risk_asset_symbol,
                  oracleAddress: market.oracle_address,
                  oracleName: market.oracle_name,
                  creatorAddress: market.hedge_admin_address,
                  marketAddress: CONTRACT_ID,
                  vaultAddress: market.hedge_address,
                  status: market.status,
                  possibleReturn: 0,
                  totalAssets: market.hedge_total_assets,
                  totalShares: market.hedge_total_shares,
                  riskScore: market.risk_score,
                  yourShares: market.hedge_address_shares,
                  exercising: market.is_automatic ? "Automatic" : "Manual",
                  eventTime: DateTimeConverter.convertUnixSecondsToDate(
                    market.event_time
                  ),
                  commissionFee: market.commission_fee,
                  type: MarketType.HEDGE,
                };
                setUserMarkets((prev) => [...prev, marketHedgeSide]);
              }
              if (market.risk_address_shares > BigInt(0)) {
                const marketRiskSide: Market = {
                  id: Math.random().toString(36),
                  name: market.name,
                  description: market.description,
                  assetAddress: market.risk_asset_address,
                  assetSymbol: market.risk_asset_symbol,
                  oracleAddress: market.oracle_address,
                  oracleName: market.oracle_name,
                  creatorAddress: market.risk_admin_address,
                  marketAddress: CONTRACT_ID,
                  vaultAddress: market.risk_address,
                  status: market.status,
                  possibleReturn: 0,
                  totalAssets: market.risk_total_assets,
                  totalShares: market.risk_total_shares,
                  riskScore: market.risk_score,
                  yourShares: market.risk_address_shares,
                  exercising: market.is_automatic ? "Automatic" : "Manual",
                  eventTime: DateTimeConverter.convertUnixSecondsToDate(
                    market.event_time
                  ),
                  commissionFee: market.commission_fee,
                  type: MarketType.RISK,
                };
                setUserMarkets((prev) => [...prev, marketRiskSide]);
              } else {
                // No user shares - ignore this market
              }
            } else {
              // No market found
            }
          }

          console.timeEnd("Fetch Portfolio Timer");
        }
      } catch (error) {
        console.log("Error loading data.", error);
        setError(
          "Something went wrong. Please try again or contact the support."
        );
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) fetchData();
    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  const filteredMarkets = useMemo(() => {
    return userMarkets.filter((market) => {
      const typeMatch = selectedType === "ALL" || market.type === selectedType;
      const statusMatch =
        selectedStatus === "ALL" || market.status === selectedStatus;
      const assetMatch =
        selectedAsset === "ALL" || market.assetSymbol === selectedAsset;
      return typeMatch && statusMatch && assetMatch;
    });
  }, [selectedType, selectedStatus, selectedAsset, userMarkets]);

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
    <div className="min-h-screen relative overflow-hidden">
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
          <div className="flex items-center">
            <ConnectWallet
              publicKey={publicKey}
              onClick={handleConnectWallet}
            />
            <div className="text-right">
              <NetworkInfo />
            </div>
          </div>
        </div>

        {publicKey ? (
          loading ? (
            <Processing />
          ) : (
            <>
              <div className="bg-card rounded-lg p-4 shadow-sm space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Filter by Side</Label>
                    <RadioGroup
                      value={
                        selectedType === "ALL"
                          ? selectedType
                          : MarketType[selectedType]
                      }
                      onValueChange={(value) =>
                        value === "ALL"
                          ? setSelectedType(value)
                          : setSelectedType(
                              MarketType[value as MarketTypeString]
                            )
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
                      value={
                        selectedStatus === "ALL"
                          ? selectedStatus
                          : MarketStatus[selectedStatus]
                      }
                      onValueChange={(value) =>
                        value === "ALL"
                          ? setSelectedStatus(value)
                          : setSelectedStatus(
                              MarketStatus[value as MarketStatusString]
                            )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="LIVE">Live</SelectItem>
                        <SelectItem value="LIQUiDATE">Liquidate</SelectItem>
                        <SelectItem value="LIQUiDATED">Liquidated</SelectItem>
                        <SelectItem value="MATURE">Mature</SelectItem>
                        <SelectItem value="MATURED">Matured</SelectItem>
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
                        <SelectItem value="XLM">XLM</SelectItem>
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
                        Side{" "}
                        {sortConfig?.key === "type" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-primary"
                        onClick={() => requestSort("assetSymbol")}
                      >
                        Asset{" "}
                        {sortConfig?.key === "assetSymbol" &&
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
                            href={`/market/${market.id}?market=${
                              market.marketAddress
                            }&side=${MarketType[market.type]}`}
                            className="hover:text-primary hover:underline"
                          >
                            {market.name}
                          </Link>
                        </TableCell>
                        <TableCell>{MarketType[market.type]}</TableCell>
                        <TableCell>{market.assetSymbol}</TableCell>
                        <TableCell>{market.yourShares}</TableCell>
                        <TableCell>{format(market.eventTime, "PPp")}</TableCell>
                        <TableCell>{MarketStatus[market.status]}</TableCell>
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
                  {balances.length > 0 ? (
                    balances.map((balance) => (
                      <div
                        key={balance.symbol}
                        className="p-4 rounded-lg border border-border/40 backdrop-blur-sm bg-background/80"
                      >
                        <div className="text-sm text-muted-foreground">
                          {balance.symbol}
                        </div>
                        <div className="text-lg font-semibold">
                          {balance.balance}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No balances found</p>
                  )}
                </div>
              </div>

              {error && <p className="text-red-700">{error}</p>}
            </>
          )
        ) : (
          <p className="bold">
            Please connect your Freighter wallet to view all details.
          </p>
        )}

        {/* Disclaimer */}
        <div className="text-left text-sm text-muted-foreground mt-8">
          <strong>Warning:</strong> The Sentinel protocol may contain bugs. Use
          it at your own risk.
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground flex-wrap">
              <div>
                © {new Date().getFullYear()} Sentinel Protocol. All rights
                reserved.
              </div>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/SentinelFi/SentinelFi"
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
                <div className="hover:text-primary">
                  <ContactEmail />
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Portfolio;
