"use client";

import { FormBuilder } from "@/components/builder/FormBuilder";
import { useFormStore } from "@/store/formStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FormData } from "@/components/builder/types";

interface EditFormPageProps {
  params: Promise<{ formId: string }>;
}

export default function EditFormPage({ params }: EditFormPageProps) {
  const router = useRouter();
  const loadForm = useFormStore((state) => state.loadForm);
  const [loading, setLoading] = useState(true);
  const [formId, setFormId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.formId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('forms')
        .select('form_data')
        .eq('id', formId)
        .single();

      if (error) {
        console.error("Error fetching form:", error);
        router.push("/dashboard");
      } else if (data && data.form_data) {
        loadForm(data.form_data as FormData);
      }
      setLoading(false);
    };

    fetchForm();
  }, [formId, loadForm, router]);

  if (loading || !formId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading form editor...</p>
      </div>
    );
  }

  return <FormBuilder onBack={() => router.push("/dashboard")} />;
}
