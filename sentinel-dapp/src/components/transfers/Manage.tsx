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

const Manage = () => {
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const approveSharesForm = useForm();
  const transferSharesForm = useForm();
  const approveAssetsForm = useForm();
  const transferAssetsForm = useForm();

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
            <Button onClick={showComingSoon}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
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
                        <Input placeholder="Enter vault address" {...field} />
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
                        <Input placeholder="Enter spender address" {...field} />
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
                        <Input placeholder="Enter vault address" {...field} />
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
                        <Input placeholder="Enter asset address" {...field} />
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
                        <Input placeholder="Enter spender address" {...field} />
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
                        <Input placeholder="Enter asset address" {...field} />
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
                href="https://github.com/"
                target="_blank"
                className="text-sm hover:text-primary transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/privacy"
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
