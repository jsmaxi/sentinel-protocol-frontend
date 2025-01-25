"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Calendar, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import {
  BASE_FEE,
  Contract,
  Networks,
  scValToNative,
  SorobanRpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  ParsedSorobanError,
  SorobanErrorParser,
} from "../../utils/SorobanErrorParser";
import Processing from "../shared/Processing";

const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";
const CONTRACT_ID = "CCXPET3VSGNFRZMGDAQ2WLF5G4CRQN22J7XAQGY5VACJYK4IUGCR2ZOL";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const TIMEOUT_SEC = 30;

// Mock data - replace with actual data fetching
const mockMarket = {
  id: "1",
  name: "Flight Delay Insurance",
  description: "Insurance against flight delays",
  underlyingAsset: "USDC",
  assetIcon: "/usdc.png",
  oracleName: "Acurast",
  creatorAddress: "GBBD...",
  status: "LIVE",
  possibleReturn: 12.5,
  totalAssets: 100000,
  totalShares: 1000,
  riskScore: "LOW",
  yourShares: 10,
  exercising: "AUTO",
  eventTime: new Date(),
  selectedSide: "HEDGE",
  walletBalance: 1000,
  hedgeVaultBalance: 5000,
  riskVaultBalance: 7500,
  commissionFee: 2.5,
};

type ActionType = "deposit" | "withdraw" | "mint" | "redeem" | null;

export default function MarketDetails() {
  const { id } = useParams();
  const market = mockMarket; // Replace with actual data fetching
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) {
          const hedge = await getContractData("hedge_address");
          const risk = await getContractData("risk_address");
          console.log(hedge, risk);
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

  const calculateReturn = () => {
    const inputAmount = parseFloat(amount) || 0;
    return (inputAmount * (1 + market.possibleReturn / 100)).toFixed(2);
  };

  const handlePercentageClick = (percentage: number) => {
    const value = ((market.walletBalance * percentage) / 100).toString();
    setAmount(value);
  };

  const handleConfirm = () => {
    // Handle confirmation logic here
    console.log(
      "Confirming action:",
      selectedAction,
      "with amount:",
      amount,
      "owner:",
      ownerAddress
    );
    setSelectedAction(null);
    setAmount("");
    setOwnerAddress("");
  };

  const getContractData = async (operationName: string) => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }

    if (!CONTRACT_ID) {
      console.error("Contract ID missing");
      return;
    }

    if (!SOROBAN_URL) {
      console.error("Soroban URL missing");
      return;
    }

    if (!operationName) {
      console.error("Operation name missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const server = new SorobanRpc.Server(SOROBAN_URL);
      const account = await server.getAccount(publicKey);
      const contract = new Contract(CONTRACT_ID);

      const operation = contract.call(operationName);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .setTimeout(TIMEOUT_SEC)
        .addOperation(operation)
        .build();

      const simulated = await server.simulateTransaction(transaction);
      const sim: any = simulated;

      if (sim.error) {
        console.log("Received error", typeof sim.error);
        // const parsed = SorobanErrorParser.parse(sim.error, generateErrorMap());
        // setError(parsed);
      } else {
        console.log("cost:", sim.cost);
        console.log("result:", sim.result);
        console.log("latest ledger:", sim.latestLedger);
        console.log(
          "human readable result:",
          scValToNative(sim.result?.retval)
        );
        const returnValue: any = scValToNative(sim.result?.retval);
        console.log("Value: ", returnValue);
      }
    } catch (error) {
      console.log("Error loading data.", error);
      alert("Error loading data. Please check the console for details.");
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
                  onClick={() => handlePercentageClick(25)}
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentageClick(50)}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentageClick(75)}
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
                <span className="text-muted-foreground">Estimated return:</span>
                <span className="ml-2">
                  {calculateReturn()} {market.underlyingAsset}
                </span>
              </div>
              <Button onClick={handleConfirm} className="w-full">
                Confirm {actionTitle}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10" /> */}

      <div className="max-w-7xl mx-auto space-y-8 relative">
        <div className="flex items-center justify-between">
          <Link
            href="/markets"
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to Markets
          </Link>
          {publicKey ? (
            <span className="text-sm font-medium">
              Connected:{" "}
              <Link
                href={
                  `https://stellar.expert/explorer/testnet/account/` + publicKey
                }
                target="_blank"
                className="hover:underline"
              >
                {publicKey.slice(0, 4)}...
                {publicKey.slice(-4)}
              </Link>
            </span>
          ) : (
            <Button onClick={handleConnectWallet}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>

        {publicKey ? (
          loading ? (
            <Processing />
          ) : (
            <Card className="glass">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{market.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {market.description}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    {market.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Selected Side
                    </span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="text-lg font-semibold">
                        {market.selectedSide}
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
                        {market.walletBalance} {market.underlyingAsset}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Vault Balances
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Hedge:</span>
                        <span>
                          {market.hedgeVaultBalance} {market.underlyingAsset}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Risk:</span>
                        <span>
                          {market.riskVaultBalance} {market.underlyingAsset}
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
                        {format(market.eventTime, "PPp")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={
                      selectedAction === "deposit" ? "default" : "outline"
                    }
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "deposit" ? null : "deposit"
                      )
                    }
                  >
                    Deposit
                  </Button>
                  <Button
                    size="lg"
                    variant={selectedAction === "mint" ? "default" : "outline"}
                    className="w-full"
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "mint" ? null : "mint"
                      )
                    }
                  >
                    Mint
                  </Button>
                  <Button
                    size="lg"
                    variant={
                      selectedAction === "withdraw" ? "default" : "outline"
                    }
                    className="w-full"
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "withdraw" ? null : "withdraw"
                      )
                    }
                  >
                    Withdraw
                  </Button>
                  <Button
                    size="lg"
                    variant={
                      selectedAction === "redeem" ? "default" : "outline"
                    }
                    className="w-full"
                    onClick={() =>
                      setSelectedAction(
                        selectedAction === "redeem" ? null : "redeem"
                      )
                    }
                  >
                    Redeem
                  </Button>
                </div>

                {renderActionContent()}
              </CardContent>
            </Card>
          )
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
              <Link href="#" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
