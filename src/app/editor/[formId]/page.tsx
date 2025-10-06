"use client";

import { FormBuilder } from "@/components/builder/FormBuilder";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
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
  const { user } = useAuth();
  const { formId } = use(params);

  useEffect(() => {
    if (!formId || !user) return;

    const fetchForm = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("forms")
        .select(`
          id,
          title,
          description,
          fields,
          user_id,
          status,
          default_sheet_connection_id,
          sheet_connections!forms_default_sheet_connection_id_fkey (
            sheet_id,
            sheet_url
          )
        `)
        .eq("id", formId)
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

        // Ensure fields have stable unique ids to avoid React key warnings
        const normalizedFields = Array.isArray(data.fields)
          ? data.fields.map((f: any, idx: number) => ({
              ...f,
              id: f?.id && typeof f.id === "string" ? f.id : `field_${Date.now()}_${idx}`,
            }))
          : [];

        // Load form data with proper structure
        loadForm({
          id: formId,
          title: data.title || "",
          description: data.description || "",
          status: data.status || "draft",
          fields: normalizedFields,
          theme: useFormStore.getState().formData.theme,
          settings: useFormStore.getState().formData.settings,
          lastSaved: new Date(),
        } as FormData);
      }
      setLoading(false);
    };

    fetchForm();
  }, [formId, user, loadForm, router]);

  if (loading) {
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
