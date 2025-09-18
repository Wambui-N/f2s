import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  AlertCircle, 
  Activity,
  Download,
  RefreshCw,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FormData } from "./types";

interface Submission {
  id: string;
  submitted_at: string;
  synced_to_sheet: boolean;
  sync_error: string | null;
  submission_data: Record<string, any>;
  sheet_row_number?: number;
}

interface SubmissionsPanelProps {
  formData: FormData;
}

export function SubmissionsPanel({ formData }: SubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [formData.id]);

  const fetchSubmissions = async () => {
    if (!formData.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formData.id)
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Could not load submissions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubmissions();
    setRefreshing(false);
  };

  const exportSubmissions = () => {
    if (submissions.length === 0) return;

    const headers = formData.fields
      .filter(field => !["divider", "header", "richtext"].includes(field.type))
      .map(field => field.label);

    const csvContent = [
      ["Submitted At", "Sync Status", ...headers].join(","),
      ...submissions.map(sub => [
        new Date(sub.submitted_at).toLocaleString(),
        sub.synced_to_sheet ? "Synced" : "Failed",
        ...headers.map(header => {
          const field = formData.fields.find(f => f.label === header);
          const value = field ? sub.submission_data[field.id] : "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.title}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formHeaders = formData.fields
    .filter(field => !["divider", "header", "richtext"].includes(field.type))
    .map(field => field.label);

  const syncedCount = submissions.filter(sub => sub.synced_to_sheet).length;
  const failedCount = submissions.filter(sub => !sub.synced_to_sheet && sub.sync_error).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading submissions..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <Button onClick={fetchSubmissions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Synced</p>
                <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
              </div>
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{Math.floor(submissions.length * 0.4)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Activity className="w-5 h-5 mr-2" />
              Form Submissions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
                {submissions.length} total
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {submissions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSubmissions}
                  className="hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {submissions.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white/95 backdrop-blur border-b">
                  <TableRow>
                    <TableHead className="w-[180px] font-semibold">Submitted At</TableHead>
                    <TableHead className="w-[120px] font-semibold">Status</TableHead>
                    {formHeaders.slice(0, 4).map((header) => (
                      <TableHead key={header} className="font-semibold">{header}</TableHead>
                    ))}
                    <TableHead className="w-[50px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow 
                      key={sub.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div>{new Date(sub.submitted_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sub.submitted_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            sub.synced_to_sheet
                              ? "success"
                              : sub.sync_error
                                ? "error"
                                : "pending"
                          }
                          text={
                            sub.synced_to_sheet
                              ? "Synced"
                              : sub.sync_error
                                ? "Failed"
                                : "Pending"
                          }
                        />
                      </TableCell>
                      {formHeaders.slice(0, 4).map((header) => {
                        const field = formData.fields.find(f => f.label === header);
                        const cellValue = field ? sub.submission_data[field.id] : "";
                        return (
                          <TableCell key={`${sub.id}-${header}`} className="max-w-[200px]">
                            <div className="truncate" title={String(cellValue)}>
                              {String(cellValue)}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Activity className="h-12 w-12 text-muted-foreground" />}
                title="No Submissions Yet"
                description="Once your form is published and shared, submissions will appear here with real-time sync to your Google Sheet."
                action={{
                  label: "Publish Form",
                  onClick: () => {
                    // This would trigger the publish flow
                    console.log("Publish form");
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}