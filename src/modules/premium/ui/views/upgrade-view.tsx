"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Zap, Rocket, Crown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { PricingCard } from "../components/pricing-card";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";

export const UpgradeView = () => {
  const trpc = useTRPC();

  const { data: products } = useSuspenseQuery(
    trpc.premium.getProducts.queryOptions()
  );

  const { data: currentSubscription } = useSuspenseQuery(
    trpc.premium.getCurrentSubscription.queryOptions()
  );

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background px-4 py-12 md:px-8 lg:py-20">
      {/* PREMIUM BACKGROUND BLUR EFFECTS */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 overflow-hidden blur-3xl">
        <div className="h-[300px] w-[600px] bg-primary/10 opacity-50 ring-1 ring-primary/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-y-12">
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary gap-2 rounded-full">
            <Sparkles className="size-3" />
            Pricing Plans
          </Badge>
          
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Elevate Your <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Workflow</span>
          </h1>
          
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-x-2 text-lg md:text-xl text-muted-foreground">
                You are currently on the 
                <span className="inline-flex items-center gap-1.5 font-bold text-foreground bg-muted px-3 py-1 rounded-lg border shadow-sm">
                  {currentSubscription ? <Crown className="size-4 text-amber-500" /> : <Zap className="size-4 text-blue-500" />}
                  {currentSubscription?.amount ?? "Free Starter"}
                </span>
                plan
             </div>
             {currentSubscription && (
               <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                 <CheckCircle2 className="size-3" /> Active Subscription
               </p>
             )}
          </div>
        </motion.div>

        {/* PRICING CARDS GRID */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {products.map((product, index) => {
            const isCurrentProduct = currentSubscription?.id === product.id;
            const isPremium = !!currentSubscription;

            let buttonText = "Get Started";
            let onClick = () => authClient.checkout({ products: [product.id] });

            if (isCurrentProduct) {
              buttonText = "Manage Subscription";
              onClick = () => authClient.customer.portal();
            } else if (isPremium) {
              buttonText = "Switch to this Plan";
              onClick = () => authClient.customer.portal();
            }

            const isHighlighted = product.metadata?.variant === "highlighted" || index === 1;

            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="h-full"
              >
                <PricingCard
                  title={product.name}
                  description={product.description}
                  buttonText={buttonText}
                  onClick={onClick}
                  variant={isHighlighted ? "highlighted" : "default"}
                  price={
                    product.prices[0].amountType === "fixed"
                      ? product.prices[0].priceAmount / 100
                      : 0
                  }
                  priceSuffix={`/${product.prices[0].recurringInterval}`}
                  features={product.benefits.map((benefit) => benefit.description)}
                  badge={
                    isCurrentProduct 
                    ? "Your Current Plan" 
                    : (product.metadata?.badge as string) ?? (isHighlighted ? "Most Popular" : null)
                  }
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* FOOTER INFO */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-muted-foreground flex items-center gap-2"
        >
          <Rocket className="size-4" />
          Secure checkout powered by Stripe. Cancel anytime.
        </motion.p>
      </div>
    </div>
  );
};

/* ================= LOADING & ERROR STATES ================= */

export const UpgradeViewLoading = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <LoadingState
      title="Securing Connection"
      description="Tailoring your premium experience..."
    />
  </div>
);

export const UpgradeViewError = () => (
  <div className="flex h-screen w-full items-center justify-center p-8">
    <div className="text-center space-y-4">
        <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <XCircleIcon className="size-6" />
        </div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
            We couldn't load the pricing plans. Please refresh or try again later.
        </p>
    </div>
  </div>
);

const XCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
)
