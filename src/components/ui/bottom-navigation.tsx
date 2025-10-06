"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  Mail,
  BarChart3,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeFormsCount: number;
  newSubmissionsCount: number;
  loading: boolean;
  onCreateClick: () => void;
}

export function BottomNavigation({ 
  activeFormsCount, 
  newSubmissionsCount, 
  loading, 
  onCreateClick 
}: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      badge: null
    },
    {
      href: "/dashboard/forms",
      label: "Forms",
      icon: FileText,
      badge: loading ? "..." : (activeFormsCount > 0 ? activeFormsCount.toString() : null)
    },
    {
      href: "/dashboard/submissions",
      label: "Submissions",
      icon: Mail,
      badge: loading ? "..." : (newSubmissionsCount > 0 ? newSubmissionsCount.toString() : null)
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                isActive 
                  ? "text-[#2c5e2a] bg-[#2c5e2a]/5" 
                  : "text-gray-600 hover:text-[#2c5e2a] hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-[#2c5e2a] text-white flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Floating Create Button */}
      <Button
        onClick={onCreateClick}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-12 w-12 rounded-full shadow-lg bg-[#2c5e2a] hover:bg-[#234b21] text-white"
        size="lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
