"use client";

import React, { useState, useEffect } from "react";
import { FormPreview } from "@/components/builder/FormPreview";
import { supabase } from "@/lib/supabase";
import { FormData } from "@/types/form";
import { trackFormViewAuto } from "@/lib/analytics";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function DashboardFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("forms")
        .select("fields, status, title, description, user_id")
        .eq("id", formId)
        .single();

      if (error || !data) {
        setError("Form not found or an error occurred.");
        console.error("Error fetching form:", error);
      } else if (data.user_id !== user.id) {
        setError("You don't have permission to view this form.");
      } else if (data.status !== "published") {
        setError("This form is not currently published.");
      } else {
        setFormData(data.fields as FormData);
        // Track form view for analytics
        trackFormViewAuto(formId).catch(error => {
          console.error('Failed to track form view:', error);
        });
      }
      setLoading(false);
    };

    fetchForm();
  }, [formId, user]);

  const handleSubmit = async (submissionData: Record<string, any>) => {
    try {
      const response = await fetch(`/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: formId, data: submissionData }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to submit the form.");
      }

      setSuccess(true);
      
      // Dispatch event to refresh sidebar counts
      window.dispatchEvent(new CustomEvent('submissionReceived'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyFormUrl = () => {
    const formUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormUrl = () => {
    return `${window.location.origin}/form/${formId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2c5e2a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/forms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Button>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 bg-white rounded-lg shadow-md border">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Form Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard/forms")}>
              Go to Forms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/forms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Button>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 bg-white rounded-lg shadow-md border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">Your submission has been received successfully.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setSuccess(false)}>
                Submit Another Response
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/forms")}>
                Back to Forms
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formData) {
    return (
      <div className="space-y-6">
        {/* Header with form info and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/forms")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Form Preview</h1>
              <p className="text-gray-600">Test your form before sharing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={copyFormUrl}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(getFormUrl(), '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
          </div>
        </div>

        {/* Form Preview */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <div className="max-w-2xl mx-auto">
            <FormPreview formData={formData} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Wrap with ProtectedRoute
export default function ProtectedDashboardFormPage(props: any) {
  return (
    <ProtectedRoute>
      <DashboardFormPage {...props} />
    </ProtectedRoute>
  );
}
