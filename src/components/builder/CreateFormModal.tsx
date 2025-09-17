import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, FileText, Share2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFormStore } from '@/store/formStore';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFormModal({ isOpen, onClose }: CreateFormModalProps) {
  const [formName, setFormName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!formName || !user) {
      setError("Form name cannot be empty.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // 1. Check for Google Sheets permissions
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token || !session?.provider_refresh_token) {
        setError("Google Sheets permissions are required. Please connect your account in settings.");
        // Optional: Trigger re-auth flow here
        // For now, we'll just show the error.
        setIsCreating(false);
        return;
      }

      // 2. Create the Google Sheet
      const sheetResponse = await fetch('/api/sheets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          sheetName: formName,
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
        }),
      });

      const sheetResult = await sheetResponse.json();
      if (!sheetResult.success) {
        throw new Error(sheetResult.error || "Failed to create Google Sheet.");
      }

      const newConnectionId = sheetResult.connection.id;

      // 4. Create the form object
      useFormStore.getState().resetForm();
      const newFormData = useFormStore.getState().formData;
      newFormData.title = formName;

      // 5. Insert the form into the database, linking the sheet
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          title: formName,
          form_data: newFormData,
          status: 'draft',
          default_sheet_connection_id: newConnectionId,
        })
        .select('id')
        .single();

      if (formError || !form) {
        throw new Error(formError?.message || "Failed to create the form in the database.");
      }
      
      // 6. Redirect to the new editor
      router.push(`/editor/${form.id}`);
      onClose();

    } catch (e: any) {
      setError(e.message);
      setIsCreating(false);
    }
  };

  const handlePermissionRequest = () => {
    // This flow redirects the user to grant permissions and come back
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        redirectTo: window.location.href, // Redirect back to the dashboard
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Form</DialogTitle>
          <DialogDescription>
            This will create a new form and a corresponding Google Sheet to store submissions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-name">Form Name</Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Client Intake Form"
            />
          </div>
          <div className="text-sm p-3 bg-muted/70 rounded-lg">
            <p className="flex items-start">
              <FileText className="h-4 w-4 mr-2 mt-1 shrink-0" />
              <span>A new form named <span className="font-semibold">{formName || '...'}</span> will be created.</span>
            </p>
            <p className="flex items-start mt-2">
              <Share2 className="h-4 w-4 mr-2 mt-1 shrink-0" />
              <span>A new Google Sheet named <span className="font-semibold">{formName || '...'}</span> will also be created and linked.</span>
            </p>
          </div>
          {error && (
            <div className="text-sm p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">An error occurred</p>
                <p>{error}</p>
                {error.includes("permissions") && (
                  <Button size="sm" variant="link" className="p-0 h-auto mt-2" onClick={handlePermissionRequest}>
                    Grant Google Sheets Permissions
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!formName || isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isCreating ? 'Creating...' : 'Create Form & Sheet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
