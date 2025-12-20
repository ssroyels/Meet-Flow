"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheckIcon, Sparkles, Zap } from "lucide-react";
import { MouseEvent } from "react";

/* ================= VARIANTS ================= */

const pricingCardVariants = cva(
  "relative group rounded-3xl p-6 py-8 w-full border transition-all duration-500 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white text-black border-neutral-200 hover:border-primary/50 shadow-sm hover:shadow-xl",
        highlighted:
          "bg-neutral-950 text-white border-neutral-800 shadow-2xl scale-[1.02] z-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const pricingCardIconVariants = cva("size-5 shrink-0 transition-transform group-hover:scale-110", {
  variants: {
    variant: {
      default: "text-primary",
      highlighted: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardSecondaryTextVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      highlighted: "text-neutral-400 group-hover:text-neutral-300",
    },
  },
});

/* ================= PROPS ================= */

interface Props extends VariantProps<typeof pricingCardVariants> {
  badge?: string | null;
  price: number;
  features: string[];
  title: string;
  description?: string | null;
  priceSuffix: string;
  className?: string;
  buttonText: string;
  onClick: () => void;
}

/* ================= COMPONENT ================= */

export const PricingCard = ({
  badge,
  price,
  features,
  title,
  description,
  priceSuffix,
  className,
  buttonText,
  onClick,
  variant,
}: Props) => {
  // Mouse tracking for the "Zahar" glow effect
  const mouseX = useMotionValue(0);
  const  mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const isHighlighted = variant === "highlighted";

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(pricingCardVariants({ variant }), className)}
    >
      {/* Interactive Hover Glow (Only for highlighted card) */}
      {isHighlighted && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(16, 185, 129, 0.15),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-x-2">
              <h3 className={cn(
                "text-2xl font-bold tracking-tight",
                isHighlighted ? "text-white" : "text-neutral-900"
              )}>
                {title}
              </h3>
              {badge && (
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isHighlighted 
                    ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400" 
                    : "bg-primary/10 text-primary border-none"
                )}>
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className={cn("text-sm leading-relaxed", pricingCardSecondaryTextVariants({ variant }))}>
                {description}
              </p>
            )}
          </div>
          {isHighlighted && <Zap className="size-6 text-emerald-400 fill-emerald-400/20" />}
        </div>

        <div className="flex items-baseline gap-x-1">
          <span className={cn(
            "text-4xl font-extrabold tracking-tighter",
            isHighlighted ? "text-white" : "text-neutral-900"
          )}>
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(price)}
          </span>
          <span className={cn("text-sm font-medium", pricingCardSecondaryTextVariants({ variant }))}>
            {priceSuffix}
          </span>
        </div>
      </div>

      <Separator className={cn("my-8 relative z-10", isHighlighted ? "bg-neutral-800" : "bg-neutral-100")} />

      {/* CTA Button */}
      <div className="relative z-10">
        <Button
          onClick={onClick}
          size="lg"
          className={cn(
            "w-full rounded-xl font-bold transition-all duration-300 py-6 text-base",
            isHighlighted 
              ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          {buttonText}
          {isHighlighted && <Sparkles className="ml-2 size-4" />}
        </Button>
      </div>

      {/* Features List */}
      <div className="mt-8 relative z-10 space-y-4">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em]",
          isHighlighted ? "text-emerald-500/80" : "text-neutral-400"
        )}>
          What&apos;s Included
        </p>
        <ul className="space-y-3.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-x-3 text-sm group/item">
              <div className={cn(
                "rounded-full p-0.5 transition-colors",
                isHighlighted ? "bg-emerald-500/10" : "bg-primary/5"
              )}>
                <CircleCheckIcon className={pricingCardIconVariants({ variant })} />
              </div>
              <span className={cn(
                "font-medium transition-colors",
                isHighlighted ? "text-neutral-300 group-hover/item:text-white" : "text-neutral-600"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Subtle Bottom Glow for Highlighted */}
      {isHighlighted && (
        <div className="absolute -bottom-24 -left-24 size-48 bg-emerald-500/20 blur-[100px] pointer-events-none" />
      )}
    </motion.div>
  );
};