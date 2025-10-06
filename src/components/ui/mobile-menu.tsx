"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  X,
  Home,
  FileText,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  User,
  ChevronDown,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  activeFormsCount: number;
  newSubmissionsCount: number;
  loading: boolean;
  onSignOut: () => void;
}

export function MobileMenu({ 
  activeFormsCount, 
  newSubmissionsCount, 
  loading, 
  onSignOut 
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const primaryNavItems = [
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

  const resourcesItems = [
    { href: "/dashboard/resources", label: "All Resources" },
    { href: "/dashboard/resources/traffic-starter", label: "Traffic Starter Kit" },
    { href: "/dashboard/resources/tutorials", label: "Video Tutorials" },
    { href: "/dashboard/resources/best-practices", label: "Best Practices" },
  ];

  const userMenuItems = [
    { href: "/dashboard/account", label: "Account Settings", icon: User },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "#", label: "Logout", icon: LogOut, action: onSignOut },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 sm:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <SheetTitle className="text-lg font-bold text-[#2c5e2a]">
                ShelfCue
              </SheetTitle>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-6 space-y-2">
              {primaryNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-[#2c5e2a]/10 text-[#2c5e2a] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs bg-[#2c5e2a]/10 text-[#2c5e2a]">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}

              {/* Resources Section */}
              <div className="pt-4">
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                    resourcesOpen ? "bg-[#2c5e2a]/10 text-[#2c5e2a]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BookOpen className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">Resources</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                </button>

                {resourcesOpen && (
                  <div className="ml-6 mt-2 space-y-1">
                    {resourcesItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className="block w-full px-4 py-2 text-sm text-gray-600 hover:text-[#2c5e2a] hover:bg-[#2c5e2a]/5 rounded-md transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-6 space-y-3">
            {/* Settings */}
            <button
              onClick={() => handleNavClick("/dashboard/settings")}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                pathname === "/dashboard/settings"
                  ? "bg-[#2c5e2a]/10 text-[#2c5e2a] font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span>Settings</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2c5e2a] to-[#234b21] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">
                    {user?.user_metadata?.full_name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="mt-2 space-y-1">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          handleNavClick(item.href);
                        }
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2c5e2a] transition-colors rounded-md"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
