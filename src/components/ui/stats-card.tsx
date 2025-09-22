"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  className
}: StatsCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-2xl border-0 bg-white/80 backdrop-blur-sm", className)}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>
            <p className="text-4xl font-bold tracking-tight text-[#2c5e2a]">
              {value}
            </p>
            {change && (
              <div className="flex items-center space-x-1 text-sm">
                {change.type === "increase" ? (
                  <TrendingUp className="h-3 w-3 text-[#2c5e2a]" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-[#f95716]" />
                )}
                <span className={cn(
                  "font-medium",
                  change.type === "increase" ? "text-[#2c5e2a]" : "text-[#f95716]"
                )}>
                  {change.value > 0 ? "+" : ""}{change.value}%
                </span>
                <span className="text-gray-500">
                  {change.period}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2c5e2a] to-[#234b21] text-white">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}