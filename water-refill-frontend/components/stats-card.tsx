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

const variantColors: Record<GradientVariant, string> = {
  navy: "#0044ad",
  slate: "#475569",
  gray: "#64748b",
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

  const bgColor = variantColors[variant];

  return (
    <div
      className="rounded-lg shadow-xl overflow-hidden relative"
      style={{ backgroundColor: bgColor }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shadow-lg">
            <Icon className="w-6 h-6 text-white drop-shadow-md" />
          </div>
        </div>
        <h3 className="text-white/90 text-sm font-medium mb-1 drop-shadow-sm">{title}</h3>
        <p className="text-4xl font-bold text-white drop-shadow-md">{formattedValue}</p>
      </div>
    </div>
  );
}
