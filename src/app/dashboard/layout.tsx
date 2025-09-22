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
  Plus,
  CreditCard,
  MessageCircle,
  BookOpen,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Megaphone
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Mock Google Sheets connection status - replace with real logic
  const [googleSheetsStatus, setGoogleSheetsStatus] = React.useState<'connected' | 'disconnected' | 'error'>('connected');

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
      description: "View insights"
    },
    { 
      href: "/dashboard/settings", 
      label: "Settings", 
      icon: Settings,
      description: "Configure integrations"
    },
  ] as Array<{
    href: string;
    label: string;
    icon: any;
    description: string;
    badge?: string;
  }>;

  const accountItems = [
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: CreditCard,
      description: "Manage subscription",
      badge: "Pro"
    }
  ];

  const supportItems = [
    {
      href: "/dashboard/help",
      label: "Help Center",
      icon: HelpCircle,
      description: "Documentation & guides"
    },
    {
      href: "/dashboard/support",
      label: "Contact Support",
      icon: MessageCircle,
      description: "Get help from our team"
    },
    {
      href: "/dashboard/whats-new",
      label: "What's New",
      icon: Megaphone,
      description: "Latest updates",
      badge: "New"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-[#fff8e8] to-white">
        {/* Enhanced Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-white/90 backdrop-blur-sm shadow-xl sm:flex">
          <div className="flex h-full max-h-screen flex-col">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-[#2c5e2a]/5 to-[#f95716]/5">
              <Link href="/" className="flex items-center gap-3 font-semibold group">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-[#2c5e2a]">
                  ShelfCue
                </span>
              </Link>
            </div>


            {/* Quick Actions */}
            <div className="px-4 py-6">
              <div className="space-y-2">
                {/* <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</p> */}
                <Button 
                  onClick={() => {
                    router.push('/dashboard');
                    // Trigger create form modal - this will be handled by the dashboard page
                    setTimeout(() => {
                      const event = new CustomEvent('openCreateFormModal');
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  className="w-full justify-start bg-[#2c5e2a] hover:bg-[#234b21] text-white shadow-lg rounded-2xl"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Form
                </Button>
              </div>
            </div>


            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] ${
                      pathname === item.href
                        ? "bg-[#2c5e2a]/10 text-[#2c5e2a] border border-[#2c5e2a]/20 shadow-sm"
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

                {/* Account Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-4">Account</p>
                  {accountItems.map((item) => (
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
                </div>

                {/* Support Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-4">Support</p>
                  {supportItems.map((item) => (
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
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>

            {/* User Profile Section */}
            <div className="border-t bg-gray-50/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0 flex-1">
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
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              {/* Minimal System Status */}
              <div className="flex items-center justify-between mb-3 px-2 py-1 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  {googleSheetsStatus === 'connected' ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-700">Sheets Connected</span>
                    </>
                  ) : googleSheetsStatus === 'error' ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-700">Connection Error</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-700">Needs Reconnect</span>
                    </>
                  )}
                </div>
                {googleSheetsStatus !== 'connected' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 px-1 text-xs"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <RefreshCw className="w-2 h-2" />
                  </Button>
                )}
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
              <span className="text-sm">ShelfCue</span>
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