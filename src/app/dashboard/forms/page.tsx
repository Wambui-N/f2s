"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  ExternalLink,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  BarChart3,
  CheckCircle,
  ChevronDown,
  X,
  Play,
  Pause,
  Layers,
  Grid3X3,
  List,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  MoreHorizontal,
  Download,
  Activity,
  ChevronUp,
  Moon,
  RefreshCw,
  TrendingUp,
  Trophy,
  Star,
  FileTemplate,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CreateFormModal } from "@/components/builder/CreateFormModal";
import { useAnalytics } from "@/lib/analytics";

interface FormRecord {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  status: "draft" | "published";
  submissions?: number;
  views?: number;
  last_submission_at?: string;
  sheet_connections?: {
    id: string;
    sheet_name: string;
    sheet_url: string;
    is_active: boolean;
  };
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const analytics = useAnalytics();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormRecord | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  
  // Modal states
  const [isDuplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [formToDuplicate, setFormToDuplicate] = useState<FormRecord | null>(null);
  const [duplicateFormName, setDuplicateFormName] = useState("");
  const [duplicateSubmissions, setDuplicateSubmissions] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState("");
  
  // View and filter states
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"created" | "name" | "submissions" | "last_submission">("created");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<"all" | "7days" | "30days" | "custom">("all");
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(false);

  // Network state detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSyncing(true);
      // Retry fetching data when coming back online
      if (user) {
        fetchForms();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const fetchForms = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
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
        setError("Unable to load forms. Please check your connection and try again.");
      } else {
        setForms(data as any);
        setError(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchForms();
    // Track page view
    analytics.trackPageView('forms', {
      forms_count: forms.length,
      user_id: user?.id
    });
  }, [user]);

  // Track view mode changes
  useEffect(() => {
    if (viewMode) {
      analytics.trackViewToggle(viewMode);
    }
  }, [viewMode]);

  // Filter and sort logic (moved up to fix dependency issue)
  const filteredAndSortedForms = React.useMemo(() => {
    let filtered = forms.filter(form => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = form.title.toLowerCase().includes(query);
        const matchesDescription = form.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const now = new Date();
        const formDate = new Date(form.created_at);
        const daysDiff = Math.floor((now.getTime() - formDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateRange === "7days" && daysDiff > 7) return false;
        if (dateRange === "30days" && daysDiff > 30) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "created":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "submissions":
          comparison = (a.submissions || 0) - (b.submissions || 0);
          break;
        case "last_submission":
          // For now, use created_at as proxy for last submission
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [forms, searchQuery, statusFilter, sortBy, sortDirection, dateRange]);

  // Track search queries
  useEffect(() => {
    if (searchQuery) {
      const resultsCount = filteredAndSortedForms.length;
      analytics.trackSearch(searchQuery, resultsCount, {
        status_filter: statusFilter,
        sort_by: sortBy,
        date_range: dateRange
      });
    }
  }, [searchQuery, filteredAndSortedForms.length, statusFilter, sortBy, dateRange]);

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formToDelete.id)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deleting form:", error);
      } else {
        setForms(forms.filter(form => form.id !== formToDelete.id));
        setDeleteDialogOpen(false);
        setFormToDelete(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleCopyFormId = (formId: string) => {
    navigator.clipboard.writeText(formId);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const getFormUrl = (formId: string) => {
    return `${window.location.origin}/form/${formId}`;
  };

  // Selection handlers
  const handleSelectForm = (formId: string) => {
    const newSelected = new Set(selectedForms);
    const form = forms.find(f => f.id === formId);
    
    if (newSelected.has(formId)) {
      newSelected.delete(formId);
      analytics.trackInteraction('form_deselected', 'checkbox', {
        form_id: formId,
        form_title: form?.title,
        selected_count: newSelected.size
      });
    } else {
      newSelected.add(formId);
      analytics.trackInteraction('form_selected', 'checkbox', {
        form_id: formId,
        form_title: form?.title,
        selected_count: newSelected.size
      });
    }
    setSelectedForms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === filteredAndSortedForms.length) {
      setSelectedForms(new Set());
      analytics.trackInteraction('select_all_deselected', 'checkbox', {
        deselected_count: filteredAndSortedForms.length
      });
    } else {
      setSelectedForms(new Set(filteredAndSortedForms.map(form => form.id)));
      analytics.trackInteraction('select_all_selected', 'checkbox', {
        selected_count: filteredAndSortedForms.length
      });
    }
  };

  const handleClearSelection = () => {
    analytics.trackInteraction('clear_selection', 'button', {
      cleared_count: selectedForms.size
    });
    setSelectedForms(new Set());
  };

  // Bulk action handlers
  const handleBulkActivate = async () => {
    const formIds = Array.from(selectedForms);
    analytics.trackBulkAction('activate', formIds.length, formIds);
    
    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: "published" })
        .in("id", formIds)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error activating forms:", error);
        analytics.trackError('bulk_activate_failed', 'supabase', { error: error.message, form_count: formIds.length });
      } else {
        setForms(forms.map(form => 
          selectedForms.has(form.id) ? { ...form, status: "published" as const } : form
        ));
        setSelectedForms(new Set());
        analytics.trackSuccess('bulk_activate', { form_count: formIds.length });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('bulk_activate_unexpected', 'try_catch', { error: String(error), form_count: formIds.length });
    }
  };

  const handleBulkDeactivate = async () => {
    const formIds = Array.from(selectedForms);
    analytics.trackBulkAction('deactivate', formIds.length, formIds);
    
    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: "draft" })
        .in("id", formIds)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deactivating forms:", error);
        analytics.trackError('bulk_deactivate_failed', 'supabase', { error: error.message, form_count: formIds.length });
      } else {
        setForms(forms.map(form => 
          selectedForms.has(form.id) ? { ...form, status: "draft" as const } : form
        ));
        setSelectedForms(new Set());
        analytics.trackSuccess('bulk_deactivate', { form_count: formIds.length });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('bulk_deactivate_unexpected', 'try_catch', { error: String(error), form_count: formIds.length });
    }
  };

  const handleBulkDelete = async () => {
    const formIds = Array.from(selectedForms);
    analytics.trackBulkAction('delete', formIds.length, formIds);
    
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .in("id", formIds)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deleting forms:", error);
        analytics.trackError('bulk_delete_failed', 'supabase', { error: error.message, form_count: formIds.length });
      } else {
        setForms(forms.filter(form => !selectedForms.has(form.id)));
        setSelectedForms(new Set());
        analytics.trackSuccess('bulk_delete', { form_count: formIds.length });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('bulk_delete_unexpected', 'try_catch', { error: String(error), form_count: formIds.length });
    }
  };


  // Get filter counts
  const filterCounts = React.useMemo(() => {
    const counts = {
      all: forms.length,
      published: forms.filter(f => f.status === "published").length,
      draft: forms.filter(f => f.status === "draft").length,
    };
    return counts;
  }, [forms]);

  // Helper functions
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleStatusToggle = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const form = forms.find(f => f.id === formId);
    
    analytics.trackFormAction('status_toggle', formId, form?.title || 'Unknown', {
      from_status: currentStatus,
      to_status: newStatus
    });
    
    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: newStatus })
        .eq("id", formId)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error updating form status:", error);
        analytics.trackError('status_toggle_failed', 'supabase', { 
          error: error.message, 
          form_id: formId, 
          from_status: currentStatus,
          to_status: newStatus
        });
      } else {
        setForms(forms.map(form => 
          form.id === formId ? { ...form, status: newStatus as "draft" | "published" } : form
        ));
        analytics.trackSuccess('status_toggle', { 
          form_id: formId, 
          from_status: currentStatus,
          to_status: newStatus
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('status_toggle_unexpected', 'try_catch', { 
        error: String(error), 
        form_id: formId,
        from_status: currentStatus,
        to_status: newStatus
      });
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleSort = (column: string) => {
    const previousSort = { sortBy, sortDirection };
    
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column as any);
      setSortDirection("asc");
    }
    
    analytics.trackFilter('sort', column, previousSort);
  };

  // Empty state detection
  const getEmptyStateType = () => {
    if (forms.length === 0) return "no-forms";
    if (filteredAndSortedForms.length === 0 && searchQuery) return "no-search-results";
    if (filteredAndSortedForms.length === 0 && statusFilter === "published") return "all-inactive";
    return null;
  };

  const handleClearSearchAndFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange("all");
    setSortBy("created");
    setSortDirection("desc");
  };

  const handleActivateAllForms = async () => {
    const draftForms = forms.filter(form => form.status === "draft");
    if (draftForms.length === 0) return;

    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: "published" })
        .in("id", draftForms.map(f => f.id))
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error activating forms:", error);
      } else {
        setForms(forms.map(form => 
          draftForms.some(f => f.id === form.id) ? { ...form, status: "published" as const } : form
        ));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  // Duplicate form handler
  const handleDuplicateForm = async () => {
    if (!formToDuplicate) return;

    analytics.trackFormAction('duplicate', formToDuplicate.id, formToDuplicate.title, {
      new_name: duplicateFormName,
      duplicate_submissions: duplicateSubmissions
    });

    try {
      const { data: newForm, error } = await supabase
        .from("forms")
        .insert({
          title: duplicateFormName,
          description: formToDuplicate.description,
          status: "draft",
          user_id: user?.id,
          // Add other form fields as needed
        })
        .select()
        .single();

      if (error) {
        console.error("Error duplicating form:", error);
        analytics.trackError('duplicate_form_failed', 'supabase', { 
          error: error.message, 
          form_id: formToDuplicate.id 
        });
      } else {
        setForms([newForm, ...forms]);
        setDuplicateModalOpen(false);
        setFormToDuplicate(null);
        setDuplicateFormName("");
        setDuplicateSubmissions(false);
        analytics.trackSuccess('duplicate_form', { 
          original_form_id: formToDuplicate.id,
          new_form_id: newForm.id,
          duplicate_submissions: duplicateSubmissions
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('duplicate_form_unexpected', 'try_catch', { 
        error: String(error), 
        form_id: formToDuplicate.id 
      });
    }
  };

  // Enhanced delete form handler with confirmation
  const handleDeleteFormWithConfirmation = async () => {
    if (!formToDelete || deleteConfirmation !== "DELETE") return;

    analytics.trackFormAction('delete', formToDelete.id, formToDelete.title, {
      submission_count: formToDelete.submissions || 0,
      confirmation_typed: deleteConfirmation
    });

    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formToDelete.id)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deleting form:", error);
        analytics.trackError('delete_form_failed', 'supabase', { 
          error: error.message, 
          form_id: formToDelete.id 
        });
      } else {
        setForms(forms.filter(form => form.id !== formToDelete.id));
        setDeleteDialogOpen(false);
        setFormToDelete(null);
        setDeleteConfirmation("");
        analytics.trackSuccess('delete_form', { 
          form_id: formToDelete.id,
          submission_count: formToDelete.submissions || 0
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('delete_form_unexpected', 'try_catch', { 
        error: String(error), 
        form_id: formToDelete.id 
      });
    }
  };

  // Bulk delete handler
  const handleBulkDeleteWithConfirmation = async () => {
    if (bulkDeleteConfirmation !== "DELETE") return;

    const formIds = Array.from(selectedForms);
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .in("id", formIds)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deleting forms:", error);
      } else {
        setForms(forms.filter(form => !selectedForms.has(form.id)));
        setSelectedForms(new Set());
        setBulkDeleteModalOpen(false);
        setBulkDeleteConfirmation("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  // Open duplicate modal
  const openDuplicateModal = (form: FormRecord) => {
    analytics.trackFormAction('open_duplicate_modal', form.id, form.title);
    setFormToDuplicate(form);
    setDuplicateFormName(`${form.title} Copy`);
    setDuplicateModalOpen(true);
  };

  // Open bulk delete modal
  const openBulkDeleteModal = () => {
    setBulkDeleteModalOpen(true);
    setBulkDeleteConfirmation("");
  };

  // Performance insights calculations
  const getPerformanceInsights = React.useMemo(() => {
    if (forms.length === 0) return null;

    const mostSubmissions = forms.reduce((max, form) => 
      (form.submissions || 0) > (max.submissions || 0) ? form : max
    );

    const totalSubmissions = forms.reduce((sum, form) => sum + (form.submissions || 0), 0);
    const activeForms = forms.filter(form => form.status === "published").length;
    const averageSubmissions = forms.length > 0 ? Math.round(totalSubmissions / forms.length) : 0;

    return {
      mostSubmissions,
      totalSubmissions,
      activeForms,
      averageSubmissions,
    };
  }, [forms]);

  // Quick actions handlers
  const handleDownloadAllSubmissions = () => {
    analytics.trackInteraction('download_all_submissions', 'button', {
      forms_count: forms.length,
      total_submissions: forms.reduce((sum, form) => sum + (form.submissions || 0), 0)
    });
    // TODO: Implement download all submissions
    console.log("Download all submissions");
  };

  const handleCreateFromTemplate = () => {
    analytics.trackInteraction('create_from_template', 'button');
    // TODO: Implement create from template
    console.log("Create form from template");
  };

  const handleViewAnalytics = () => {
    analytics.trackInteraction('view_analytics', 'button', {
      forms_count: forms.length
    });
    // TODO: Navigate to analytics page
    console.log("View form analytics");
  };

  const handleRetry = () => {
    fetchForms();
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="space-y-6">
        {/* PAGE HEADER SKELETON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* ERROR STATE */}
        <Card className="border-2 border-dashed border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to load forms</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md text-lg">
              There was a problem loading your forms. Please try again.
            </p>
            <Button 
              onClick={handleRetry}
              className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-8 py-4 rounded-xl font-medium text-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state with skeleton screens
  if (loading) {
    return (
      <div className="space-y-6">
        {/* PAGE HEADER SKELETON */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* FILTER BAR SKELETON */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* FORMS GRID SKELETON */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded mt-1"></div>
                  <div className="flex-1 min-w-0">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-1">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NETWORK STATE INDICATORS */}
        {isOffline && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">You're currently offline</p>
                <p className="text-xs text-yellow-700">Forms are read-only. Changes will sync when you're back online.</p>
              </div>
            </div>
          </div>
        )}

        {isSyncing && !isOffline && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                <RefreshCw className="w-3 h-3 text-white animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Syncing...</p>
                <p className="text-xs text-blue-700">Updating your forms and data.</p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
              <p className="text-gray-600 mt-1">Manage all your forms and view performance</p>
            </div>
            <Button 
              onClick={() => setCreateModalOpen(true)} 
              disabled={isOffline}
              className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Form
            </Button>
          </div>
        </div>

        {/* TOOLBAR SECTION */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          {/* VIEW TOGGLE & FILTERS */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* VIEW TOGGLE */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    analytics.trackInteraction('view_toggle', 'button', { view_mode: 'grid' });
                    setViewMode("grid");
                  }}
                  className="h-8 px-3 min-h-[36px] touch-manipulation"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    analytics.trackInteraction('view_toggle', 'button', { view_mode: 'table' });
                    setViewMode("table");
                  }}
                  className="h-8 px-3 min-h-[36px] touch-manipulation"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* SEARCH INPUT */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    analytics.trackInteraction('search_input', 'input', {
                      query_length: e.target.value.length,
                      has_query: e.target.value.length > 0
                    });
                  }}
                  className="pl-10 pr-10 h-10 touch-manipulation"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      analytics.trackInteraction('clear_search', 'button', {
                        query_cleared: searchQuery
                      });
                      setSearchQuery("");
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* STATUS FILTER */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 whitespace-nowrap">
                    <Filter className="w-4 h-4 mr-2" />
                    Status
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => {
                      analytics.trackFilter('status', 'all', statusFilter);
                      setStatusFilter("all");
                    }}
                    className="min-h-[44px] touch-manipulation"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>All</span>
                      <Badge variant="secondary" className="ml-2">
                        {filterCounts.all}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      analytics.trackFilter('status', 'published', statusFilter);
                      setStatusFilter("published");
                    }}
                    className="min-h-[44px] touch-manipulation"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Active</span>
                      <Badge variant="secondary" className="ml-2">
                        {filterCounts.published}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      analytics.trackFilter('status', 'draft', statusFilter);
                      setStatusFilter("draft");
                    }}
                    className="min-h-[44px] touch-manipulation"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Draft</span>
                      <Badge variant="secondary" className="ml-2">
                        {filterCounts.draft}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* SORT DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 whitespace-nowrap">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    if (sortBy === "created") {
                      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                    } else {
                      setSortBy("created");
                      setSortDirection("desc");
                    }
                  }}>
                    <div className="flex items-center justify-between w-full">
                      <span>Last created</span>
                      {sortBy === "created" && (
                        sortDirection === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (sortBy === "name") {
                      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                    } else {
                      setSortBy("name");
                      setSortDirection("asc");
                    }
                  }}>
                    <div className="flex items-center justify-between w-full">
                      <span>Name A-Z</span>
                      {sortBy === "name" && (
                        sortDirection === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (sortBy === "submissions") {
                      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                    } else {
                      setSortBy("submissions");
                      setSortDirection("desc");
                    }
                  }}>
                    <div className="flex items-center justify-between w-full">
                      <span>Most submissions</span>
                      {sortBy === "submissions" && (
                        sortDirection === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (sortBy === "last_submission") {
                      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                    } else {
                      setSortBy("last_submission");
                      setSortDirection("desc");
                    }
                  }}>
                    <div className="flex items-center justify-between w-full">
                      <span>Last submission</span>
                      {sortBy === "last_submission" && (
                        sortDirection === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* DATE RANGE FILTER */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 whitespace-nowrap">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setDateRange("all")}>
                    All time
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("7days")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("30days")}>
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("custom")}>
                    Custom range
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* PERFORMANCE INSIGHTS TOGGLE */}
        {forms.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
                  <Badge variant="secondary" className="text-xs">
                    {getPerformanceInsights?.totalSubmissions || 0} total submissions
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPerformanceInsights(!showPerformanceInsights);
                    analytics.trackInteraction('toggle_performance_insights', 'button', { 
                      show: !showPerformanceInsights 
                    });
                  }}
                  className="h-8 px-3"
                >
                  {showPerformanceInsights ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      View
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* COLLAPSIBLE PERFORMANCE INSIGHTS SECTION */}
        {forms.length > 0 && getPerformanceInsights && showPerformanceInsights && (
          <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TOP PERFORMING FORMS */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Most Submissions Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Most Submissions</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mb-1">
                        {getPerformanceInsights.mostSubmissions.submissions || 0}
                      </div>
                      <div className="text-sm text-green-700 truncate">
                        {getPerformanceInsights.mostSubmissions.title}
                      </div>
                    </div>

                    {/* Total Submissions Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Submissions</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 mb-1">
                        {getPerformanceInsights.totalSubmissions}
                      </div>
                      <div className="text-sm text-blue-700">
                        Across all forms
                      </div>
                    </div>

                    {/* Active Forms Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Active Forms</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mb-1">
                        {getPerformanceInsights.activeForms}
                      </div>
                      <div className="text-sm text-purple-700">
                        Currently published
                      </div>
                    </div>

                    {/* Average Submissions Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Average per Form</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900 mb-1">
                        {getPerformanceInsights.averageSubmissions}
                      </div>
                      <div className="text-sm text-orange-700">
                        Submissions per form
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS PANEL */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownloadAllSubmissions}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                    >
                      <Download className="w-4 h-4 mr-3" />
                      <div>
                        <div className="font-medium">Download All Submissions</div>
                        <div className="text-xs text-gray-500">Export all form data</div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleCreateFromTemplate}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                    >
                      <Layers className="w-4 h-4 mr-3" />
                      <div>
                        <div className="font-medium">Create Form from Template</div>
                        <div className="text-xs text-gray-500">Start with a pre-built form</div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleViewAnalytics}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      <div>
                        <div className="font-medium">View Form Analytics</div>
                        <div className="text-xs text-gray-500">Detailed performance metrics</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BULK ACTIONS TOOLBAR */}
        {selectedForms.size > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedForms.size} form{selectedForms.size !== 1 ? 's' : ''} selected
                </span>
                <DropdownMenu open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      Bulk Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleBulkActivate}>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkDeactivate}>
                      <Pause className="w-4 h-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* TODO: Implement duplicate */}}>
                      <Layers className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={openBulkDeleteModal}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* FORMS CONTENT */}
        {filteredAndSortedForms.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center py-20 px-6">
            {(() => {
              const emptyStateType = getEmptyStateType();
              
              switch (emptyStateType) {
                case "no-forms":
                  return (
                    <>
                      {/* NO FORMS EMPTY STATE */}
                      <div className="w-24 h-24 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-full flex items-center justify-center mb-6">
                        <FileText className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No forms yet</h3>
                      <p className="text-gray-500 text-center mb-8 max-w-md text-lg">
                        Create your first form to start capturing leads and syncing them to Google Sheets automatically.
                      </p>
                      <Button 
                        onClick={() => setCreateModalOpen(true)} 
                        className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-8 py-4 rounded-xl font-medium text-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Form
                      </Button>
                    </>
                  );
                
                case "no-search-results":
                  return (
                    <>
                      {/* NO SEARCH RESULTS EMPTY STATE */}
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No forms match your search</h3>
                      <p className="text-gray-500 text-center mb-8 max-w-md text-lg">
                        Try adjusting your filters or search terms to find what you're looking for.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleClearSearchAndFilters}
                          variant="outline"
                          className="px-6 py-3 rounded-xl font-medium"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear search and filters
                        </Button>
                        <Button 
                          onClick={() => setCreateModalOpen(true)} 
                          className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-6 py-3 rounded-xl font-medium"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Form
                        </Button>
                      </div>
                    </>
                  );
                
                case "all-inactive":
                  return (
                    <>
                      {/* ALL FORMS INACTIVE EMPTY STATE */}
                      <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-6">
                        <Moon className="w-12 h-12 text-yellow-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">All your forms are inactive</h3>
                      <p className="text-gray-500 text-center mb-8 max-w-md text-lg">
                        Activate a form to start receiving submissions and capturing leads.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleActivateAllForms}
                          className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-6 py-3 rounded-xl font-medium"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Activate forms
                        </Button>
                        <Button 
                          onClick={() => setCreateModalOpen(true)} 
                          variant="outline"
                          className="px-6 py-3 rounded-xl font-medium"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Form
                        </Button>
                      </div>
                    </>
                  );
                
                default:
                  return (
                    <>
                      {/* DEFAULT EMPTY STATE */}
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No forms match your filters</h3>
                      <p className="text-gray-500 text-center mb-8 max-w-md text-lg">
                        Try adjusting your search or filter criteria to find what you're looking for.
                      </p>
                      <Button 
                        onClick={handleClearSearchAndFilters}
                        className="bg-[#2c5e2a] hover:bg-[#234b21] text-white px-6 py-3 rounded-xl font-medium"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear filters
                      </Button>
                    </>
                  );
              }
            })()}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SELECT ALL CHECKBOX */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedForms.size === filteredAndSortedForms.length && filteredAndSortedForms.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                  Select all forms ({filteredAndSortedForms.length})
                </label>
              </div>
            </div>

            {/* FORMS DISPLAY - GRID OR TABLE */}
            {viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedForms.map((form) => (
                  <Card 
                    key={form.id} 
                    className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                      selectedForms.has(form.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedForms.has(form.id)}
                        onCheckedChange={() => handleSelectForm(form.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        {/* FORM THUMBNAIL */}
                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        
                        {/* FORM NAME & STATUS */}
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg font-semibold truncate flex-1">
                            <Link 
                              href={`/forms/${form.id}/edit`}
                              className="hover:text-[#2c5e2a] transition-colors"
                            >
                              {form.title}
                            </Link>
                          </CardTitle>
                          <StatusBadge 
                            status={form.status} 
                            text={form.status === "published" ? "Active" : form.status === "draft" ? "Draft" : "Inactive"}
                          />
                        </div>
                        
                        {form.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* QUICK STATS */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {form.submissions || 0} submissions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            Last: {form.last_submission_at ? getTimeAgo(form.last_submission_at) : 'Never'}
                          </span>
                        </div>
                      </div>

                      {/* QUICK ACTIONS BAR */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                            asChild
                            onClick={() => analytics.trackFormAction('edit_click', form.id, form.title)}
                          >
                            <Link href={`/forms/${form.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                            asChild
                            onClick={() => analytics.trackFormAction('share_click', form.id, form.title)}
                          >
                            <Link href={getFormUrl(form.id)} target="_blank">
                              <Share2 className="w-4 h-4" />
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                            asChild
                            onClick={() => analytics.trackFormAction('view_submissions_click', form.id, form.title)}
                          >
                            <Link href={`/dashboard/submissions?form=${form.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                              onClick={() => analytics.trackFormAction('more_menu_open', form.id, form.title)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              asChild
                              onClick={() => analytics.trackFormAction('edit_dropdown_click', form.id, form.title)}
                            >
                              <Link href={`/forms/${form.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              asChild
                              onClick={() => analytics.trackFormAction('share_dropdown_click', form.id, form.title)}
                            >
                              <Link href={getFormUrl(form.id)} target="_blank">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              asChild
                              onClick={() => analytics.trackFormAction('view_submissions_dropdown_click', form.id, form.title)}
                            >
                              <Link href={`/dashboard/submissions?form=${form.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Submissions
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDuplicateModal(form)}
                              className="min-h-[44px] touch-manipulation"
                            >
                              <Layers className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                analytics.trackFormAction('export_click', form.id, form.title);
                                /* TODO: Implement export */
                              }}
                              className="min-h-[44px] touch-manipulation"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Submissions
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusToggle(form.id, form.status)}
                              className="min-h-[44px] touch-manipulation"
                            >
                              {form.status === "published" ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                analytics.trackFormAction('delete_click', form.id, form.title);
                                setFormToDelete(form);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 focus:text-red-600 min-h-[44px] touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              ) : (
              /* TABLE VIEW */
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedForms.size === filteredAndSortedForms.length && filteredAndSortedForms.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Form Name
                          {getSortIcon("name")}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon("status")}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("submissions")}
                      >
                        <div className="flex items-center gap-2">
                          Submissions
                          {getSortIcon("submissions")}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("created")}
                      >
                        <div className="flex items-center gap-2">
                          Created
                          {getSortIcon("created")}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("last_submission")}
                      >
                        <div className="flex items-center gap-2">
                          Last Submission
                          {getSortIcon("last_submission")}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedForms.map((form) => (
                      <tr 
                        key={form.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedForms.has(form.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => window.open(`/forms/${form.id}/edit`, '_blank')}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedForms.has(form.id)}
                            onCheckedChange={() => handleSelectForm(form.id)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {form.title}
                              </div>
                              {form.description && (
                                <div className="text-xs text-gray-500 truncate">
                                  {form.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={form.status === "published"}
                              onCheckedChange={() => handleStatusToggle(form.id, form.status)}
                            />
                            <StatusBadge 
                              status={form.status} 
                              text={form.status === "published" ? "Active" : "Draft"}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {form.submissions || 0}
                            </span>
                            <div className="flex items-center text-green-500">
                              <ArrowUp className="w-3 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(form.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {form.last_submission_at ? getTimeAgo(form.last_submission_at) : 'Never'}
                          </span>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link href={`/forms/${form.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link href={getFormUrl(form.id)} target="_blank">
                                <Share2 className="w-4 h-4" />
                              </Link>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/forms/${form.id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={getFormUrl(form.id)} target="_blank">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/submissions?form=${form.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Submissions
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDuplicateModal(form)}>
                                  <Layers className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {/* TODO: Implement export */}}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Submissions
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusToggle(form.id, form.status)}>
                                  {form.status === "published" ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setFormToDelete(form);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* ENHANCED DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete "{formToDelete?.title}"?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this form? This will also delete all {formToDelete?.submissions || 0} submissions associated with it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Type "DELETE" to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFormWithConfirmation}
              disabled={deleteConfirmation !== "DELETE"}
            >
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DUPLICATE FORM MODAL */}
      <Dialog open={isDuplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2c5e2a]">
              Duplicate Form
            </DialogTitle>
            <DialogDescription>
              Create a copy of "{formToDuplicate?.title}" with the options below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New form name:
              </label>
              <Input
                value={duplicateFormName}
                onChange={(e) => setDuplicateFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="duplicate-submissions"
                checked={duplicateSubmissions}
                onCheckedChange={(checked) => setDuplicateSubmissions(checked as boolean)}
              />
              <label htmlFor="duplicate-submissions" className="text-sm text-gray-700">
                Also duplicate submissions
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDuplicateModalOpen(false);
                setFormToDuplicate(null);
                setDuplicateFormName("");
                setDuplicateSubmissions(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateForm}
              disabled={!duplicateFormName.trim()}
              className="bg-[#2c5e2a] hover:bg-[#234b21] text-white"
            >
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK DELETE MODAL */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete {selectedForms.size} Forms?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This will permanently delete {selectedForms.size} forms and all their submissions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Forms to be deleted:
                </label>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {Array.from(selectedForms).map(formId => {
                    const form = forms.find(f => f.id === formId);
                    return form ? (
                      <div key={formId} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">{form.title}</span>
                        <span className="text-xs text-gray-500">{form.submissions || 0} submissions</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type "DELETE" to confirm:
                </label>
                <Input
                  value={bulkDeleteConfirmation}
                  onChange={(e) => setBulkDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkDeleteModalOpen(false);
                setBulkDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteWithConfirmation}
              disabled={bulkDeleteConfirmation !== "DELETE"}
            >
              Delete {selectedForms.size} Forms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
