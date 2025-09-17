import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FormData } from "./types";

interface Submission {
  id: string;
  submitted_at: string;
  synced_to_sheet: boolean;
  sync_error: string | null;
  submission_data: Record<string, any>;
}

interface SubmissionsPanelProps {
  formData: FormData;
}

export function SubmissionsPanel({ formData }: SubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!formData.id) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formData.id)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        setError("Could not load submissions.");
      } else {
        setSubmissions(data);
      }
      setIsLoading(false);
    };

    fetchSubmissions();
  }, [formData.id]);

  const formHeaders = formData.fields
    .filter(
      (field) =>
        field.type !== "divider" &&
        field.type !== "header" &&
        field.type !== "richtext",
    )
    .map((field) => field.label);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-16">{error}</div>;
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Form Submissions</CardTitle>
        <p className="text-muted-foreground pt-2">
          View all entries submitted through this form. Data is automatically
          synced with your connected Google Sheet.
        </p>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="border rounded-lg">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-[200px]">Submitted At</TableHead>
                    <TableHead className="w-[120px]">Sync Status</TableHead>
                    {formHeaders.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                    <TableHead className="w-[50px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.synced_to_sheet
                              ? "default"
                              : sub.sync_error
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {sub.synced_to_sheet
                            ? "Synced"
                            : sub.sync_error
                              ? "Failed"
                              : "Pending"}
                        </Badge>
                      </TableCell>
                      {formHeaders.map((header) => {
                        const field = formData.fields.find(
                          (f) => f.label === header,
                        );
                        const cellValue = field
                          ? sub.submission_data[field.id]
                          : "";
                        return (
                          <TableCell key={`${sub.id}-${header}`}>
                            {String(cellValue)}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="bg-muted p-4 rounded-full">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">No Submissions Yet</h3>
            <p className="text-muted-foreground mt-2">
              Once your form is published and shared, submissions will appear
              here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
