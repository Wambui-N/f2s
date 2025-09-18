"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Settings, 
  LogOut, 
  Sparkles, 
  User,
  BarChart3,
  HelpCircle,
  Bell,
  Search
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems = [
    { 
      href: "/dashboard", 
      label: "Forms", 
      icon: FileText,
      description: "Manage your forms"
    },
    { 
      href: "/dashboard/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      description: "View insights",
      badge: "Soon"
    },
    { 
      href: "/settings", 
      label: "Settings", 
      icon: Settings,
      description: "Configure integrations"
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        {/* Enhanced Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-white shadow-lg sm:flex">
          <div className="flex h-full max-h-screen flex-col">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <Link href="/" className="flex items-center gap-3 font-semibold group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FormToSheets
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search forms..." 
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-blue-50 hover:text-blue-700 ${
                      pathname === item.href
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Profile Section */}
            <div className="border-t bg-gray-50/50 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={user?.user_metadata?.avatar_url || "/placeholder-avatar.png"}
                  alt={user?.user_metadata?.full_name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-72 flex-1">
          {/* Mobile Header */}
          <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm">FormToSheets</span>
            </Link>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardLayout;