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
  Megaphone,
  Home,
  Mail,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  
  // Real data from database
  const [activeFormsCount, setActiveFormsCount] = React.useState(0);
  const [newSubmissionsCount, setNewSubmissionsCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Fetch real data from database
  React.useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch active forms count (published forms)
        const { data: forms, error: formsError } = await supabase
          .from("forms")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("status", "published");

        if (!formsError) {
          setActiveFormsCount(forms?.length || 0);
        }

        // Fetch new submissions count (submissions from last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("id")
          .gte("created_at", sevenDaysAgo.toISOString())
          .in("form_id", 
            forms?.map(form => form.id) || []
          );

        if (!submissionsError) {
          setNewSubmissionsCount(submissions?.length || 0);
        }

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  // Listen for form creation and submission events to refresh counts
  React.useEffect(() => {
    const handleRefreshCounts = async () => {
      if (!user) return;

      try {
        // Fetch active forms count (published forms)
        const { data: forms, error: formsError } = await supabase
          .from("forms")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("status", "published");

        if (!formsError) {
          setActiveFormsCount(forms?.length || 0);
        }

        // Fetch new submissions count (submissions from last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("id")
          .gte("created_at", sevenDaysAgo.toISOString())
          .in("form_id", 
            forms?.map(form => form.id) || []
          );

        if (!submissionsError) {
          setNewSubmissionsCount(submissions?.length || 0);
        }

      } catch (error) {
        console.error("Error refreshing counts:", error);
      }
    };

    // Listen for custom events
    window.addEventListener('formCreated', handleRefreshCounts);
    window.addEventListener('submissionReceived', handleRefreshCounts);

    return () => {
      window.removeEventListener('formCreated', handleRefreshCounts);
      window.removeEventListener('submissionReceived', handleRefreshCounts);
    };
  }, [user]);

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
  ] as Array<{
    href: string;
    label: string;
    icon: any;
    badge: string | null;
  }>;

  const resourcesItems = [
    { href: "/dashboard/resources", label: "All Resources" },
    { href: "/dashboard/resources/traffic-starter", label: "Traffic Starter Kit" },
    { href: "/dashboard/resources/tutorials", label: "Video Tutorials" },
    { href: "/dashboard/resources/best-practices", label: "Best Practices" },
  ];

  const userMenuItems = [
    { href: "/dashboard/account", label: "Account Settings", icon: User },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "#", label: "Logout", icon: LogOut, action: handleSignOut },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-[#442c02]/10">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-10 hidden sm:flex flex-col border-r bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}>
          <div className="flex h-full max-h-screen flex-col">
            {/* BRANDING SECTION */}
            <div className="flex h-16 items-center justify-between border-b px-4 bg-gradient-to-r from-[#2c5e2a]/5 to-[#f95716]/5">
              <Link href="/dashboard" className="flex items-center gap-3 font-semibold group">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                {!sidebarCollapsed && (
                <span className="text-lg font-bold text-[#2c5e2a]">
                  ShelfCue
                </span>
                )}
              </Link>
              
              {/* Collapse/Expand Toggle (desktop only) */}
                <Button 
                variant="ghost"
                  size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0 hover:bg-[#2c5e2a]/10"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                </Button>
            </div>

            {/* PRIMARY NAVIGATION */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-3 space-y-1">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] ${
                      pathname === item.href
                        ? "bg-[#2c5e2a]/10 text-[#2c5e2a] font-semibold"
                        : "text-gray-700 hover:text-foreground"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                    {item.badge && (
                          <Badge variant="secondary" className="text-xs bg-[#2c5e2a]/10 text-[#2c5e2a]">
                        {item.badge}
                      </Badge>
                        )}
                      </>
                    )}
                  </Link>
                ))}

                {/* Resources Section */}
                <div className="pt-4">
                  <button
                    onClick={() => setResourcesOpen(!resourcesOpen)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] w-full ${
                      resourcesOpen ? "bg-[#2c5e2a]/10 text-[#2c5e2a]" : "text-gray-700"
                    }`}
                    title={sidebarCollapsed ? "Resources" : undefined}
                  >
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">Resources</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  
                  {!sidebarCollapsed && resourcesOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {resourcesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-[#2c5e2a] hover:bg-[#2c5e2a]/5 rounded-md transition-colors"
                        >
                          {item.label}
                    </Link>
                  ))}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* LOWER SECTION */}
            <div className="border-t bg-gray-50/50 p-3 space-y-2">
              {/* Settings */}
              <Link
                href="/dashboard/settings"
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] ${
                  pathname === "/dashboard/settings"
                    ? "bg-[#2c5e2a]/10 text-[#2c5e2a] font-semibold"
                    : "text-gray-700 hover:text-foreground"
                }`}
                title={sidebarCollapsed ? "Settings" : undefined}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] w-full"
                  title={sidebarCollapsed ? "User Menu" : undefined}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2c5e2a] to-[#234b21] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">
                    {user?.user_metadata?.full_name || "User"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                    {user?.email}
                </div>
              </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                
                {!sidebarCollapsed && userMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else {
                            router.push(item.href);
                          }
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2c5e2a] transition-colors"
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
        </aside>

        {/* Main Content */}
        <div className={`flex flex-col sm:gap-4 sm:py-4 flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'sm:pl-16' : 'sm:pl-72'
        }`}>
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