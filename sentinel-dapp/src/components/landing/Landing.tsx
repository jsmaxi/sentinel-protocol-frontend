"use client";

import { Button } from "@/components/ui/button";
import {
  Shield,
  Zap,
  ArrowRight,
  Users,
  Wallet,
  ArrowUp,
  TicketsPlane,
  Target,
  LineChart,
  DollarSign,
  Sun,
  Moon,
  Github,
  Twitter,
  Mail,
  CalendarRange,
  ChevronDown,
  SearchCheck,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    title: "Security",
    description:
      "Robust security techniques ensuring your assets are protected.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "High-performance network with minimal latency.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join a thriving community of DeFi enthusiasts.",
  },
];

const steps = [
  {
    icon: Download,
    title: "Install Freighter Extension",
    description:
      "To interact with the network, install Freighter browser extension.",
  },
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Securely connect your digital wallet to our platform.",
  },
  {
    icon: SearchCheck,
    title: "Explore Markets",
    description: "Discover a range of hedge and risk options tailored for you.",
  },
];

const useCases = [
  {
    icon: TicketsPlane,
    title: "Flight Hedge",
    description:
      "Protect against flight delays and cancellations with automated payouts based on flight data.",
  },
  {
    icon: Target,
    title: "Sports Event",
    description:
      "Hedge against sports event outcomes with oracle-verified results.",
  },
  {
    icon: LineChart,
    title: "Token Price Changes",
    description:
      "Protect your portfolio against volatile token price movements.",
  },
  {
    icon: DollarSign,
    title: "Financial Hedging",
    description: "Secure your assets against various financial market risks.",
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/SentinelFi/", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/sentinel_fi/", label: "X" },
];

const roadmapItems = [
  {
    quarter: "Q1 2025",
    title: "Foundation",
    items: ["Launch Beta", "Core Features", "Security Audit"],
  },
  {
    quarter: "Q2 2025",
    title: "Growth",
    items: ["Advanced Analytics", "Mobile App", "Partner Integration"],
  },
  {
    quarter: "Q3 2025",
    title: "Expansion",
    items: ["New Markets", "Enhanced Features", "Community Programs"],
  },
  {
    quarter: "Q4 2025",
    title: "Innovation",
    items: ["AI Integration", "Cross-chain Support", "Rewards Program"],
  },
];

const Landing = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const elements = document.querySelectorAll(".animate-on-scroll");
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = elementTop < window.innerHeight && elementBottom >= 0;
        if (isVisible) {
          element.classList.add("animate-fade-in");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribe Simulation Worked",
        description: "Currently for display purposes only.",
      });
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollTo = (elementId: string) => {
    const featuresSection = document.getElementById(elementId);
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-b from-[#1A1F2C] via-background to-[#222222]"
              : "bg-gradient-to-b from-[#ffffff] via-background to-[#e8e8e8]"
          }`}
        >
          <div
            className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center ${
              theme === "dark" ? "opacity-40" : "opacity-30"
            }`}
          ></div>
          <div className="absolute inset-0 bg-grid animate-grid-flow"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="#">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sentinel
              </h1>
              <span
                className="glass px-3 py-1 text-sm rounded-full"
                title="Current application version"
              >
                Open Beta
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#community"
              className="text-sm hover:text-primary transition-colors"
            >
              Community
            </Link>
            <Link
              href="https://github.com/SentinelFi/SentinelFi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary transition-colors"
            >
              Documentation
            </Link>
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
            <Link href="/markets">
              <Button
                variant="outline"
                className="ml-4 border-primary/20 hover:border-primary/40"
              >
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Sentinel Finance
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Hedge risks on Soroban
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            Sentinel connects users seeking insurance with investors interested
            in assuming risks, all through transparent and automated smart
            contracts.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in">
            <Link href="/markets">
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://stellar.org/soroban" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/20 hover:border-primary/40"
              >
                Explore More
              </Button>
            </Link>
          </div>
          <button
            onClick={(_) => scrollTo("features")}
            className="mt-12 p-2 hover:scale-110 transition-all duration-1000 animate-bounce"
            aria-label="Scroll to features"
          >
            <ChevronDown className="w-6 h-6 text-primary" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Benefits & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass p-6 rounded-lg hover:scale-105 transition-transform border border-primary/10"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Carousel Section */}
      <section id="cases" className="relative py-20 z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Real World Use Cases
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselPrevious />
            <CarouselContent>
              {[...Array(2)].map((_, i) =>
                useCases.map((useCase, index) => (
                  <CarouselItem
                    key={`${i}-${index}`}
                    className="md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="glass p-6 rounded-lg h-full group hover:scale-105 transition-all duration-300 border border-primary/10">
                      <useCase.icon className="w-12 h-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {useCase.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Get Started with Sentinel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="glass p-6 rounded-lg hover:scale-105 transition-transform border border-primary/10"
              >
                <div className="relative">
                  <step.icon className="w-12 h-12 text-primary mb-4" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative py-20 z-10 animate-on-scroll">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roadmapItems.map((item) => (
              <div
                key={item.quarter}
                className="glass p-6 rounded-lg border border-primary/10 hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CalendarRange className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{item.quarter}</h3>
                </div>
                <h4 className="text-lg font-medium mb-3 text-primary">
                  {item.title}
                </h4>
                <ul className="space-y-2">
                  {item.items.map((listItem, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm">{listItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-20 z-10 animate-on-scroll">
        <div className="container mx-auto px-4 text-center">
          <div className="glass max-w-2xl mx-auto p-8 rounded-lg border border-primary/10">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative py-20 z-10 animate-on-scroll">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Social Circle
          </h2>
          <div className="flex justify-center gap-8">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-4 rounded-full hover:scale-110 transition-transform group"
              >
                <social.icon className="w-6 h-6 text-primary group-hover:text-accent" />
                <span className="sr-only">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative glass mt-20 z-10 border-t border-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm">
                © {new Date().getFullYear()} Sentinel Protocol. All Rights
                Reserved.
              </span>
            </div>
            <div className="flex gap-6">
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
                href="#"
                className="text-sm hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-16 right-8 p-3 rounded-full glass hover:scale-110 transition-all duration-300 z-50 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-6 h-6 text-primary" />
      </button>
    </div>
  );
};

export default Landing;
