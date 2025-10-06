"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton components for dashboard
export function StatsCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-5 h-5 rounded" />
      </div>
      <Skeleton className="h-10 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  );
}

export function FormCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
      {/* Form Thumbnail */}
      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
      
      {/* Form Info */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-9 h-9 rounded" />
        <Skeleton className="w-9 h-9 rounded" />
        <Skeleton className="w-9 h-9 rounded" />
        <Skeleton className="w-9 h-9 rounded" />
      </div>
    </div>
  );
}
