"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
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

const Manage = () => {
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ParsedSorobanError | null>(null);

  const approveSharesForm = useForm();
  const transferSharesForm = useForm();
  const approveAssetsForm = useForm();
  const transferAssetsForm = useForm();

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

  const showComingSoon = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development.",
    });
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

  return (
    <div className="min-h-screen relative">
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Back to Markets Link */}
        <Link
          href="/markets"
          className="inline-flex items-center text-sm hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Approve & Transfer</h1>
              <p className="text-muted-foreground">
                Approve and transfer your assets and shares
              </p>
            </div>
            {publicKey ? (
              <span className="text-sm font-medium">
                Connected:{" "}
                <Link
                  href={
                    `https://stellar.expert/explorer/testnet/account/` +
                    publicKey
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
        </motion.div>

        {publicKey ? (
          loading ? (
            <Processing />
          ) : (
            <Tabs defaultValue="approve-shares" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TabsList className="w-full">
                  <TabsTrigger value="approve-shares" className="flex-1">
                    Approve Shares
                  </TabsTrigger>
                  <TabsTrigger value="transfer-shares" className="flex-1">
                    Transfer Shares
                  </TabsTrigger>
                </TabsList>
                <TabsList className="w-full">
                  <TabsTrigger value="approve-assets" className="flex-1">
                    Approve Assets
                  </TabsTrigger>
                  <TabsTrigger value="transfer-assets" className="flex-1">
                    Transfer Assets
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="approve-shares" className="mt-6">
                <Form {...approveSharesForm}>
                  <h2 className="text-xl text-center">Approve Shares</h2>
                  <form
                    onSubmit={approveSharesForm.handleSubmit(showComingSoon)}
                    className="space-y-4"
                  >
                    <FormField
                      control={approveSharesForm.control}
                      name="vaultAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vault Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter vault address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveSharesForm.control}
                      name="spenderAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spender Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter spender address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveSharesForm.control}
                      name="approveAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approve Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveSharesForm.control}
                      name="expiresInDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires In Days</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter days"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="transfer-shares" className="mt-6">
                <Form {...transferSharesForm}>
                  <h2 className="text-xl text-center">Transfer Shares</h2>
                  <form
                    onSubmit={transferSharesForm.handleSubmit(showComingSoon)}
                    className="space-y-4"
                  >
                    <FormField
                      control={transferSharesForm.control}
                      name="vaultAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vault Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter vault address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferSharesForm.control}
                      name="receiverAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receiver Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter receiver address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferSharesForm.control}
                      name="transferAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transfer Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="approve-assets" className="mt-6">
                <Form {...approveAssetsForm}>
                  <h2 className="text-xl text-center">Approve Assets</h2>
                  <form
                    onSubmit={approveAssetsForm.handleSubmit(showComingSoon)}
                    className="space-y-4"
                  >
                    <FormField
                      control={approveAssetsForm.control}
                      name="assetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter asset address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveAssetsForm.control}
                      name="spenderAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spender Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter spender address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveAssetsForm.control}
                      name="approveAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approve Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={approveAssetsForm.control}
                      name="expirationLedger"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Ledger</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter ledger number"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="transfer-assets" className="mt-6">
                <Form {...transferAssetsForm}>
                  <h2 className="text-xl text-center">Transfer Assets</h2>
                  <form
                    onSubmit={transferAssetsForm.handleSubmit(showComingSoon)}
                    className="space-y-4"
                  >
                    <FormField
                      control={transferAssetsForm.control}
                      name="assetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter asset address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferAssetsForm.control}
                      name="receiverAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receiver Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter receiver address"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferAssetsForm.control}
                      name="transferAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transfer Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )
        ) : (
          <p className="bold">
            Please connect your Freighter wallet to view all details.
          </p>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-left text-sm text-muted-foreground">
          <strong>Warning:</strong> The Sentinel protocol may contain bugs. Use
          it at your own risk.
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/40 pt-8 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sentinel Protocol. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/SentinelFi/SentinelFi"
                target="_blank"
                className="text-sm hover:text-primary transition-colors"
              >
                Documentation
              </Link>
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
              <Link
                href="/contact"
                className="text-sm hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>

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
  );
};

export default Manage;
