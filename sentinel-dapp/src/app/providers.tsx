"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

const AnimatedRoutes = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname(); // Current route path

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider defaultTheme="dark" attribute="class">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatedRoutes>{children}</AnimatedRoutes>
      </TooltipProvider>
    </QueryClientProvider>
    // </ThemeProvider>
  );
}
