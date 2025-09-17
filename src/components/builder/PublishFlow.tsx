"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormData } from "./types";
import { useFormStore } from "@/store/formStore";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Share2 } from "lucide-react";

interface PublishFlowProps {
  formData: FormData;
  onClose: () => void;
}

export function PublishFlow({ formData, onClose }: PublishFlowProps) {
  const { updateFormStatus } = useFormStore();
  const [isPublished, setIsPublished] = useState(
    formData.status === "published",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/form/${formData.id}`;

  const handleStatusChange = async (published: boolean) => {
    setIsSaving(true);
    const newStatus = published ? "published" : "draft";

    // Update the database
    const { error } = await supabase
      .from("forms")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", formData.id);

    if (error) {
      console.error("Error updating form status:", error);
      // You might want to show an error toast here
    } else {
      // Update the global state
      updateFormStatus(newStatus);
      setIsPublished(published);
    }
    setIsSaving(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish & Share</DialogTitle>
          <DialogDescription>
            Control your form's visibility and get a shareable link.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <Switch
              id="publish-status"
              checked={isPublished}
              onCheckedChange={handleStatusChange}
              disabled={isSaving}
            />
            <Label htmlFor="publish-status" className="flex flex-col">
              <span className="font-medium">
                {isPublished ? "Form is Published" : "Form is a Draft"}
              </span>
              <span className="text-sm text-muted-foreground">
                {isPublished
                  ? "Anyone with the link can view and respond."
                  : "Only you can see this form."}
              </span>
            </Label>
          </div>

          {isPublished && (
            <div className="space-y-2">
              <Label htmlFor="share-link" className="flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Shareable Link
              </Label>
              <div className="flex items-center space-x-2">
                <Input id="share-link" value={publicUrl} readOnly />
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
