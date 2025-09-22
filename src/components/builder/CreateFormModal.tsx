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

  const testGoogleAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be signed in to test Google authentication.");
        return;
      }

      const response = await fetch("/api/test-google-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      console.log("Google auth test result:", result);
      
      if (result.success) {
        setError(`Google authentication working! Check console for details.`);
      } else {
        setError(`Google auth test failed: ${result.details || result.error}`);
      }
    } catch (err: any) {
      setError(`Test error: ${err.message}`);
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

      console.log("Creating Google Sheet...");
      
      // Create the Google Sheet with better error handling
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

      console.log("Sheet response status:", sheetResponse.status);
      
      if (!sheetResponse.ok) {
        const errorText = await sheetResponse.text();
        console.error("Sheet creation failed:", errorText);
        
        // Try to parse error for better user feedback
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${sheetResponse.status}: ${errorText}`);
        } catch {
          throw new Error(`Failed to create Google Sheet (${sheetResponse.status}). Please check your Google Sheets permissions.`);
        }
      }

      const sheetResult = await sheetResponse.json();
      console.log("Sheet created successfully:", sheetResult);

      if (!sheetResult.success) {
        throw new Error(sheetResult.error || "Failed to create Google Sheet.");
      }

      // Create the form with Google Sheets integration
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
          google_sheet_id: sheetResult.sheetId,
          google_sheet_url: sheetResult.sheetUrl,
        })
        .select("id")
        .single();

      if (formError || !form) {
        throw new Error(formError?.message || "Failed to create the form.");
      }

      console.log("Form created successfully:", form);
      setStep("success");
      
      // Redirect after a brief success display
      setTimeout(() => {
        router.push(`/editor/${form.id}`);
        onClose();
      }, 1500);

    } catch (e: any) {
      console.error("Create form error:", e);
      setError(e.message || "Failed to create form");
      setStep("details");
    } finally {
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
      <DialogContent className="sm:max-w-[560px] rounded-3xl border-0 bg-white/80 backdrop-blur-sm shadow-2xl">
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
            
            <DialogFooter className="flex-col gap-2">
              <Button 
                onClick={testGoogleAuth} 
                variant="outline"
                className="rounded-xl w-full"
              >
                Test Google Authentication
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="rounded-xl">
                  Cancel
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
              </div>
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