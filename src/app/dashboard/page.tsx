"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  BarChart3,
  Settings,
  ExternalLink,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  Download,
  MoreVertical,
  Clock,
  Mail,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFormModal } from "@/components/builder/CreateFormModal";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Skeleton, StatsCardSkeleton, ActivityItemSkeleton, FormCardSkeleton } from "@/components/ui/skeleton";
import { ErrorState, OfflineIndicator, QueuedActionsNotification } from "@/components/ui/error-state";
import { useToast, useToastHelpers, ToastProvider } from "@/components/ui/toast";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { SwipeActions } from "@/components/ui/swipe-actions";
import { getUserAnalytics } from "@/lib/analytics";

interface FormRecord {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  status: "draft" | "published";
  submissions?: number;
  sheet_connections?: {
    id: string;
    sheet_name: string;
    sheet_url: string;
    is_active: boolean;
  };
}

interface SubmissionRecord {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
  forms?: {
    title: string;
  } | {
    title: string;
  }[];
}

function DashboardContent() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [queuedActions, setQueuedActions] = useState(0);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormRecord | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const { showSuccess, showError, showInfo } = useToastHelpers();
  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    totalViews: 0,
    totalSubmissions: 0,
    publishedForms: 0,
    formsThisMonth: 0,
    viewsThisMonth: 0,
    submissionsThisMonth: 0,
    submissionsThisWeek: 0,
    leadsThisWeek: 0,
    lastLeadTime: null as string | null,
  });

  const [historicalStats, setHistoricalStats] = useState({
    formsLastMonth: 0,
    submissionsLastMonth: 0,
    submissionsLastWeek: 0
  });

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch forms data
        const { data, error } = await supabase
          .from("forms")
          .select(`
            id, title, description, created_at, status,
            sheet_connections!forms_default_sheet_connection_id_fkey (
              id, sheet_name, sheet_url, is_active
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching forms:", error);
        } else {
          setForms(data as any);
        }

        // Fetch recent submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("submissions")
          .select(`
            id, form_id, data, created_at,
            forms!inner (
              title
            )
          `)
          .eq("forms.user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7);

        if (!submissionsError) {
          setRecentSubmissions(submissionsData || []);
        }

        // Calculate leads this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const leadsThisWeek = submissionsData?.filter(sub => 
          new Date(sub.created_at) >= oneWeekAgo
        ).length || 0;

        // Get last lead time
        const lastLeadTime = submissionsData?.[0]?.created_at || null;

        // Fetch analytics data
        const analyticsData = await getUserAnalytics(user.id);
        if (analyticsData) {
          const publishedFormsCount = data?.filter(form => form.status === 'published').length || 0;
          
          setDashboardStats({
            totalForms: parseInt(analyticsData.total_forms) || 0,
            totalViews: parseInt(analyticsData.total_views) || 0,
            totalSubmissions: parseInt(analyticsData.total_submissions) || 0,
            publishedForms: publishedFormsCount,
            formsThisMonth: parseInt(analyticsData.forms_this_month) || 0,
            viewsThisMonth: parseInt(analyticsData.views_this_month) || 0,
            submissionsThisMonth: parseInt(analyticsData.submissions_this_month) || 0,
            submissionsThisWeek: parseInt(analyticsData.submissions_this_week) || 0,
            leadsThisWeek: leadsThisWeek,
            lastLeadTime: lastLeadTime,
          });

          setHistoricalStats({
            formsLastMonth: parseInt(analyticsData.forms_last_month) || 0,
            submissionsLastMonth: parseInt(analyticsData.submissions_last_month) || 0,
            submissionsLastWeek: parseInt(analyticsData.submissions_last_week) || 0
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    try {
    const { error } = await supabase
      .from("forms")
      .delete()
        .eq("id", formToDelete.id);

    if (error) {
      console.error("Error deleting form:", error);
        alert("Failed to delete form. Please try again.");
        return;
    }
    
      // Remove form from local state
      setForms(forms.filter(form => form.id !== formToDelete.id));
    setDeleteDialogOpen(false);
    setFormToDelete(null);

      // Dispatch event to refresh sidebar counts
      window.dispatchEvent(new CustomEvent('formCreated'));
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form. Please try again.");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSubmitterName = (submission: SubmissionRecord) => {
    const data = submission.data;
    return data.name || data.full_name || data.email || 'Anonymous';
  };

  const getTrendPercentage = () => {
    const currentWeek = dashboardStats.leadsThisWeek;
    const lastWeek = historicalStats.submissionsLastWeek;
    if (lastWeek === 0) return currentWeek > 0 ? 100 : 0;
    return Math.round(((currentWeek - lastWeek) / lastWeek) * 100);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* WELCOME & QUICK STATS BANNER SKELETON */}
          <div className="bg-gradient-to-r from-[#2c5e2a] to-[#234b21] rounded-3xl p-8 text-white shadow-2xl">
            <div className="mb-8">
              <Skeleton className="h-10 w-80 mb-3 bg-white/20" />
              <Skeleton className="h-6 w-96 bg-white/20" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>

          {/* MAIN CONTENT GRID SKELETON */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* RECENT ACTIVITY SECTION SKELETON */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-3">
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                  <ActivityItemSkeleton />
                </div>
              </div>
            </div>

            {/* YOUR FORMS SECTION SKELETON */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
                <div className="space-y-4">
                  <FormCardSkeleton />
                  <FormCardSkeleton />
                  <FormCardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 sm:hidden">
        <MobileMenu
          activeFormsCount={dashboardStats.publishedForms}
          newSubmissionsCount={dashboardStats.leadsThisWeek}
          loading={loading}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-lg font-bold text-[#2c5e2a]">ShelfCue</span>
        </div>
          <Button 
          variant="ghost"
          size="sm"
            onClick={() => setCreateModalOpen(true)}
          className="h-10 w-10 p-0"
          >
          <Plus className="h-5 w-5" />
          </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8 space-y-6 sm:space-y-8">
        {/* WELCOME & QUICK STATS BANNER */}
        <div className="bg-gradient-to-r from-[#2c5e2a] to-[#234b21] rounded-3xl p-8 text-white shadow-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
            <p className="text-green-100 text-lg">Here's what's happening with your forms today</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Forms */}
            <Link href="/dashboard/forms" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group-hover:scale-[1.02] border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-4xl font-bold mb-2">{dashboardStats.publishedForms}</div>
                <div className="text-green-100 text-sm font-medium">Active Forms</div>
              </div>
            </Link>

            {/* Leads This Week */}
            <Link href="/dashboard/submissions" className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group-hover:scale-[1.02] border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendPercentage() > 0 ? (
                      <ChevronUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className="text-sm text-white/80 font-medium">
                      {getTrendPercentage()}%
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">{dashboardStats.leadsThisWeek}</div>
                <div className="text-green-100 text-sm font-medium">Leads This Week</div>
              </div>
            </Link>

            {/* Last Lead */}
            <Link href={recentSubmissions[0] ? `/dashboard/submissions` : '#'} className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group-hover:scale-[1.02] border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-2xl font-bold mb-2">
                  {dashboardStats.lastLeadTime ? formatTimeAgo(dashboardStats.lastLeadTime) : 'No leads yet'}
                </div>
                <div className="text-green-100 text-sm font-medium">Last Lead</div>
              </div>
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* RECENT ACTIVITY SECTION */}
          <div className="xl:col-span-1">
            <Card className="h-fit shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
                  <Link href="/dashboard/submissions" className="text-sm text-[#2c5e2a] hover:text-[#234b21] font-medium transition-colors">
                    View All →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Share your forms to start capturing leads!</p>
                  </div>
                ) : (
                <div className="space-y-2">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <SwipeActions
                      key={submission.id}
                      onMarkContacted={() => {
                        // TODO: Implement mark as contacted
                        showSuccess("Marked as contacted", "This submission has been marked as contacted");
                      }}
                      onReply={() => {
                        // TODO: Implement reply functionality
                        showInfo("Reply feature", "Reply functionality coming soon");
                      }}
                      onMore={() => {
                        // TODO: Implement more actions
                        showInfo("More actions", "Additional actions coming soon");
                      }}
                    >
                      <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200 min-h-[60px]">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {getInitials(getSubmitterName(submission))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {getSubmitterName(submission)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            via {Array.isArray(submission.forms) ? submission.forms[0]?.title : submission.forms?.title || 'Unknown Form'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(submission.created_at)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity sm:block hidden"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </SwipeActions>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
        </div>

          {/* YOUR FORMS SECTION */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Your Forms</CardTitle>
                    <p className="text-gray-600 mt-1">Manage and track your form performance</p>
              </div>
                  <Button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Form
                  </Button>
            </div>
          </CardHeader>
              <CardContent className="pt-0">
            {forms.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No forms yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first form to start collecting data and building your lead generation system.</p>
                    <Button 
                      onClick={() => setCreateModalOpen(true)}
                      className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Form
                    </Button>
                  </div>
            ) : (
              <div className="space-y-4">
                  {forms.slice(0, 6).map((form) => (
                    <div key={form.id} className="flex items-center gap-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-[#2c5e2a]/20 transition-all duration-300 group min-h-[80px]">
                      {/* Form Thumbnail */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[#2c5e2a]/10 to-[#234b21]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-[#2c5e2a]" />
                          </div>
                          
                      {/* Form Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate text-lg">{form.title}</h3>
                          <StatusBadge status={form.status} />
                            </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {form.submissions || 0} submissions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last: {form.submissions ? formatTimeAgo(form.created_at) : 'Never'}
                          </span>
                        </div>
                        </div>

                      {/* Quick Actions - Hidden on mobile, shown on desktop */}
                      <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 hover:bg-[#2c5e2a]/10">
                          <Link href={`/editor/${form.id}`} title="Edit Form">
                            <Edit className="w-4 h-4" />
                          </Link>
                            </Button>
                        <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 hover:bg-[#2c5e2a]/10">
                          <Link href={`/dashboard/form/${form.id}`} title="Preview Form">
                            <Eye className="w-4 h-4" />
                          </Link>
                            </Button>
                        <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 hover:bg-[#2c5e2a]/10">
                          <Link href={`/dashboard/submissions?form=${form.id}`} title="View Submissions">
                            <Users className="w-4 h-4" />
                          </Link>
                          </Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                      {/* Mobile Actions - Always visible on mobile */}
                      <div className="flex sm:hidden items-center gap-2">
                        <Button variant="ghost" size="sm" asChild className="h-12 w-12 p-0 hover:bg-[#2c5e2a]/10">
                          <Link href={`/editor/${form.id}`} title="Edit Form">
                            <Edit className="w-5 h-5" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-12 w-12 p-0 hover:bg-[#2c5e2a]/10">
                          <Link href={`/dashboard/form/${form.id}`} title="Preview Form">
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                    
                    {forms.length > 6 && (
                      <div className="text-center pt-6">
                        <Link 
                          href="/dashboard/forms" 
                          className="inline-flex items-center gap-2 text-[#2c5e2a] hover:text-[#234b21] font-medium transition-colors"
                        >
                          View all {forms.length} forms
                          <ArrowRight className="w-4 h-4" />
                        </Link>
              </div>
            )}
              </div>
                )}
              </CardContent>
            </Card>
              </div>
        </div>
      </div>

      {/* Floating Action Button - Hidden on mobile */}
      <div className="hidden sm:block">
        <FloatingActionButton
          onClick={() => setCreateModalOpen(true)}
          label="Create New Form"
        />
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation
        activeFormsCount={dashboardStats.publishedForms}
        newSubmissionsCount={dashboardStats.leadsThisWeek}
        loading={loading}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formToDelete?.title}"? This action cannot be undone. 
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteForm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}