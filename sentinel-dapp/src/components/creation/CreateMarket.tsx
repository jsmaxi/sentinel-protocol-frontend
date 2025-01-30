"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api";
import ConnectWallet from "../shared/ConnectWallet";
import NetworkInfo from "../shared/NetworkInfo";
import ContactEmail from "../shared/ContactEmail";
import { CreateMarketFormData } from "@/types/market";

const CreateMarket = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<CreateMarketFormData>({
    defaultValues: {
      exercising: "AUTO",
    },
  });
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (data: CreateMarketFormData) => {
    try {
      setError("");

      const emptyFields = Object.entries(data).filter(
        ([key, value]) => typeof value !== "number" && !value
      );

      if (emptyFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "All fields are required. Please fill in all the fields.",
        });
        return;
      }

      if (data.eventDate < new Date()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Event date must not be in the past.",
        });
        return;
      }

      console.log("Form submitted:", data);
      toast({
        title: "Market Creation Simulated",
        description: "Your market creation has been simulated successfully.",
      });
      router.push("/markets");
    } catch (e) {
      console.log("Error", e);
      setError(
        "Something went wrong. Please try again or contact the support."
      );
    }
  };

  return (
    <div className="min-h-screen relative pb-32">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/markets"
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
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

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page is currently in view mode only. Created markets are not
            persisted or verified on the blockchain. This is a demonstration of
            the interface, until a general framework for markets creation will
            be established.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create Market</h1>
            <p className="text-muted-foreground">
              Set up a new market with your parameters
            </p>
          </div>

          {publicKey ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Market Name */}
                <FormField
                  control={form.control}
                  name="name"
                  defaultValue={""}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter market name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  defaultValue={""}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the market"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    defaultValue={new Date()}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventTime"
                    defaultValue={""}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="space-y-0">
                        <FormLabel>Event Time (UTC)</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            onChange={(e) => onChange(e.target.value)}
                            value={value || ""}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Asset Selection */}
                <FormField
                  control={form.control}
                  name="asset"
                  defaultValue={""}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Underlying Asset</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="XLM">XLM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Oracle Name */}
                <FormField
                  control={form.control}
                  name="oracleName"
                  defaultValue={""}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oracle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Oracle Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Oracle Address */}
                <FormField
                  control={form.control}
                  name="oracleAddress"
                  defaultValue={""}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oracle Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Stellar address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission Fee */}
                <FormField
                  control={form.control}
                  name="commissionFee"
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Fee (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter commission fee"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Risk Score */}
                <FormField
                  control={form.control}
                  name="riskScore"
                  defaultValue={"LOW"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Score</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk score" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="UNKNOWN">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Exercising */}
                <FormField
                  control={form.control}
                  name="exercising"
                  defaultValue={"AUTO"}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Exercising</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="AUTO" id="auto" />
                            <Label htmlFor="auto">Automatic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MANUAL" id="manual" />
                            <Label htmlFor="manual">Manual</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lock Period */}
                <FormField
                  control={form.control}
                  name="lockPeriod"
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Period (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter lock period in seconds"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Threshold */}
                <FormField
                  control={form.control}
                  name="eventThreshold"
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Threshold (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter event threshold in seconds"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unlock Period */}
                <FormField
                  control={form.control}
                  name="unlockPeriod"
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unlock Period (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Enter unlock period in seconds"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Create Market
                </Button>

                {error && <p className="text-red-700">{error}</p>}
              </form>
            </Form>
          ) : (
            <p className="bold">
              Please connect your Freighter wallet to view all details.
            </p>
          )}
        </div>

        <div className="mt-8 p-4 border rounded-lg">
          <Link
            href="https://github.com/SentinelFi/SentinelFi"
            target="_blank"
            className="text-primary hover:underline flex items-center gap-2"
          >
            Read our documentation to learn more about creating markets{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <strong>Warning:</strong> The Sentinel protocol may contain bugs. Use it
        at your own risk.
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-background border-t">
        <div className="max-w-4xl mx-auto p-4">
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
              <Link href="/privacy" className="hover:text-primary">
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
};

export default CreateMarket;
