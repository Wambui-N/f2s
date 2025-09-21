import React, { useState } from "react";
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
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useFormStore } from "@/store/formStore";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFormModal({ isOpen, onClose }: CreateFormModalProps) {
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "creating" | "success">("details");
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!formName.trim() || !user) {
      setError("Form name is required.");
      return;
    }

    setIsCreating(true);
    setError(null);
    setStep("creating");

    // Add a small delay to ensure tokens are stored
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check for Google Sheets permissions
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be signed in to create forms.");
        setStep("details");
        setIsCreating(false);
        return;
      }

      // Get Google tokens from database
      const { data: tokens, error: tokensError } = await supabase
        .from("user_google_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", user.id)
        .single();

      if (tokensError || !tokens) {
        setError("Google Sheets permissions are required. Please connect your account in settings.");
        setStep("details");
        setIsCreating(false);
        return;
      }

      // Create the Google Sheet
      const sheetResponse = await fetch("/api/sheets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sheetName: `${formName} - Submissions`,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }),
      });

      const sheetResult = await sheetResponse.json();
      if (!sheetResult.success) {
        throw new Error(sheetResult.error || "Failed to create Google Sheet.");
      }

      const newConnectionId = sheetResult.connection.id;

      // Create the form
      useFormStore.getState().resetForm();
      const newFormData = useFormStore.getState().formData;
      newFormData.title = formName;
      newFormData.description = formDescription;

      const { data: form, error: formError } = await supabase
        .from("forms")
        .insert({
          user_id: user.id,
          title: formName,
          description: formDescription,
          form_data: newFormData,
          status: "draft",
          default_sheet_connection_id: newConnectionId,
        })
        .select("id")
        .single();

      if (formError || !form) {
        throw new Error(formError?.message || "Failed to create the form.");
      }

      setStep("success");
      
      // Redirect after a brief success display
      setTimeout(() => {
        router.push(`/editor/${form.id}`);
        onClose();
      }, 1500);

    } catch (e: any) {
      setError(e.message);
      setStep("details");
      setIsCreating(false);
    }
  };

  const resetModal = () => {
    setFormName("");
    setFormDescription("");
    setError(null);
    setStep("details");
    setIsCreating(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Create New Form
              </DialogTitle>
              <DialogDescription>
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
                  className="text-base"
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
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  What will be created:
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start text-blue-800">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    A new form named <span className="font-semibold mx-1">"{formName || "..."}"</span>
                  </p>
                  <p className="flex items-start text-blue-800">
                    <Share2 className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    A Google Sheet named <span className="font-semibold mx-1">"{formName || "..."} - Submissions"</span>
                  </p>
                  <p className="flex items-start text-blue-800">
                    <Zap className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    Automatic real-time sync between form and sheet
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
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
                        className="w-full justify-center text-sm"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Connect Google Account
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!formName.trim() || isCreating}
                className="btn-primary"
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
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
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Form Created Successfully!
                </h3>
                <p className="text-green-600">
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