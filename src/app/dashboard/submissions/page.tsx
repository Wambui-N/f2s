"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Filter,
  Search,
  MoreVertical,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
  metadata?: {
    user_agent?: string;
    ip_address?: string;
    timestamp?: string;
  };
  forms?: {
    title: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterForm, setFilterForm] = useState<string>("all");
  const [forms, setForms] = useState<Array<{ id: string; title: string }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch forms for filter dropdown
        const { data: formsData, error: formsError } = await supabase
          .from("forms")
          .select("id, title")
          .eq("user_id", user.id)
          .order("title");

        if (!formsError) {
          setForms(formsData || []);
        }

        // Fetch submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("submissions")
          .select(`
            id, form_id, data, created_at, metadata,
            forms!inner (
              title
            )
          `)
          .eq("forms.user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (!submissionsError) {
          setSubmissions(submissionsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === "" || 
      submission.forms?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(submission.data).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesForm = filterForm === "all" || submission.form_id === filterForm;
    
    return matchesSearch && matchesForm;
  });

  const getFieldValue = (data: Record<string, any>, fieldName: string) => {
    return data[fieldName] || "-";
  };

  const getFieldNames = (submissions: Submission[]) => {
    if (submissions.length === 0) return [];
    
    const allFields = new Set<string>();
    submissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => allFields.add(key));
    });
    
    return Array.from(allFields).slice(0, 5); // Show first 5 fields
  };

  const fieldNames = getFieldNames(submissions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submissions"
        description="View and manage form submissions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c5e2a] focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterForm}
                onChange={(e) => setFilterForm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c5e2a] focus:border-transparent"
              >
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Once you publish a form and start receiving submissions, they'll appear here.
            </p>
            <Button asChild>
              <a href="/dashboard/forms">
                <FileText className="w-4 h-4 mr-2" />
                Go to Forms
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredSubmissions.length} of {submissions.length} submissions
                </p>
              </div>
              <Badge variant="secondary">
                {submissions.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Submitted</TableHead>
                    {fieldNames.map(fieldName => (
                      <TableHead key={fieldName} className="capitalize">
                        {fieldName.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.forms?.title || "Unknown Form"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      {fieldNames.map(fieldName => (
                        <TableCell key={fieldName} className="max-w-[200px] truncate">
                          {getFieldValue(submission.data, fieldName)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
