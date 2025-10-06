import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Plus, 
  FileText, 
  Share2, 
  AlertTriangle, 
  Sparkles,
  Zap,
  CheckCircle,
  Settings,
  Wand2,
  Copy,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFormStore } from "@/store/formStore";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormRecord {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  status: "draft" | "published";
}

export function CreateFormModal({ isOpen, onClose }: CreateFormModalProps) {
  const [step, setStep] = useState<"options" | "wizard" | "details" | "creating" | "success">("options");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingForms, setExistingForms] = useState<FormRecord[]>([]);
  const [selectedFormToDuplicate, setSelectedFormToDuplicate] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  // Fetch existing forms for duplication option
  useEffect(() => {
    if (isOpen && step === "options") {
      fetchExistingForms();
    }
  }, [isOpen, step]);

  const fetchExistingForms = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id, title, description, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setExistingForms(data || []);
      }
    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim() || !user) {
      setError("Form name is required.");
      return;
    }

    setIsCreating(true);
    setError(null);
    setStep("creating");

    try {
      // Check for Google Sheets permissions first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be signed in to create forms.");
        setStep("details");
        setIsCreating(false);
        return;
      }

      // Get Google tokens from database
      const { data: allUserTokens, error: tokensError } = await supabase
        .from("user_google_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tokensError || !allUserTokens || allUserTokens.length === 0) {
        setError("Google Sheets permissions are required. Please connect your account in settings.");
        setStep("details");
        setIsCreating(false);
        return;
      }

      // Get the most recent token
      const tokens = allUserTokens[0];

      // Define initial form fields
      const initialFields = [
        { type: "text", label: "Name", required: true },
        { type: "email", label: "Email", required: true }
      ];

      // Get current session token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        throw new Error("No valid session found");
      }

      // Create form and sheet together using the new API
      const response = await fetch("/api/forms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          title: formName,
          description: formDescription,
          fields: initialFields,
          googleTokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
          }
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create form and sheet");
      }

      console.log("Form and sheet created successfully:", result);
      setStep("success");
      
      // Redirect after a brief success display
      if (!result.form?.id) {
        console.error("No form ID in response:", result);
        throw new Error("Form created but ID not returned");
      }

      // Force a router refresh to update the forms list
      router.refresh();
      
      // Redirect to the form editor
      setTimeout(() => {
        router.push(`/editor/${result.form.id}`);
        onClose();
      }, 1500);

    } catch (e: any) {
      console.error("Create form error:", e);
      const message = e.message || "An unexpected error occurred.";
      setError(message.includes("permissions") 
        ? "Failed to create Google Sheet. Please check your account permissions in Settings." 
        : `Failed to create form: ${message}`);
      setStep("details");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedFormToDuplicate || !user) {
      setError("Please select a form to duplicate.");
      return;
    }

    setIsCreating(true);
    setError(null);
    setStep("creating");

    try {
      // Get the form to duplicate
      const { data: formToDuplicate, error: fetchError } = await supabase
        .from("forms")
        .select("*")
        .eq("id", selectedFormToDuplicate)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !formToDuplicate) {
        throw new Error("Failed to fetch form to duplicate");
      }

      // Create new form with duplicated data
      const { data: newForm, error: createError } = await supabase
        .from("forms")
        .insert({
          title: `${formToDuplicate.title} (Copy)`,
          description: formToDuplicate.description,
          fields: formToDuplicate.fields,
          user_id: user.id,
          status: "draft"
        })
        .select()
        .single();

      if (createError) {
        throw new Error("Failed to duplicate form");
      }

      // Redirect to the form editor
      router.push(`/editor/${newForm.id}`);
      onClose();

    } catch (e: any) {
      console.error("Duplicate form error:", e);
      setError(`Failed to duplicate form: ${e.message}`);
      setStep("details");
    } finally {
      setIsCreating(false);
    }
  };

  const resetModal = () => {
    setFormName("");
    setFormDescription("");
    setError(null);
    setStep("options");
    setIsCreating(false);
    setSelectedFormToDuplicate("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleOptionSelect = (option: "wizard" | "scratch" | "duplicate") => {
    if (option === "wizard") {
      // For now, wizard goes to details step
      // In the future, this could be a multi-step wizard
      setStep("details");
    } else if (option === "scratch") {
      setStep("details");
    } else if (option === "duplicate") {
      setStep("duplicate");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
        {step === "options" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl font-bold text-[#2c5e2a]">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Create New Form
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Choose how you'd like to create your form
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              {/* Option 1: Use Wizard */}
              <Button
                onClick={() => handleOptionSelect("wizard")}
                variant="outline"
                className="w-full h-auto p-6 rounded-2xl border-2 hover:border-[#2c5e2a] hover:bg-[#2c5e2a]/5 transition-all group"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg text-gray-900">Use Wizard</h3>
                    <p className="text-sm text-gray-600">Quick setup with guided questions</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#2c5e2a] transition-colors" />
                </div>
              </Button>

              {/* Option 2: Start from Scratch */}
              <Button
                onClick={() => handleOptionSelect("scratch")}
                variant="outline"
                className="w-full h-auto p-6 rounded-2xl border-2 hover:border-[#2c5e2a] hover:bg-[#2c5e2a]/5 transition-all group"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg text-gray-900">Start from Scratch</h3>
                    <p className="text-sm text-gray-600">Build your form from the ground up</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#2c5e2a] transition-colors" />
                </div>
              </Button>

              {/* Option 3: Duplicate Existing Form */}
              {existingForms.length > 0 && (
                <Button
                  onClick={() => handleOptionSelect("duplicate")}
                  variant="outline"
                  className="w-full h-auto p-6 rounded-2xl border-2 hover:border-[#2c5e2a] hover:bg-[#2c5e2a]/5 transition-all group"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Copy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg text-gray-900">Duplicate Existing Form</h3>
                      <p className="text-sm text-gray-600">Copy one of your existing forms</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#2c5e2a] transition-colors" />
                  </div>
                </Button>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "duplicate" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl font-bold text-[#2c5e2a]">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                  <Copy className="w-4 h-4 text-white" />
                </div>
                Duplicate Form
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Select a form to duplicate
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              {existingForms.map((form) => (
                <Button
                  key={form.id}
                  onClick={() => setSelectedFormToDuplicate(form.id)}
                  variant={selectedFormToDuplicate === form.id ? "default" : "outline"}
                  className={`w-full h-auto p-4 rounded-xl text-left ${
                    selectedFormToDuplicate === form.id 
                      ? "bg-[#2c5e2a] hover:bg-[#234b21] text-white" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <FileText className="w-5 h-5" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{form.title}</h3>
                      {form.description && (
                        <p className="text-sm opacity-75">{form.description}</p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("options")} className="rounded-xl">
                Back
              </Button>
              <Button 
                onClick={handleDuplicate}
                disabled={!selectedFormToDuplicate || isCreating}
                className="bg-[#2c5e2a] hover:bg-[#234b21] text-white rounded-xl"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Duplicating...</span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Form
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl font-bold text-[#2c5e2a]">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Create New Form
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a beautiful form with automatic Google Sheets integration. 
                Your form will be ready to collect submissions in minutes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="form-name" className="text-sm font-medium">
                  Form Name *
                </Label>
                <Input
                  id="form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Client Intake Form, Consultation Booking"
                  className="text-base rounded-2xl"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="form-description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Briefly describe what this form is for..."
                  rows={3}
                  className="rounded-2xl"
                />
              </div>
              
              <div className="bg-[#2c5e2a]/5 border border-[#2c5e2a]/20 rounded-2xl p-4 space-y-3">
                <h4 className="font-semibold text-[#2c5e2a] flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  What will be created:
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start text-[#2c5e2a]">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    A new form named <span className="font-semibold mx-1">"{formName || "..."}"</span>
                  </p>
                  <p className="flex items-start text-[#2c5e2a]">
                    <Share2 className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    A Google Sheet named <span className="font-semibold mx-1">"{formName || "..."} - Submissions"</span>
                  </p>
                  <p className="flex items-start text-[#2c5e2a]">
                    <Zap className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    Automatic real-time sync between form and sheet
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 text-red-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-red-800 text-sm mb-3">{error}</p>
                    {error.includes("Google Sheets permissions") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleClose();
                          router.push("/dashboard/settings");
                        }}
                        className="w-full justify-center text-sm rounded-xl"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Connect Google Account
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("options")} className="rounded-xl">
                Back
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!formName.trim() || isCreating}
                  className="bg-[#2c5e2a] hover:bg-[#234b21] text-white rounded-2xl"
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Form & Sheet
                    </>
                  )}
                </Button>
            </DialogFooter>
          </>
        )}

        {step === "creating" && (
          <div className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2c5e2a] to-[#234b21] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Creating Your Form</h3>
                <p className="text-muted-foreground">
                  Setting up your form and Google Sheet integration...
                </p>
              </div>
              <LoadingSpinner size="lg" />
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-[#2c5e2a] rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2c5e2a] mb-2">
                  Form Created Successfully!
                </h3>
                <p className="text-[#2c5e2a] mb-2">
                  Your form and Google Sheet have been created. Submissions will automatically sync to your sheet.
                </p>
                <p className="text-sm text-gray-600">
                  Redirecting to the form builder...
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}