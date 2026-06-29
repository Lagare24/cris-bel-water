"use client";

import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type GradientVariant = "navy" | "slate" | "gray";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: GradientVariant;
  prefix?: string;
  suffix?: string;
}

const variantClasses: Record<GradientVariant, { icon: string; value: string }> = {
  navy: {
    icon: "bg-primary/12 text-primary",
    value: "text-primary",
  },
  slate: {
    icon: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    value: "text-foreground",
  },
  gray: {
    icon: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
    value: "text-foreground",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "navy",
  prefix = "",
  suffix = "",
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : parseFloat(value as string) || 0;

  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [numericValue, value]);

  const formattedValue =
    typeof value === "number"
      ? prefix + displayValue.toLocaleString() + suffix
      : value;

  const cardToneClass = variantClasses[variant];

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-lg", cardToneClass.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className={cn("text-3xl font-semibold tracking-tight", cardToneClass.value)}>
        {formattedValue}
      </p>
    </div>
  );
}
