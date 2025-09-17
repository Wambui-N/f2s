"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFormModal } from "@/components/builder/CreateFormModal";

// The FormData type from the database will be slightly different
// from the one in the form builder's store.
interface FormRecord {
  id: string;
  title: string;
  description?: string;
  created_at: string; // Supabase sends timestamps as strings
  status: "draft" | "published";
  // We'll add submission counts later
}

function DashboardContent() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormRecord | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;

      setLoading(true);
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
        // Here we're assuming submissions count is 0 for now.
        const formsWithSubmissions = data.map((form) => ({
          ...form,
          submissions: 0,
        }));
        setForms(formsWithSubmissions as any); // Cast because submissions is added
      }
      setLoading(false);
    };

    fetchForms();
  }, [user]);

  const openDeleteDialog = (form: FormRecord) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    // Optimistic deletion
    setForms(forms.filter((form) => form.id !== formToDelete.id));

    const { error } = await supabase
      .from("forms")
      .delete()
      .match({ id: formToDelete.id });

    if (error) {
      console.error("Error deleting form:", error);
      // Here you might want to add logic to revert the optimistic deletion
      // and show an error message to the user.
    }
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const totalSubmissions = forms.reduce(
    (sum, form: any) => sum + (form.submissions || 0),
    0,
  );
  const publishedForms = forms.filter(
    (form) => form.status === "published",
  ).length;
  // This will require a more complex query later on
  const recentSubmissions = 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p>Loading your forms...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground mt-2">
              Manage your forms and track submissions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button size="lg" onClick={() => setCreateModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Create New Form
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Forms
                  </p>
                  <p className="text-2xl font-bold">{forms.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Published
                  </p>
                  <p className="text-2xl font-bold">{publishedForms}</p>
                </div>
                <ExternalLink className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This Week
                  </p>
                  <p className="text-2xl font-bold">{recentSubmissions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2" />
              Your Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first form to start collecting client information
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form: any) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{form.title}</h3>
                        <Badge
                          variant={
                            form.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {form.status}
                        </Badge>
                        {form.sheet_connections && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Google Sheets
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {form.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Created{" "}
                          {new Date(form.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {form.submissions} submissions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {form.sheet_connections && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              form.sheet_connections.sheet_url,
                              "_blank",
                            )
                          }
                          className="text-green-600 hover:text-green-700"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Sheet
                        </Button>
                      )}
                      <Link href={`/editor/${form.id}`} passHref>
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/form/${form.id}`} passHref>
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(form)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/analytics" aria-disabled="true">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        View detailed submission analytics and insights
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not available in beta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Link href="/settings">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your Google Sheets integration
                </p>
              </CardContent>
            </Card>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/support" aria-disabled="true">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                    <CardContent className="p-6 text-center">
                      <ExternalLink className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Help & Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Get help with forms and Google Sheets setup
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not available in beta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </main>
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              form "{formToDelete?.title}" and all of its submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteForm}>
              Delete
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
