"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { FieldValues, useForm } from "react-hook-form";
import Link from "next/link";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import ConnectWallet from "../shared/ConnectWallet";
import NetworkInfo from "../shared/NetworkInfo";
import ContactEmail from "../shared/ContactEmail";
import {
  approveAssets,
  approveShares,
  transferAssets,
  transferShares,
} from "@/utils/VaultContractCaller";
import LoadingAnimation from "../shared/LoadingAnimation";
import { useToast } from "@/hooks/use-toast";
import { getLatestLedgerSequence } from "@/actions/serverActions";

const Manage = () => {
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latestLedger, setLatestLedger] = useState<number | null>(null);

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
    const fetchLedger = async () => {
      try {
        if (publicKey) {
          const ledger = await getLatestLedgerSequence();
          setLatestLedger(ledger);
          console.log(ledger);
        }
      } catch (e) {
        console.log("LEDGER", e);
      }
    };
    fetchLedger();
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

  const transferSharesTo = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!publicKey) {
        console.log("Account not connected");
        setError("Account not connected");
        return;
      }
      const success = await transferShares(
        transferSharesForm.getValues("vaultAddress"),
        publicKey,
        publicKey,
        transferSharesForm.getValues("receiverAddress"),
        BigInt(transferSharesForm.getValues("transferAmount"))
      );
      if (success) {
        toast({
          title: "Transfer Shares",
          description: "Transfer shares executed successfully.",
        });
      }
    } catch (error) {
      console.log("Error", error);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    } finally {
      setLoading(false);
    }
  };

  const transferAssetsTo = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!publicKey) {
        console.log("Account not connected");
        setError("Account not connected");
        return;
      }
      const success = await transferAssets(
        transferAssetsForm.getValues("assetAddress"),
        publicKey,
        publicKey,
        transferAssetsForm.getValues("receiverAddress"),
        BigInt(transferAssetsForm.getValues("transferAmount"))
      );
      if (success) {
        toast({
          title: "Transfer Assets",
          description: "Transfer assets executed successfully.",
        });
      }
    } catch (error) {
      console.log("Error", error);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    } finally {
      setLoading(false);
    }
  };

  const approveSharesTo = async (fields: FieldValues) => {
    try {
      setError(null);
      setLoading(true);
      if (!publicKey) {
        console.log("Account not connected");
        setError("Account not connected");
        return;
      }
      const success = await approveShares(
        fields["vaultAddress"],
        publicKey,
        publicKey,
        fields["spenderAddress"],
        BigInt(fields["approveAmount"]),
        Number(fields["expiresInDays"])
      );
      if (success) {
        toast({
          title: "Approve Shares",
          description: "Approve shares executed successfully.",
        });
      }
    } catch (error) {
      console.log("Error", error);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    } finally {
      setLoading(false);
    }
  };

  const approveAssetsTo = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!publicKey) {
        console.log("Account not connected");
        setError("Account not connected");
        return;
      }
      const success = await approveAssets(
        approveAssetsForm.getValues("assetAddress"),
        publicKey,
        publicKey,
        approveAssetsForm.getValues("spenderAddress"),
        BigInt(approveAssetsForm.getValues("approveAmount")),
        Number(approveAssetsForm.getValues("expirationLedger"))
      );
      if (success) {
        toast({
          title: "Approve Assets",
          description: "Approve assets executed successfully.",
        });
      }
    } catch (error) {
      console.log("Error", error);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid animate-grid-flow opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/markets"
            className="inline-flex items-center text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Markets
          </Link>
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
          </div>
        </motion.div>

        {publicKey ? (
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
                  onSubmit={approveSharesForm.handleSubmit((e) =>
                    approveSharesTo(e)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={approveSharesForm.control}
                    defaultValue={""}
                    name="vaultAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vault Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vault address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={approveSharesForm.control}
                    name="spenderAddress"
                    defaultValue={""}
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
                    defaultValue={""}
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
                    defaultValue={""}
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <LoadingAnimation />} Submit
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="transfer-shares" className="mt-6">
              <Form {...transferSharesForm}>
                <h2 className="text-xl text-center">Transfer Shares</h2>
                <form
                  onSubmit={transferSharesForm.handleSubmit(transferSharesTo)}
                  className="space-y-4"
                >
                  <FormField
                    control={transferSharesForm.control}
                    name="vaultAddress"
                    defaultValue={""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vault Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vault address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transferSharesForm.control}
                    name="receiverAddress"
                    defaultValue={""}
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
                    defaultValue={""}
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <LoadingAnimation />} Submit
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="approve-assets" className="mt-6">
              <Form {...approveAssetsForm}>
                <h2 className="text-xl text-center">Approve Assets</h2>
                <form
                  onSubmit={approveAssetsForm.handleSubmit(approveAssetsTo)}
                  className="space-y-4"
                >
                  <FormField
                    control={approveAssetsForm.control}
                    name="assetAddress"
                    defaultValue={""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter asset address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={approveAssetsForm.control}
                    name="spenderAddress"
                    defaultValue={""}
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
                    defaultValue={""}
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
                    defaultValue={""}
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
                  {latestLedger && (
                    <p className="text-gray-400 text-sm">
                      Latest ledger: <strong>{latestLedger}</strong>
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <LoadingAnimation />} Submit
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="transfer-assets" className="mt-6">
              <Form {...transferAssetsForm}>
                <h2 className="text-xl text-center">Transfer Assets</h2>
                <form
                  onSubmit={transferAssetsForm.handleSubmit(transferAssetsTo)}
                  className="space-y-4"
                >
                  <FormField
                    control={transferAssetsForm.control}
                    name="assetAddress"
                    defaultValue={""}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter asset address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transferAssetsForm.control}
                    name="receiverAddress"
                    defaultValue={""}
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
                    defaultValue={""}
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <LoadingAnimation />} Submit
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="bold">
            Please connect your Freighter wallet to view all details.
          </p>
        )}

        {error && <p className="text-red-700">{error}</p>}

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
              <div className="text-sm hover:text-primary transition-colors">
                <ContactEmail />
              </div>
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
