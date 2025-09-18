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
  Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFormModal } from "@/components/builder/CreateFormModal";

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

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;

      setLoading(true);
      try {
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
          // Add mock submission counts for now
          const formsWithSubmissions = data.map((form) => ({
            ...form,
            submissions: Math.floor(Math.random() * 50), // Mock data
          }));
          setForms(formsWithSubmissions as any);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [user]);

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

  const copyFormUrl = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const totalSubmissions = forms.reduce(
    (sum, form: any) => sum + (form.submissions || 0),
    0,
  );
  const publishedForms = forms.filter(
    (form) => form.status === "published",
  ).length;
  const recentSubmissions = Math.floor(totalSubmissions * 0.3); // Mock recent data

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <>
      <main className="grid flex-1 items-start gap-8 p-6 sm:px-8 sm:py-6 md:gap-12">
        {/* Enhanced Header */}
        <PageHeader
          title="Dashboard"
          description="Manage your forms and track submissions in real-time"
          actions={
            <Button 
              size="lg" 
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Create New Form
            </Button>
          }
        />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Forms"
            value={forms.length}
            change={{
              value: 12,
              type: "increase",
              period: "last month"
            }}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatsCard
            title="Published Forms"
            value={publishedForms}
            change={{
              value: 8,
              type: "increase", 
              period: "last month"
            }}
            icon={<ExternalLink className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Submissions"
            value={totalSubmissions}
            change={{
              value: 23,
              type: "increase",
              period: "last month"
            }}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="This Week"
            value={recentSubmissions}
            change={{
              value: 15,
              type: "increase",
              period: "last week"
            }}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Enhanced Forms List */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <Activity className="mr-3 h-5 w-5" />
                Your Forms
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="px-3 py-1">
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
                    className="transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-l-4 border-l-transparent hover:border-l-blue-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg">{form.title}</h3>
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
                            className="hover:bg-blue-50"
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
                            <Button variant="outline" size="sm" className="hover:bg-blue-50">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          <Link href={`/form/${form.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-purple-50">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(form)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <Link href="/settings">
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