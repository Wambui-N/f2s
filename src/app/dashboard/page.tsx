"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFormModal } from "@/components/builder/CreateFormModal";
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

function DashboardContent() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormRecord | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    totalViews: 0,
    totalSubmissions: 0,
    publishedForms: 0,
    formsThisMonth: 0,
    viewsThisMonth: 0,
    submissionsThisMonth: 0,
    submissionsThisWeek: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
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
            submissionsThisWeek: parseInt(analyticsData.submissions_this_week) || 0
          });

          setHistoricalStats({
            formsLastMonth: parseInt(analyticsData.forms_last_month) || 0,
            submissionsLastMonth: parseInt(analyticsData.submissions_last_month) || 0,
            submissionsLastWeek: parseInt(analyticsData.submissions_last_week) || 0
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const handleOpenCreateFormModal = () => {
      setCreateModalOpen(true);
    };

    window.addEventListener('openCreateFormModal', handleOpenCreateFormModal);
    
    return () => {
      window.removeEventListener('openCreateFormModal', handleOpenCreateFormModal);
    };
  }, []);

  const openDeleteDialog = (form: FormRecord) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    setForms(forms.filter((form) => form.id !== formToDelete.id));

    const { error } = await supabase
      .from("forms")
      .delete()
      .match({ id: formToDelete.id });

    if (error) {
      console.error("Error deleting form:", error);
      // Revert optimistic update on error
      setForms(prev => [...prev, formToDelete]);
    }
    
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const exportToCSV = async (formId: string) => {
    try {
      const response = await fetch("/api/export-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });

      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      // Create a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}-submissions.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const copyFormUrl = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  // Helper function to calculate percentage change
  const calculatePercentageChange = (current: number, previous: number): { value: number, type: "increase" | "decrease" } => {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, type: current > 0 ? "increase" : "increase" };
    }
    
    const change = ((current - previous) / previous) * 100;
    const roundedChange = Math.round(change);
    
    if (roundedChange > 0) {
      return { value: roundedChange, type: "increase" };
    } else if (roundedChange < 0) {
      return { value: Math.abs(roundedChange), type: "decrease" };
    } else {
      return { value: 0, type: "increase" };
    }
  };

  // We'll need historical data to calculate changes, let's add it to the state
  const [historicalStats, setHistoricalStats] = useState({
    formsLastMonth: 0,
    submissionsLastMonth: 0,
    submissionsLastWeek: 0
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#fff8e8] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2c5e2a]">
            Your Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 mx-auto">
            Manage your forms and track submissions in real-time
          </p>
          <Button 
            size="lg" 
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-8 py-3 text-lg font-semibold rounded-2xl group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Create New Form
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Forms"
            value={dashboardStats.totalForms}
            change={{
              ...calculatePercentageChange(dashboardStats.formsThisMonth, historicalStats.formsLastMonth),
              period: "vs last month"
            }}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatsCard
            title="Published Forms"
            value={dashboardStats.publishedForms}
            change={{
              value: dashboardStats.publishedForms > 0 ? Math.round((dashboardStats.publishedForms / dashboardStats.totalForms) * 100) : 0,
              type: "increase",
              period: "of total forms"
            }}
            icon={<ExternalLink className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Submissions"
            value={dashboardStats.totalSubmissions}
            change={{
              ...calculatePercentageChange(dashboardStats.submissionsThisMonth, historicalStats.submissionsLastMonth),
              period: "vs last month"
            }}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="This Week"
            value={dashboardStats.submissionsThisWeek}
            change={{
              ...calculatePercentageChange(dashboardStats.submissionsThisWeek, historicalStats.submissionsLastWeek),
              period: "vs last week"
            }}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Enhanced Forms List */}
        <Card className="shadow-xl rounded-3xl mt-6 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-2xl font-bold text-[#2c5e2a]">
                <Activity className="mr-3 h-6 w-6" />
                Your Forms
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="px-4 py-2 rounded-full bg-[#2c5e2a]/10 text-[#2c5e2a] border-0">
                  {forms.length} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12 text-muted-foreground" />}
                title="No forms yet"
                description="Create your first form to start collecting client information and automatically sync it to Google Sheets"
                action={{
                  label: "Create Your First Form",
                  onClick: () => setCreateModalOpen(true)
                }}
              />
            ) : (
              <div className="space-y-4">
                {forms.map((form: any) => (
                  <Card 
                    key={form.id}
                    className="transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-bold text-xl text-[#2c5e2a]">{form.title}</h3>
                            <StatusBadge
                              status={form.status === "published" ? "success" : "pending"}
                              text={form.status === "published" ? "Published" : "Draft"}
                            />
                            {form.sheet_connections && (
                              <StatusBadge
                                status="success"
                                text="Google Sheets"
                                className="bg-green-50 text-green-700 border-green-200"
                              />
                            )}
                          </div>
                          
                          {form.description && (
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {form.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Created {new Date(form.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              {form.submissions} submissions
                            </div>
                            {form.sheet_connections && (
                              <div className="flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-green-500" />
                                <span className="text-green-600">Auto-sync active</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {form.sheet_connections && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(form.sheet_connections.sheet_url, "_blank")}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Sheet
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyFormUrl(form.id)}
                            className="hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] rounded-xl border-[#2c5e2a]/20"
                          >
                            {copiedFormId === form.id ? (
                              <>
                                <Sparkles className="w-4 h-4 mr-1 text-green-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Link
                              </>
                            )}
                          </Button>
                          
                          <Link href={`/editor/${form.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-[#f95716]/10 hover:text-[#f95716] rounded-xl border-[#f95716]/20">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          <Link href={`/form/${form.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-[#2c5e2a]/10 hover:text-[#2c5e2a] rounded-xl border-[#2c5e2a]/20">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToCSV(form.id)}
                            className="hover:bg-blue-50 hover:text-blue-600 rounded-xl border-blue-200"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export CSV
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(form)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-interactive shadow-lg hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Get detailed insights into form performance, submission trends, and conversion rates
              </p>
              <Badge variant="secondary" className="mb-4">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>

          <Link href="/dashboard/settings">
            <Card className="card-interactive shadow-lg hover:shadow-xl h-full">
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
                  <Settings className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-3 text-lg">Google Sheets Setup</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Connect and manage your Google Sheets integrations for seamless data flow
                </p>
                <Button variant="outline" className="mt-auto">
                  Configure Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="card-interactive shadow-lg hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Form Templates</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Browse our library of professional form templates for every industry
              </p>
              <Badge variant="secondary" className="mb-4">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div> */}
        </div>
      </main>

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
              All form submissions and Google Sheets connections will be permanently removed.
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
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}