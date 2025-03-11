"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Calendar,
  Wallet,
  BadgeHelp,
  User,
  DiamondPercent,
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import ConnectWallet from "../shared/ConnectWallet";
import NetworkInfo from "../shared/NetworkInfo";
import ContactEmail from "../shared/ContactEmail";
import { deposit, mint, redeem, withdraw } from "@/utils/VaultContractCaller";
import { useSearchParams } from "next/navigation";
import { fetchBalance } from "@/actions/serverActions";
import {
  Market,
  MarketDetailsType,
  MarketStatus,
  MarketType,
} from "@/types/market";
import { DateTimeConverter } from "@/utils/DateTimeConverter";
import { marketDetails } from "@/utils/MarketContractCaller";
import LoadingAnimation from "../shared/LoadingAnimation";
import { useToast } from "@/hooks/use-toast";
import config from "../../config/markets.json";

// const mockMarket: Market = {
//   id: "1",
//   name: "Flight Delay Insurance",
//   description: "Insurance against flight delays",
//   assetSymbol: "USDC",
//   assetAddress: "CBD...",
//   oracleName: "API V2",
//   oracleAddress: "CCD...",
//   marketAddress: "CCD...",
//   vaultAddress: "CCD...",
//   creatorAddress: "GBBD...",
//   status: MarketStatus.LIVE,
//   possibleReturn: 0,
//   totalAssets: BigInt(100000),
//   totalShares: BigInt(1000),
//   riskScore: MarketRiskScore.LOW,
//   yourShares: BigInt(0),
//   exercising: "Automatic",
//   eventTime: new Date(),
//   type: MarketType.HEDGE,
//   commissionFee: 2.5,
// };

type ActionType = "deposit" | "withdraw" | "mint" | "redeem" | null;

const explorer = config.accountExplorer;
const assetExplorer = config.assetExplorer;

export default function MarketDetails() {
  const searchParams = useSearchParams();
  const CONTRACT_ID = searchParams.get("market") ?? "";
  const SIDE = searchParams.get("side") ?? "";

  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null | undefined>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [refetchMarket, setRefetchMarket] = useState<boolean>(false);

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
    if (publicKey) setOwnerAddress(publicKey);
  }, [publicKey]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (isMounted) {
          setError(null);

          console.time("Fetch Market Details Timer");

          if (publicKey) {
            const market: MarketDetailsType = (await marketDetails(
              CONTRACT_ID,
              publicKey
            )) as MarketDetailsType;
            console.log("Market", market);

            if (!market) {
              // not found
              setError("Market not found");
              return;
            }

            const isHedge = SIDE === "HEDGE";

            const marketSide: Market = {
              id: Math.random().toString(36),
              name: market.name,
              description: market.description,
              assetAddress: market.hedge_asset_address,
              assetSymbol: isHedge
                ? market.hedge_asset_symbol
                : market.risk_asset_symbol,
              oracleAddress: market.oracle_address,
              oracleName: market.oracle_name,
              creatorAddress: isHedge
                ? market.hedge_admin_address
                : market.risk_admin_address,
              marketAddress: CONTRACT_ID,
              vaultAddress: isHedge
                ? market.hedge_address
                : market.risk_address,
              status: market.status,
              possibleReturn: 150,
              totalAssets: isHedge
                ? market.hedge_total_assets
                : market.risk_total_assets,
              totalShares: isHedge
                ? market.hedge_total_shares
                : market.risk_total_shares,
              riskScore: market.risk_score,
              yourShares: isHedge
                ? market.hedge_address_shares
                : market.risk_address_shares,
              exercising: market.is_automatic ? "Automatic" : "Manual",
              eventTime: DateTimeConverter.convertUnixSecondsToDate(
                market.event_time
              ),
              commissionFee: market.commission_fee,
              type: isHedge ? MarketType.HEDGE : MarketType.RISK,
            };

            setMarket(marketSide);

            const bal = await fetchBalance(
              publicKey,
              isHedge ? market.hedge_asset_symbol : market.risk_asset_symbol
            );
            if (bal !== undefined) setBalance(Number(bal.balance));
            else setBalance(undefined);
          }
        }
      } catch (error) {
        console.log(error);
        setError(
          "Something went wrong. Please try again or contact the support."
        );
      } finally {
        console.timeEnd("Fetch Market Details Timer");
      }
    };
    if (publicKey) fetchData();
    return () => {
      isMounted = false;
    };
  }, [publicKey, refetchMarket]);

  const calculateReturn = () => {
    // Approximate for display purposes
    // Formula: (input * (totalA + 1)) / (totalB + 1)
    if (!market) return "";
    const inputAmount = parseFloat(amount) || 0;
    if (selectedAction === "deposit" || selectedAction === "withdraw")
      return (
        (inputAmount * (Number(market.totalShares) + 1)) /
          (Number(market.totalAssets) + 1) +
        " Shares"
      );
    if (selectedAction === "mint" || selectedAction === "redeem")
      return (
        (inputAmount * (Number(market.totalAssets) + 1)) /
          (Number(market.totalShares) + 1) +
        " Assets"
      );
    return "";
  };

  const handlePercentageClick = (percentage: number) => {
    if (selectedAction === "deposit") {
      const value =
        balance === null || balance === undefined
          ? ""
          : ((balance * percentage) / 100).toString();
      setAmount(value);
    } else "";
  };

  const handleConfirm = async () => {
    if (!publicKey) {
      console.log("Wallet not connected");
      setError("Wallet not connected");
      return;
    }

    if (!CONTRACT_ID) {
      console.log("Contract ID missing");
      setError("Contract ID not found");
      return;
    }

    const operationName = selectedAction;

    if (!operationName) {
      console.log("Operation name missing");
      setError("Invalid operation");
      return;
    }

    if (!market?.vaultAddress) {
      console.log("Vault address missing");
      setError("Vault address not found");
      return;
    }

    if (
      !ownerAddress &&
      (selectedAction === "redeem" || selectedAction === "withdraw")
    ) {
      console.log("Owner address missing");
      setError("Missing owner address");
      return;
    }

    console.log(
      "Confirming action:",
      selectedAction,
      " - with amount:",
      amount,
      " - owner address:",
      ownerAddress
    );

    try {
      setError("");
      setLoading(true);

      switch (selectedAction) {
        case "deposit":
          const deposited = await deposit(
            market.vaultAddress,
            publicKey,
            publicKey,
            BigInt(amount)
          );
          if (deposited) {
            toast({
              title: "Deposit",
              description: "Deposit executed successfully.",
            });
          }
          break;
        case "mint":
          const minted = await mint(
            market.vaultAddress,
            publicKey,
            publicKey,
            BigInt(amount)
          );
          if (minted) {
            toast({
              title: "Mint",
              description: "Mint executed successfully.",
            });
          }
          break;
        case "withdraw":
          const withdrawn = await withdraw(
            market.vaultAddress,
            publicKey,
            publicKey,
            ownerAddress,
            BigInt(amount)
          );
          if (withdrawn) {
            toast({
              title: "Withdraw",
              description: "Withdraw executed successfully.",
            });
          }
          break;
        case "redeem":
          const redeemed = await redeem(
            market.vaultAddress,
            publicKey,
            publicKey,
            ownerAddress,
            BigInt(amount)
          );
          if (redeemed) {
            toast({
              title: "Redeem",
              description: "Redeem executed successfully.",
            });
          }
          break;
        default:
          console.log("Invalid action selected");
          return;
      }

      // Reset fields
      setSelectedAction(null);
      setAmount("");
      setRefetchMarket(!refetchMarket);
    } catch (e) {
      console.log(e);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderActionContent = () => {
    if (!selectedAction) return null;

    const actionTitle =
      selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1);
    const showOwnerAddress =
      selectedAction === "withdraw" || selectedAction === "redeem";

    return (
      <div className="mt-6 p-4 border rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">{actionTitle}</h3>
        <div className="space-y-4">
          {showOwnerAddress && (
            <div>
              <label className="text-sm text-muted-foreground">
                Owner Address
              </label>
              <Input
                type="text"
                placeholder="Enter owner address"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-muted-foreground">
              {selectedAction === "mint" || selectedAction === "redeem"
                ? "Shares Amount"
                : "Assets Amount"}
            </label>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedAction !== "deposit"}
                  onClick={() => handlePercentageClick(25)}
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedAction !== "deposit"}
                  onClick={() => handlePercentageClick(50)}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedAction !== "deposit"}
                  onClick={() => handlePercentageClick(75)}
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedAction !== "deposit"}
                  onClick={() => handlePercentageClick(100)}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
          {amount && (
            <>
              <div className="text-sm">
                <span className="text-muted-foreground">
                  Preview estimated amount:
                </span>
                <span className="ml-2">{calculateReturn()}</span>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full"
              >
                {loading && <LoadingAnimation />}
                Confirm {actionTitle}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        <div className="flex items-center justify-between">
          <Link
            href="/markets"
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to Markets
          </Link>
          <div className="flex items-center">
            <ConnectWallet
              publicKey={publicKey}
              onClick={handleConnectWallet}
            />
            <div className="text-right">
              <NetworkInfo />
            </div>
          </div>{" "}
        </div>

        {publicKey ? (
          <>
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {market ? market.name : "Loading..."}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {market?.description}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    {market && MarketStatus[market.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Primary Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Selected Side
                    </span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="text-lg font-semibold">
                        {market && MarketType[market.type]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Wallet Balance
                    </span>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      <span className="text-lg font-semibold">
                        {balance === null
                          ? "Loading..."
                          : balance === undefined
                          ? "Unknown"
                          : balance.toFixed(5) +
                            " " +
                            (market?.assetSymbol === "native"
                              ? "XLM"
                              : market?.assetSymbol)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Vault Shares
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span>
                          {market?.totalShares}{" "}
                          {market?.assetSymbol === "native"
                            ? "XLM"
                            : market?.assetSymbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Your:</span>
                        <span>
                          {market?.yourShares}{" "}
                          {market?.assetSymbol === "native"
                            ? "XLM"
                            : market?.assetSymbol}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Event Time
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-lg font-semibold">
                        {market && format(market.eventTime, "PPp")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gab-2 lg:gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Oracle
                    </span>
                    <div className="flex items-center gap-2">
                      <BadgeHelp className="h-5 w-5" />
                      <span className="text-md font-semibold hover:text-primary hover:underline">
                        {market && (
                          <Link
                            href={explorer + market.oracleAddress}
                            target="_blank"
                          >
                            {market.oracleName}
                          </Link>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Admin</span>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="text-md font-semibold hover:text-primary hover:underline">
                        {market && (
                          <Link
                            href={explorer + market.creatorAddress}
                            target="_blank"
                          >
                            {market.creatorAddress.slice(0, 4)}...
                            {market.creatorAddress.slice(-4)}
                          </Link>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Commission Fee
                    </span>
                    <div className="flex items-center gap-2">
                      <DiamondPercent className="h-5 w-5" />
                      <span className="text-md font-semibold">
                        {market && market.commissionFee + "%"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Asset</span>
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      <span className="text-md font-semibold hover:text-primary hover:underline">
                        {market && (
                          <Link
                            href={assetExplorer + market.assetAddress}
                            target="_blank"
                          >
                            {market.assetAddress.slice(0, 4)}...
                            {market.assetAddress.slice(-4)}
                          </Link>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={
                      selectedAction === "deposit" ? "default" : "outline"
                    }
                    disabled={loading}
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "deposit" ? null : "deposit"
                      )
                    }
                  >
                    {loading && <LoadingAnimation />}
                    Deposit
                  </Button>
                  <Button
                    size="lg"
                    variant={selectedAction === "mint" ? "default" : "outline"}
                    className="w-full"
                    disabled={loading}
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "mint" ? null : "mint"
                      )
                    }
                  >
                    {loading && <LoadingAnimation />}
                    Mint
                  </Button>
                  <Button
                    size="lg"
                    variant={
                      selectedAction === "withdraw" ? "default" : "outline"
                    }
                    className="w-full"
                    disabled={loading}
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "withdraw" ? null : "withdraw"
                      )
                    }
                  >
                    {loading && <LoadingAnimation />}
                    Withdraw
                  </Button>
                  <Button
                    size="lg"
                    variant={
                      selectedAction === "redeem" ? "default" : "outline"
                    }
                    className="w-full"
                    disabled={loading}
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "redeem" ? null : "redeem"
                      )
                    }
                  >
                    {loading && <LoadingAnimation />}
                    Redeem
                  </Button>
                </div>

                {renderActionContent()}
                <p className="text-sm text-gray-400">
                  {selectedAction === "deposit" &&
                    "Deposit: mints vault shares to receiver by depositing exactly assets of underlying tokens."}
                  {selectedAction === "mint" &&
                    "Mint: mints exactly vault shares to receiver by depositing assets of underlying tokens."}
                  {selectedAction === "withdraw" &&
                    "Withdraw: burns shares from owner and sends exactly assets of underlying tokens to receiver."}
                  {selectedAction === "redeem" &&
                    "Redeeem: burns exactly shares from owner and sends assets of underlying tokens to receiver."}
                </p>
              </CardContent>
              {error && (
                <CardFooter className="text-red-700">{error}</CardFooter>
              )}
            </Card>
          </>
        ) : (
          <p className="bold">
            Please connect your Freighter wallet to view all details.
          </p>
        )}

        <div className="text-center">
          <p className="text-muted-foreground">
            Wonder how assets work?{" "}
            <Link
              href="https://stellar.org/use-cases/ramps"
              className="text-primary hover:underline"
              target="_blank"
            >
              Learn how to obtain and enable crypto asset in your wallet
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-12 ml-4 text-center text-sm text-muted-foreground">
        <strong>Warning:</strong> The Sentinel protocol may contain bugs. Use it
        at your own risk.
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} Sentinel Protocol. All rights
              reserved.
            </div>
            <div className="flex gap-4 flex-wrap">
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
  );
}
