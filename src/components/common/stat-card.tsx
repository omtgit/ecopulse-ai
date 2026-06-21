"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const trendIsPositive = trend && trend.value > 0;
  const trendIsNegative = trend && trend.value < 0;

  return (
    <Card
      ref={cardRef}
      className={cn(
        "glass-card-hover p-6 relative overflow-hidden",
        isVisible ? "animate-fade-in" : "opacity-0",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={cn(
            "p-2 rounded-lg bg-primary/10",
            iconColor.includes("text-") ? "" : "bg-primary/10"
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {suffix}
            </span>
          )}
        </p>
        {trend && (
          <div className="flex items-center gap-1">
            {trendIsNegative ? (
              <TrendingDown className="h-3 w-3 text-emerald-500" />
            ) : trendIsPositive ? (
              <TrendingUp className="h-3 w-3 text-red-500" />
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trendIsNegative
                  ? "text-emerald-500"
                  : trendIsPositive
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
