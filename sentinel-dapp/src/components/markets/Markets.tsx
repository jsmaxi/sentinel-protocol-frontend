"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  Shield,
  TrendingUp,
  Plane,
  Sun,
  Moon,
  Plus,
  Search,
  SortAsc,
  Filter,
  ArrowUp,
  FileText,
  Code,
  Droplet,
  ArrowRight,
  Percent,
} from "lucide-react";
import { MarketCard } from "./MarketCard";
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import {
  MarketRiskScore,
  MarketStatus,
  MarketType,
  MarketTypeString,
  Market,
} from "@/types/market";
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
import { simulateTx } from "@/actions/serverActions";
import ContactEmail from "../shared/ContactEmail";
import { DateTimeConverter } from "@/utils/DateTimeConverter";

/*
const mockMarkets: Market[] = [
  {
    id: "1",
    name: "Flight Delay Insurance",
    description: "Insurance against flight delays for major airlines",
    assetAddress: "GBBD47385729XJKE",
    assetSymbol: "USDC",
    oracleName: "FlightAPI",
    oracleAddress: "GBBD47385729XJKE",
    creatorAddress: "GBBD47385729XJKD",
    vaultAddress: "GBBD47385729XJKE",
    status: MarketStatus.LIVE,
    possibleReturn: 12.5,
    totalAssets: BigInt(100000),
    totalShares: BigInt(1000),
    riskScore: MarketRiskScore.LOW,
    yourShares: BigInt(10),
    exercising: "Automatic",
    eventTime: new Date(),
    type: MarketType.HEDGE,
  },
  {
    id: "2",
    name: "Weather Insurance",
    description: "Protection against adverse weather conditions",
    assetAddress: "GBBD47385729XJKE",
    assetSymbol: "USDC",
    oracleName: "WeatherAPI",
    oracleAddress: "GBBD47385729XJKE",
    creatorAddress: "GBBD85739275LKJD",
    vaultAddress: "GBBD85739275LKJE",
    status: MarketStatus.LIVE,
    possibleReturn: 15.0,
    totalAssets: BigInt(50000),
    totalShares: BigInt(500),
    riskScore: MarketRiskScore.MEDIUM,
    yourShares: BigInt(5),
    exercising: "Automatic",
    eventTime: new Date(),
    type: MarketType.RISK,
  },
  {
    id: "3",
    name: "Crop Yield Protection",
    description: "Insurance for agricultural yield variations",
    assetAddress: "GBBD47385729XJKE",
    assetSymbol: "USDC",
    oracleName: "AgriAPI",
    oracleAddress: "GBBD47385729XJKE",
    creatorAddress: "GBBD96385729XJKD",
    vaultAddress: "GBBD96385729XJKE",
    status: MarketStatus.LIQUIDATED,
    possibleReturn: 18.5,
    totalAssets: BigInt(75000),
    totalShares: BigInt(750),
    riskScore: MarketRiskScore.HIGH,
    yourShares: BigInt(0),
    exercising: "Automatic",
    eventTime: new Date(),
    type: MarketType.HEDGE,
  },
  {
    id: "4",
    name: "Earthquake Coverage",
    description: "Protection against seismic events",
    assetAddress: "GBBD47385729XJKE",
    assetSymbol: "USDC",
    oracleName: "SeismicAPI",
    oracleAddress: "GBBD47385729XJKE",
    creatorAddress: "GBBD12385729XJKD",
    vaultAddress: "GBBD12385729XJKE",
    status: MarketStatus.LIVE,
    possibleReturn: 22.0,
    totalAssets: BigInt(200000),
    totalShares: BigInt(2000),
    riskScore: MarketRiskScore.HIGH,
    yourShares: BigInt(15),
    exercising: "Automatic",
    eventTime: new Date(),
    type: MarketType.RISK,
  },
];
*/

const markets: Market[] = [];

const App = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [marketType, setMarketType] = useState<MarketType>(MarketType.HEDGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMarkets, setSavedMarkets] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "risk" | "return">("date");
  const [statusFilter, setStatusFilter] = useState<Market["status"] | "ALL">(
    "ALL"
  );
  const [riskFilter, setRiskFilter] = useState<Market["riskScore"] | "ALL">(
    "ALL"
  );
  const [assetFilter, setAssetFilter] = useState<string | "ALL">("ALL");
  const [isSavedMarketsOpen, setIsSavedMarketsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ParsedSorobanError | null>(null);

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
          if (config.marketContracts.length === 0) return;

          for (let i = 0; i < config.marketContracts.length; i++) {
            const CONTRACT_ID = config.marketContracts[i];
            const name = (await getContractData("name", CONTRACT_ID)) as string;
            const desc = (await getContractData(
              "description",
              CONTRACT_ID
            )) as string;
            const hedgeVault = (await getContractData(
              "hedge_address",
              CONTRACT_ID
            )) as string;
            const riskVault = (await getContractData(
              "risk_address",
              CONTRACT_ID
            )) as string;
            const asset = (await getContractData(
              "asset_address",
              hedgeVault
            )) as string;
            const assetSymbol = (await getContractData(
              "asset_symbol",
              hedgeVault
            )) as string;
            const oracle = (await getContractData(
              "oracle_address",
              CONTRACT_ID
            )) as string;
            const oracleName = (await getContractData(
              "oracle_name",
              CONTRACT_ID
            )) as string;
            const admin = (await getContractData(
              "administrator_address",
              hedgeVault
            )) as string;
            const status = (await getContractData(
              "status",
              CONTRACT_ID
            )) as number;
            const riskScore = (await getContractData(
              "risk_score",
              CONTRACT_ID
            )) as number;
            const eventTime = (await getContractData(
              "expected_time_of_event",
              CONTRACT_ID
            )) as bigint;
            const exercising = (await getContractData(
              "exercising",
              CONTRACT_ID
            )) as string;
            const hedgeAssets = (await getContractData(
              "total_assets",
              hedgeVault
            )) as bigint;
            const hedgeShares = (await getContractData(
              "total_shares",
              hedgeVault
            )) as bigint;
            const riskAssets = (await getContractData(
              "total_assets",
              riskVault
            )) as bigint;
            const riskShares = (await getContractData(
              "total_shares",
              riskVault
            )) as bigint;
            const yourShares = BigInt(0); // TODO

            const marketHedgeSide: Market = {
              id: Math.random().toString(36),
              name: name,
              description: desc,
              assetAddress: asset,
              assetSymbol: assetSymbol,
              oracleAddress: oracle,
              oracleName: oracleName,
              creatorAddress: admin,
              vaultAddress: hedgeVault,
              status: status,
              possibleReturn: 0,
              totalAssets: hedgeShares,
              totalShares: hedgeAssets,
              riskScore: riskScore,
              yourShares: yourShares,
              exercising: exercising,
              eventTime: DateTimeConverter.convertUnixSecondsToDate(eventTime),
              type: MarketType.HEDGE,
            };

            console.log("HEDGE MARKET", marketHedgeSide);

            const marketRiskSide: Market = {
              id: Math.random().toString(36),
              name: name,
              description: desc,
              assetAddress: asset,
              assetSymbol: assetSymbol,
              oracleAddress: oracle,
              oracleName: oracleName,
              creatorAddress: admin,
              vaultAddress: riskVault,
              status: status,
              possibleReturn: 0,
              totalAssets: riskShares,
              totalShares: riskAssets,
              riskScore: riskScore,
              yourShares: yourShares,
              exercising: exercising,
              eventTime: DateTimeConverter.convertUnixSecondsToDate(eventTime),
              type: MarketType.RISK,
            };

            console.log("RISK MARKET", marketRiskSide);

            markets.push(marketHedgeSide);
            markets.push(marketRiskSide);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (publicKey) fetchData();
    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveMarket = (marketId: string) => {
    setSavedMarkets((prev) => {
      if (prev.includes(marketId)) {
        toast({
          title: "Market Removed",
          description: "Market has been removed from your saved list.",
        });
        return prev.filter((id) => id !== marketId);
      } else {
        toast({
          title: "Market Saved",
          description: "Market has been added to your saved list.",
        });
        return [...prev, marketId];
      }
    });
  };

  const getContractData = async (
    operationName: string,
    contractId: string
  ): Promise<string | number | bigint> => {
    try {
      if (!publicKey) {
        console.error("Wallet not connected");
        throw "Wallet not connected";
      }

      if (!contractId) {
        console.error("Contract ID missing");
        throw "Contract ID missing";
      }

      if (!operationName) {
        console.error("Operation name missing");
        throw "Operation name missing";
      }

      setLoading(true);
      setError(null);

      return await simulateTx(publicKey, contractId, operationName);
    } catch (error) {
      console.log("Error loading data.", error);
      alert("Error loading data. Please check the console for details.");
      // set error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets
    .filter((market) => market.type === marketType)
    .filter(
      (market) =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((market) =>
      statusFilter === "ALL" ? true : market.status === statusFilter
    )
    .filter((market) =>
      riskFilter === "ALL" ? true : market.riskScore === riskFilter
    )
    .filter((market) =>
      assetFilter === "ALL" ? true : market.assetSymbol === assetFilter
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.eventTime.getTime() - a.eventTime.getTime();
        case "risk":
          // const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, UNKNOWN: 3 };
          return a.riskScore - b.riskScore;
        case "return":
          return b.possibleReturn - a.possibleReturn;
        default:
          return 0;
      }
    });

  const savedFilteredMarkets = filteredMarkets.filter((market) =>
    savedMarkets.includes(market.id)
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative">
        <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sentinel
              </span>
              <NetworkInfo />
            </Link>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/portfolio"
                className="flex items-center gap-4 text-sm hover:text-primary transition-colors"
              >
                Portfolio
              </Link>
              <Link
                href="/manage"
                className="flex items-center gap-4 text-sm hover:text-primary transition-colors"
              >
                Transfers
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-4 text-sm hover:text-primary transition-colors"
              >
                {/* <Plus className="h-4 w-4" /> */}
                Create
              </Link>
              <a
                href="https://github.com/SentinelFi/SentinelFi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-primary transition-colors"
              >
                Documentation
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-accent/10 rounded-md transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <ConnectWallet
                publicKey={publicKey}
                onClick={handleConnectWallet}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold">Markets</h2>
            <p className="text-muted-foreground">Explore Sentinel Markets</p>
          </div>

          {/* Protocol Explanation */}
          <div className="bg-secondary/20 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              Understanding Market Sides
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Hedge Side</h4>
                <p className="text-sm text-muted-foreground">
                  Join as a Hedge participant when you want to protect against
                  specific risks. You deposit assets and receive Hedge Shares.
                  If the covered event occurs, you receive compensation from the
                  Risk pool.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Risk Side</h4>
                <p className="text-sm text-muted-foreground">
                  Join as a Risk participant to earn returns by providing
                  coverage. You deposit assets and receive Risk Shares. You earn
                  returns if no covered event occurs, but your deposit may be
                  used to compensate Hedge participants if it does.
                </p>
              </div>
            </div>
          </div>

          {publicKey ? (
            loading ? (
              <Processing />
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass hover:scale-105 transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Value Locked
                      </CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2.2k</div>
                    </CardContent>
                  </Card>
                  <Card className="glass hover:scale-105 transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Markets
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                    </CardContent>
                  </Card>
                  <Card className="glass hover:scale-105 transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Liquidation Percentage
                      </CardTitle>
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">25%</div>
                    </CardContent>
                  </Card>
                  <Card className="glass hover:scale-105 transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Protected Events
                      </CardTitle>
                      <Plane className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Type Selection, Sort, Filter, and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <RadioGroup
                    defaultValue="HEDGE"
                    onValueChange={(value: string) =>
                      setMarketType(MarketType[value as MarketTypeString])
                    }
                    className="flex gap-4"
                  >
                    <p>Side:</p>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="HEDGE" id="hedge" />
                      <Label htmlFor="hedge">Hedge Markets</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="RISK" id="risk" />
                      <Label htmlFor="risk">Risk Markets</Label>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-2 items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <SortAsc className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSortBy("date")}>
                          Date
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("risk")}>
                          Risk Level
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("return")}>
                          Possible Return
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("ALL")}
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter(MarketStatus.LIVE)}
                        >
                          Live
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setStatusFilter(MarketStatus.LIQUIDATED)
                          }
                        >
                          Liquidated
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter(MarketStatus.MATURED)}
                        >
                          Matured
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Risk Level</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setRiskFilter("ALL")}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRiskFilter(MarketRiskScore.LOW)}
                        >
                          Low
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRiskFilter(MarketRiskScore.MEDIUM)}
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRiskFilter(MarketRiskScore.HIGH)}
                        >
                          High
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Asset</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setAssetFilter("ALL")}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setAssetFilter("USDC")}
                        >
                          USDC
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search markets..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Saved Markets */}
                {savedMarkets.length > 0 && (
                  <Collapsible
                    open={isSavedMarketsOpen}
                    onOpenChange={setIsSavedMarketsOpen}
                  >
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold">Saved Markets</h3>
                      <CollapsibleTrigger asChild className="mx-4">
                        <Button variant="ghost" size="sm">
                          {isSavedMarketsOpen ? "Hide" : "Show"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedFilteredMarkets.map((market) => (
                          <div key={market.id} className="relative group">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleSaveMarket(market.id)}
                              aria-label="Remove from saved"
                            >
                              <Plus className="h-4 w-4 text-primary" />
                            </Button>
                            <MarketCard market={market} />
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Markets Grid */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Found Markets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMarkets.map((market) => (
                      <div key={market.id} className="relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSaveMarket(market.id)}
                          aria-label={
                            savedMarkets.includes(market.id)
                              ? "Remove from saved"
                              : "Add to saved"
                          }
                        >
                          <Plus
                            className={`h-4 w-4 ${
                              savedMarkets.includes(market.id)
                                ? "text-primary"
                                : ""
                            }`}
                          />
                        </Button>
                        <MarketCard market={market} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          ) : (
            <p className="bold">
              Please connect your Freighter wallet to view all details.
            </p>
          )}

          <Separator className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="https://github.com/SentinelFi/SentinelFi"
              target="_blank"
              className="group flex flex-col items-start space-y-2 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <FileText className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Docs</h3>
              <p className="text-sm text-muted-foreground">
                Explore how it works and how to use it
              </p>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="https://lab.stellar.org/account/fund"
              target="_blank"
              className="group flex flex-col items-start space-y-2 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Droplet className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Faucet</h3>
              <p className="text-sm text-muted-foreground">
                Get funds on test network
              </p>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="https://github.com/SentinelFi/SentinelFi"
              target="_blank"
              className="group flex flex-col items-start space-y-2 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Code className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Open-source contracts are available here
              </p>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-6 text-left text-sm text-muted-foreground">
            <strong>Warning:</strong> The Sentinel protocol may contain bugs.
            Use it at your own risk.
          </div>

          {/* Footer */}
          <footer className="mt-16 border-t border-border/40 pt-8 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-semibold">Sentinel</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Sentinel Protocol. All rights
                reserved.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/policy"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
                <div className="text-sm hover:text-primary transition-colors">
                  <ContactEmail />
                </div>
              </div>
            </div>
          </footer>
        </main>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-24 right-8 z-50 rounded-full shadow-lg"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default App;
