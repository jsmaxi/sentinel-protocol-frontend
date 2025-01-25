"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Wallet, ArrowLeft, ArrowRight } from "lucide-react";
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

type FormData = {
  name: string;
  description: string;
  eventDate: Date;
  eventTime: string;
  asset: string;
  oracleAddress: string;
  commissionFee: number;
  riskScore: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  exercising: "AUTO" | "MANUAL";
  lockPeriod: number;
  eventThreshold: number;
  unlockPeriod: number;
};

const CreateMarket = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormData>({
    defaultValues: {
      exercising: "AUTO",
    },
  });

  const onSubmit = (data: FormData) => {
    const emptyFields = Object.entries(data).filter(([key, value]) => !value);

    if (emptyFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required. Please fill in all the fields.",
      });
      return;
    }

    console.log("Form submitted:", data);
    toast({
      title: "Market Created",
      description: "Your market has been created successfully.",
    });
    router.push("/markets");
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
          <Button onClick={() => toast({ title: "Coming Soon" })}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create Market</h1>
            <p className="text-muted-foreground">
              Set up a new market with your parameters
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Market Name */}
              <FormField
                control={form.control}
                name="name"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your market"
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
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supported Asset</FormLabel>
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

              {/* Oracle Address */}
              <FormField
                control={form.control}
                name="oracleAddress"
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
            </form>
          </Form>
        </div>

        {/* Documentation Link */}
        <div className="mt-8 p-4 border rounded-lg">
          <Link
            href="https://github.com/"
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
            <div className="flex gap-4">
              <Link
                href="https://github.com/"
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
              <Link href="/" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateMarket;
