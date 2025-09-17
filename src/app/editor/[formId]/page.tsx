"use client";

import { FormBuilder } from "@/components/builder/FormBuilder";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FormData } from "@/components/builder/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface EditFormPageProps {
  params: Promise<{ formId: string }>;
}

function EditFormContent({ params }: EditFormPageProps) {
  const router = useRouter();
  const loadForm = useFormStore((state) => state.loadForm);
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.formId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!formId || !user) return;

    const fetchForm = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('forms')
        .select('form_data, user_id')
        .eq('id', formId)
        .single();

      if (error) {
        console.error("Error fetching form:", error);
        router.push("/dashboard");
      } else if (data) {
        // Check if user owns this form
        if (data.user_id !== user.id) {
          console.error("Unauthorized access to form");
          router.push("/dashboard");
          return;
        }
        
        if (data.form_data) {
          // Ensure the form data has the correct database ID
          const formDataWithId = {
            ...data.form_data,
            id: formId // Use the actual database ID, not the generated one
          };
          loadForm(formDataWithId as FormData);
        }
      }
      setLoading(false);
    };

    fetchForm();
  }, [formId, user, loadForm, router]);

  if (loading || !formId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading form editor...</p>
      </div>
    );
  }

  return <FormBuilder onBack={() => router.push("/dashboard")} />;
}

export default function EditFormPage({ params }: EditFormPageProps) {
  return (
    <ProtectedRoute>
      <EditFormContent params={params} />
    </ProtectedRoute>
  );
}
