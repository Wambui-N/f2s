// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { FormPreview } from "@/components/builder/FormPreview";
import { supabase } from "@/lib/supabase";
import { FormData } from "@/types/form";
import { trackFormViewAuto } from "@/lib/analytics";

export default async function FormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("forms")
        .select("form_data, status")
        .eq("id", formId)
        .single();

      if (error || !data) {
        setError("Form not found or an error occurred.");
        console.error("Error fetching form:", error);
      } else if (data.status !== "published") {
        setError("This form is not currently active.");
      } else {
        setFormData(data.form_data as FormData);
        // Track form view for analytics
        trackFormViewAuto(formId).catch(error => {
          console.error('Failed to track form view:', error);
        });
      }
      setLoading(false);
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = async (submissionData: Record<string, any>) => {
    try {
      const response = await fetch(`/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: formId, formData: submissionData }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to submit the form.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <p>Loading form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center p-8 bg-background rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            An Error Occurred
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center p-8 bg-background rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-4">Thank You!</h2>
          <p>Your submission has been received successfully.</p>
        </div>
      </div>
    );
  }

  if (formData) {
    return (
      <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <FormPreview formData={formData} onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  return null; // Should not be reached
}
