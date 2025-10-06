"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Eye,
  Share2,
  Save,
  MoreVertical,
  Copy,
  Download,
  BarChart3,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Palette,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Edit,
  X,
  Plus,
  ExternalLink,
  QrCode,
  Code,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { FieldLibrary, FieldType } from "@/components/builder/FieldLibrary";
import { FormCanvas, FormField } from "@/components/builder/FormCanvas";
import { FieldSettings } from "@/components/builder/FieldSettings";
import { DesignSettings, DesignSettings as DesignSettingsType } from "@/components/builder/DesignSettings";
import { DesignPreview } from "@/components/builder/DesignPreview";
import { FormSettings, FormSettings as FormSettingsType } from "@/components/builder/FormSettings";
import { ConfigurationPreview } from "@/components/builder/ConfigurationPreview";

interface FormData {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  fields?: any[];
  settings?: any;
  theme?: any;
  default_sheet_connection_id?: string | null;
  sheet_connections?: {
    id: string;
    sheet_id: string;
    sheet_name: string;
    sheet_url: string;
    is_active: boolean;
    last_synced?: string | null;
  };
  submissions_count?: number;
  last_submission?: string | null;
}

export default function FormEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const analytics = useAnalytics();
  
  const formId = params.formId as string;
  
  // State management
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "design" | "configure">("build");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(true);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<{
    isConnected: boolean;
    lastSync?: string;
    syncError?: string;
  }>({ isConnected: false });
  
  // Field management state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [nextFieldOrder, setNextFieldOrder] = useState(1);
  
  // Design settings state
  const [designSettings, setDesignSettings] = useState<DesignSettingsType>({
    selectedTheme: 'modern',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: 8,
    buttonText: 'Send Message',
    logoAlignment: 'center',
    fieldWidth: 'full',
    labelPosition: 'above',
    // New design options with defaults
    inputHeight: 40,
    inputPadding: 12,
    fieldSpacing: 16,
    fontSize: 16,
    labelSize: 14,
    backgroundColor: '#ffffff',
    textColor: '#374151',
    borderColor: '#d1d5db',
    focusColor: '#3b82f6',
    shadowIntensity: 0,
    buttonSize: 'medium',
    buttonStyle: 'solid'
  });
  
  // Form settings state
  const [formSettings, setFormSettings] = useState<FormSettingsType>({
    name: '',
    description: '',
    thankYouMessage: 'Thank you for your submission! We\'ll get back to you soon.',
    redirectUrl: '',
    autoCloseTimer: 5,
    enableRedirect: false,
    enableAutoClose: false,
    emailNotifications: false,
    recipientEmails: [],
    customSubject: '',
    notificationFrequency: 'immediate',
    sheetConnection: {
      isConnected: false,
      sheetName: undefined,
      lastSync: undefined,
      syncError: undefined
    },
    status: 'active',
    submissionLimit: 100,
    enableSubmissionLimit: false,
    scheduleForm: {
      enabled: false,
      startDate: undefined,
      endDate: undefined
    },
    spamProtection: {
      honeypot: false,
      captcha: false
    }
  });
  
  // Panel visibility state for mobile
  const [showFieldLibrary, setShowFieldLibrary] = useState(false);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [showDesignSettings, setShowDesignSettings] = useState(false);
  
  // Modal states
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [previewThrottleTimeout, setPreviewThrottleTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSavedState, setLastSavedState] = useState<any>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced auto-save functionality
  const autoSave = useCallback(async (fieldId?: string) => {
    if (!formData || !user?.id) return;
    
    // Clear any existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    
    setSaveStatus('saving');
    setSaving(true);
    setSaveError(null);
    
    try {
      // Prepare update data with only the fields that exist
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that exist and are not null/undefined
      if (formData.title !== undefined && formData.title !== null) updateData.title = formData.title;
      if (formData.description !== undefined && formData.description !== null) updateData.description = formData.description;
      if (formData.status !== undefined && formData.status !== null) updateData.status = formData.status;
      if (formData.fields !== undefined && formData.fields !== null) updateData.fields = formData.fields;
      if (formData.settings !== undefined && formData.settings !== null) updateData.settings = formData.settings;
      if (formData.theme !== undefined && formData.theme !== null) updateData.theme = formData.theme;

      // Include design settings
      if (designSettings && Object.keys(designSettings).length > 0) {
        updateData.design_settings = designSettings;
      }

      // Include form settings
      if (formSettings && Object.keys(formSettings).length > 0) {
        updateData.form_settings = formSettings;
      }

      // Include form fields from the builder
      if (formFields && formFields.length > 0) {
        updateData.fields = formFields;
      }

      // Validate that we have at least some data to update
      if (Object.keys(updateData).length <= 1) { // Only updated_at
        console.warn("No meaningful data to save, skipping auto-save");
        setSaveStatus('saved');
        setSaving(false);
        return;
      }

      console.log("Auto-saving form with data:", {
        formId,
        updateData,
        updateDataKeys: Object.keys(updateData),
        hasUnsavedChanges,
        user_id: user.id,
        field_id: fieldId,
        formDataExists: !!formData,
        designSettingsExists: !!designSettings,
        formSettingsExists: !!formSettings,
        formFieldsLength: formFields?.length || 0
      });

      const { error } = await supabase
        .from("forms")
        .update(updateData)
        .eq("id", formId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error auto-saving form:", {
          error: JSON.stringify(error, null, 2),
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          form_id: formId,
          user_id: user.id,
          updateData: JSON.stringify(updateData, null, 2)
        });
        setSaveStatus('error');
        setSaveError(error.message || 'Failed to save changes');
        analytics.trackError('auto_save_failed', 'supabase', { 
          error: error.message || 'Unknown error', 
          form_id: formId,
          user_id: user.id,
          field_id: fieldId,
          error_details: error,
          error_code: error.code,
          error_hint: error.hint,
          updateData 
        });
      } else {
        setSaveStatus('saved');
        setLastSaved(new Date());
        setLastSaveTime(new Date());
        setHasUnsavedChanges(false);
        setPendingChanges(new Set());
        analytics.trackSuccess('auto_save', { 
          form_id: formId, 
          field_id: fieldId 
        });
      }
    } catch (error) {
      console.error("Unexpected error during auto-save:", {
        error: JSON.stringify(error, null, 2),
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        form_id: formId,
        user_id: user.id,
        field_id: fieldId
      });
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred while saving');
      analytics.trackError('auto_save_unexpected', 'try_catch', { 
        error: error instanceof Error ? error.message : String(error), 
        form_id: formId,
        user_id: user.id,
        field_id: fieldId
      });
    } finally {
      setSaving(false);
    }
  }, [formData, formId, user?.id, designSettings, formSettings, formFields, analytics, autoSaveTimeout]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((fieldId?: string) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    setSaveStatus('unsaved');
    setHasUnsavedChanges(true);
    if (fieldId) {
      setPendingChanges(prev => new Set([...prev, fieldId]));
    }
    
    const timeout = setTimeout(() => {
      autoSave(fieldId);
    }, 2000); // 2-second delay
    
    setAutoSaveTimeout(timeout);
  }, [autoSave, autoSaveTimeout]);

  // Field-level immediate save for critical fields
  const immediateSave = useCallback((fieldId: string) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    autoSave(fieldId);
  }, [autoSave, autoSaveTimeout]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formFields || formFields.length === 0) {
      errors.fields = "Form must have at least one field";
    }
    
    // Email field warning (not error)
    if (formFields && formFields.length > 0) {
      const hasEmailField = formFields.some(field => 
        field.type === 'email' || 
        field.type === 'name-email-block' ||
        field.label?.toLowerCase().includes('email')
      );
      if (!hasEmailField) {
        // This is a warning, not an error
        console.warn("Form should usually have an email field");
      }
    }
    
    // Google Sheets connection validation
    if (!formSettings?.sheetConnection?.isConnected) {
      errors.sheetConnection = "Google Sheets connection required";
    }
    
    // Field configuration validation
    if (formFields) {
      formFields.forEach((field, index) => {
        if (!field.label || field.label.trim() === '') {
          errors[`field_${index}_label`] = "Field label is required";
        }
        
        if (field.type === 'dropdown' || field.type === 'multiple-choice') {
          if (!field.options || field.options.length === 0) {
            errors[`field_${index}_options`] = "This field needs at least one option";
          }
        }
        
        if (field.type === 'file-upload') {
          if (!(field as any).acceptedTypes || (field as any).acceptedTypes.length === 0) {
            errors[`field_${index}_fileTypes`] = "File types must be specified";
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formFields, formSettings]);

  // Connection error handling
  const handleConnectionError = useCallback((errorType: string, message: string) => {
    setConnectionErrors(prev => ({
      ...prev,
      [errorType]: message
    }));
    
    analytics.trackError('connection_error', 'google_sheets', {
      error_type: errorType,
      message,
      form_id: formId
    });
  }, [formId, analytics]);

  // Field error handling
  const handleFieldError = useCallback((fieldId: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: message
    }));
    
    analytics.trackError('field_validation_error', 'form_builder', {
      field_id: fieldId,
      message,
      form_id: formId
    });
  }, [formId, analytics]);

  // Clear specific error
  const clearError = useCallback((errorType: 'validation' | 'connection' | 'field', key: string) => {
    switch (errorType) {
      case 'validation':
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
        break;
      case 'connection':
        setConnectionErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
        break;
      case 'field':
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
        break;
    }
  }, []);

  // Undo/Redo functionality
  const saveState = useCallback(() => {
    const currentState = {
      formData: { ...formData },
      formFields: [...(formFields || [])],
      designSettings: { ...designSettings },
      formSettings: { ...formSettings },
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev.slice(-49), currentState]); // Keep last 50 states
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [formData, formFields, designSettings, formSettings]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setRedoStack(prev => [...prev, {
      formData: { ...formData },
      formFields: [...(formFields || [])],
      designSettings: { ...designSettings },
      formSettings: { ...formSettings },
      timestamp: Date.now()
    }]);
    
    setUndoStack(newUndoStack);
    
    // Restore state
    if (previousState.formData) setFormData(previousState.formData);
    if (previousState.formFields) setFormFields(previousState.formFields);
    if (previousState.designSettings) setDesignSettings(previousState.designSettings);
    if (previousState.formSettings) setFormSettings(previousState.formSettings);
    
    analytics.trackInteraction('undo_action', 'keyboard', { form_id: formId });
  }, [undoStack, formData, formFields, designSettings, formSettings, formId, analytics]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    setUndoStack(prev => [...prev, {
      formData: { ...formData },
      formFields: [...(formFields || [])],
      designSettings: { ...designSettings },
      formSettings: { ...formSettings },
      timestamp: Date.now()
    }]);
    
    setRedoStack(newRedoStack);
    
    // Restore state
    if (nextState.formData) setFormData(nextState.formData);
    if (nextState.formFields) setFormFields(nextState.formFields);
    if (nextState.designSettings) setDesignSettings(nextState.designSettings);
    if (nextState.formSettings) setFormSettings(nextState.formSettings);
    
    analytics.trackInteraction('redo_action', 'keyboard', { form_id: formId });
  }, [redoStack, formData, formFields, designSettings, formSettings, formId, analytics]);


  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && formData && user?.id) {
      const timeoutId = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, autoSave, formData, user?.id]);

  // Validation effect
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  // Exit protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);


  // Performance optimizations
  const throttledPreviewUpdate = useCallback(() => {
    if (previewThrottleTimeout) {
      clearTimeout(previewThrottleTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Trigger preview update
      setPreviewThrottleTimeout(null);
    }, 300); // 300ms throttle for preview updates
    
    setPreviewThrottleTimeout(timeout);
  }, [previewThrottleTimeout]);

  // Incremental save - only send changed data
  const getChangedData = useCallback(() => {
    if (!lastSavedState) return null;
    
    const changes: any = {};
    
    // Compare form data
    if (JSON.stringify(formData) !== JSON.stringify(lastSavedState.formData)) {
      changes.formData = formData;
    }
    
    // Compare form fields
    if (JSON.stringify(formFields) !== JSON.stringify(lastSavedState.formFields)) {
      changes.formFields = formFields;
    }
    
    // Compare design settings
    if (JSON.stringify(designSettings) !== JSON.stringify(lastSavedState.designSettings)) {
      changes.designSettings = designSettings;
    }
    
    // Compare form settings
    if (JSON.stringify(formSettings) !== JSON.stringify(lastSavedState.formSettings)) {
      changes.formSettings = formSettings;
    }
    
    return Object.keys(changes).length > 0 ? changes : null;
  }, [formData, formFields, designSettings, formSettings, lastSavedState]);

  // Optimistic updates for field operations
  const optimisticAddField = useCallback((field: any) => {
    setFormFields(prev => [...(prev || []), field]);
    saveState(); // Save state for undo
    debouncedAutoSave('add_field');
  }, [saveState, debouncedAutoSave]);

  const optimisticDeleteField = useCallback((fieldId: string) => {
    setFormFields(prev => prev?.filter(f => f.id !== fieldId) || []);
    saveState(); // Save state for undo
    debouncedAutoSave('delete_field');
  }, [saveState, debouncedAutoSave]);

  const optimisticUpdateField = useCallback((fieldId: string, updates: any) => {
    setFormFields(prev => 
      prev?.map(f => f.id === fieldId ? { ...f, ...updates } : f) || []
    );
    saveState(); // Save state for undo
    debouncedAutoSave('update_field');
  }, [saveState, debouncedAutoSave]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setShowBottomBar(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.touches[0].clientX);
    setSwipeStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const swipeEndX = e.changedTouches[0].clientX;
    const swipeEndY = e.changedTouches[0].clientY;
    const deltaX = swipeEndX - swipeStartX;
    const deltaY = swipeEndY - swipeStartY;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const tabs = ['build', 'design', 'configure'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        setActiveTab(tabs[currentIndex - 1] as "build" | "design" | "configure");
      } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        setActiveTab(tabs[currentIndex + 1] as "build" | "design" | "configure");
      }
    }
  };

  // Load form data with comprehensive information
  useEffect(() => {
    const fetchFormData = async () => {
      if (!user || !formId) return;
      
      setIsLoading(true);

      setLoading(true);
      try {
        // Fetch form with sheet connection and submission data
        const { data: formData, error: formError } = await supabase
          .from("forms")
          .select(`
            *,
            sheet_connections!forms_default_sheet_connection_id_fkey (
              id,
              sheet_id,
              sheet_name,
              sheet_url,
              is_active,
              last_synced
            )
          `)
          .eq("id", formId)
          .eq("user_id", user.id)
          .single();

        if (formError) {
          console.error("Error fetching form:", formError);
          analytics.trackError('fetch_form_failed', 'supabase', { error: formError.message, form_id: formId });
          router.push("/dashboard/forms");
          return;
        }

        // Fetch recent submissions
        let submissions: any[] = [];
        let submissionsError = null;
        
        if (formId && user?.id) {
          try {
            // First check if we can access the submissions table
            const { data: testData, error: testError } = await supabase
              .from("submissions")
              .select("id")
              .limit(1);
            
            if (testError) {
              console.warn("Submissions table access test failed:", testError);
              // Continue without submissions data
              submissions = [];
            } else {
              // If test passed, fetch actual submissions
              const submissionsResult = await supabase
                .from("submissions")
                .select("id, data, created_at")
                .eq("form_id", formId)
                .order("created_at", { ascending: false })
                .limit(5);
                
              submissions = submissionsResult.data || [];
              submissionsError = submissionsResult.error;
              
              if (submissionsError) {
                console.error("Error fetching submissions:", {
                  error: submissionsError,
                  message: submissionsError.message,
                  details: submissionsError.details,
                  hint: submissionsError.hint,
                  code: submissionsError.code,
                  form_id: formId,
                  user_id: user.id
                });
                analytics.trackError('fetch_submissions_failed', 'supabase', { 
                  error: submissionsError.message || 'Unknown error', 
                  form_id: formId,
                  user_id: user.id,
                  error_details: submissionsError,
                  error_code: submissionsError.code,
                  error_hint: submissionsError.hint
                });
                // Set empty array on error to prevent UI issues
                submissions = [];
              }
            }
          } catch (fetchError) {
            console.error("Unexpected error fetching submissions:", fetchError);
            submissionsError = { message: String(fetchError) };
            submissions = []; // Set empty array on error
            analytics.trackError('fetch_submissions_unexpected', 'try_catch', { 
              error: String(fetchError), 
              form_id: formId,
              user_id: user.id
            });
          }
        } else {
          // No formId or user, set empty submissions
          submissions = [];
        }

        // Fetch submission count
        let submissionCount = 0;
        let countError = null;
        
        if (formId && user?.id) {
          try {
            const countResult = await supabase
              .from("submissions")
              .select("*", { count: "exact", head: true })
              .eq("form_id", formId);
              
            submissionCount = countResult.count || 0;
            countError = countResult.error;
            
            if (countError) {
              console.error("Error fetching submission count:", {
                error: countError,
                message: countError.message,
                details: countError.details,
                hint: countError.hint,
                code: countError.code,
                form_id: formId,
                user_id: user.id
              });
              analytics.trackError('fetch_submission_count_failed', 'supabase', { 
                error: countError.message || 'Unknown error', 
                form_id: formId,
                user_id: user.id,
                error_details: countError,
                error_code: countError.code,
                error_hint: countError.hint
              });
              // Set count to 0 on error
              submissionCount = 0;
            }
          } catch (fetchError) {
            console.error("Unexpected error fetching submission count:", fetchError);
            countError = { message: String(fetchError) };
            submissionCount = 0; // Set count to 0 on error
            analytics.trackError('fetch_submission_count_unexpected', 'try_catch', { 
              error: String(fetchError), 
              form_id: formId,
              user_id: user.id
            });
          }
        } else {
          // No formId or user, set count to 0
          submissionCount = 0;
        }

        // Process form data
        const processedFormData: FormData = {
          ...formData,
          title: formData.title || 'Get in Touch',
          description: formData.description || 'Leave your details below and we will reach out to you soon.',
          fields: formData.fields || [],
          settings: formData.settings || {},
          theme: formData.theme || {
            primaryColor: "#2c5e2a",
            fontFamily: "Inter",
            borderRadius: "8px",
            spacing: "16px"
          },
          submissions_count: submissionCount || 0,
          last_submission: submissions?.[0]?.created_at || null,
          sheet_connections: formData.sheet_connections
        };

        setFormData(processedFormData);
        setTempTitle(processedFormData.title);
        setLastSaved(new Date(formData.updated_at));
        setRecentSubmissions(submissions || []);

        // Set sheet sync status
        if (formData.sheet_connections) {
          setSheetSyncStatus({
            isConnected: formData.sheet_connections.is_active,
            lastSync: formData.sheet_connections.last_synced,
            syncError: undefined
          });
        }

        analytics.trackPageView('form_editor', { 
          form_id: formId, 
          form_title: formData.title,
          has_sheet_connection: !!formData.sheet_connections,
          submissions_count: submissionCount || 0
        });
      } catch (error) {
        console.error("Unexpected error:", error);
        analytics.trackError('fetch_form_unexpected', 'try_catch', { error: String(error), form_id: formId });
        router.push("/dashboard/forms");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [user, formId, router, analytics]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  }, []);

  // Handle title edit
  const handleTitleEdit = () => {
    if (tempTitle.trim() && tempTitle !== formData?.title) {
      updateFormData({ title: tempTitle.trim() });
      analytics.trackInteraction('edit_form_title', 'input', { 
        form_id: formId, 
        new_title: tempTitle.trim() 
      });
    }
    setIsEditingTitle(false);
  };

  // Handle status toggle
  const handleStatusToggle = async () => {
    if (!formData) return;
    
    const newStatus = formData.status === "published" ? "draft" : "published";
    updateFormData({ status: newStatus });
    
    analytics.trackFormAction('status_toggle', formId, formData.title, {
      from_status: formData.status,
      to_status: newStatus
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!formData || !user?.id) return;
    
    setSaving(true);
    try {
      // Prepare update data with only the fields that exist
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that exist and are not null/undefined
      if (formData.title !== undefined && formData.title !== null) updateData.title = formData.title;
      if (formData.description !== undefined && formData.description !== null) updateData.description = formData.description;
      if (formData.status !== undefined && formData.status !== null) updateData.status = formData.status;
      if (formData.fields !== undefined && formData.fields !== null) updateData.fields = formData.fields;
      if (formData.settings !== undefined && formData.settings !== null) updateData.settings = formData.settings;
      if (formData.theme !== undefined && formData.theme !== null) updateData.theme = formData.theme;

      // Include design settings
      if (designSettings && Object.keys(designSettings).length > 0) {
        updateData.design_settings = designSettings;
      }

      // Include form settings
      if (formSettings && Object.keys(formSettings).length > 0) {
        updateData.form_settings = formSettings;
      }

      // Include form fields from the builder
      if (formFields && formFields.length > 0) {
        updateData.fields = formFields;
      }

      console.log("Saving form with data:", {
        formId,
        updateData,
        user_id: user.id
      });

      const { error } = await supabase
        .from("forms")
        .update(updateData)
        .eq("id", formId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving form:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          form_id: formId,
          user_id: user.id,
          updateData
        });
        analytics.trackError('manual_save_failed', 'supabase', { 
          error: error.message || 'Unknown error', 
          form_id: formId,
          user_id: user.id,
          error_details: error,
          error_code: error.code,
          error_hint: error.hint,
          updateData
        });
      } else {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        analytics.trackSuccess('manual_save', { form_id: formId });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('manual_save_unexpected', 'try_catch', { 
        error: String(error), 
        form_id: formId,
        user_id: user.id
      });
    } finally {
      setSaving(false);
    }
  };



  // Handle delete
  const handleDelete = async () => {
    if (!formData) return;
    
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error deleting form:", error);
        analytics.trackError('delete_form_failed', 'supabase', { error: error.message, form_id: formId });
      } else {
        analytics.trackSuccess('delete_form', { form_id: formId });
        router.push("/dashboard/forms");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      analytics.trackError('delete_form_unexpected', 'try_catch', { error: String(error), form_id: formId });
    }
  };

  // Get form URL
  const getFormUrl = () => {
    return `${window.location.origin}/form/${formId}`;
  };

  // Generate QR code data URL
  const generateQRCode = () => {
    const formUrl = getFormUrl();
    // Using a simple QR code generator API (you can replace with a proper QR library)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;
  };

  // Generate embed code
  const generateEmbedCode = () => {
    const formUrl = getFormUrl();
    return `<iframe src="${formUrl}" width="100%" height="600" frameborder="0" style="border: none;"></iframe>`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      analytics.trackInteraction('copy_to_clipboard', 'button', { 
        form_id: formId, 
        type: type 
      });
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Get save status
  const getSaveStatus = () => {
    if (saveStatus === 'saving') return { text: "Saving...", icon: Clock, color: "text-yellow-600" };
    if (saveStatus === 'error') return { text: "Failed to save - Retry?", icon: AlertCircle, color: "text-red-600" };
    if (saveStatus === 'unsaved') return { text: "Unsaved changes", icon: AlertCircle, color: "text-orange-600" };
    if (saveStatus === 'saved') return { text: "All changes saved", icon: CheckCircle, color: "text-green-600" };
    return { text: "Ready", icon: CheckCircle, color: "text-gray-600" };
  };

  // Get validation status
  const getValidationStatus = () => {
    const errorCount = Object.keys(validationErrors).length;
    const connectionErrorCount = Object.keys(connectionErrors).length;
    const fieldErrorCount = Object.keys(fieldErrors).length;
    const totalErrors = errorCount + connectionErrorCount + fieldErrorCount;
    
    if (totalErrors === 0) return null;
    
    return {
      count: totalErrors,
      errors: {
        validation: errorCount,
        connection: connectionErrorCount,
        field: fieldErrorCount
      }
    };
  };

  // Get time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Field management functions
  const handleAddField = (fieldType: FieldType) => {
    const newField: FormField = {
      id: `${fieldType.type}_${Date.now()}`,
      type: fieldType.type,
      label: fieldType.defaultConfig.label,
      placeholder: fieldType.defaultConfig.placeholder,
      required: fieldType.defaultConfig.required,
      options: fieldType.defaultConfig.options,
      validation: fieldType.defaultConfig.validation,
      order: nextFieldOrder,
      isSelected: false,
    };

    optimisticAddField(newField);
    setNextFieldOrder(prev => prev + 1);
    
    analytics.trackInteraction('add_field', 'button', { 
      form_id: formId, 
      field_type: fieldType.type 
    });
  };

  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
    setFormFields(prev => 
      prev.map(f => ({ ...f, isSelected: f.id === field.id }))
    );
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    optimisticUpdateField(fieldId, updates);
    
    analytics.trackInteraction('update_field', 'form', { 
      form_id: formId, 
      field_id: fieldId,
      updates: Object.keys(updates)
    });
  };

  const handleFieldDelete = (fieldId: string) => {
    optimisticDeleteField(fieldId);
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    
    analytics.trackInteraction('delete_field', 'button', { 
      form_id: formId, 
      field_id: fieldId 
    });
  };

  const handleFieldReorder = (fieldId: string, newOrder: number) => {
    setFormFields(prev => {
      const field = prev.find(f => f.id === fieldId);
      if (!field) return prev;

      const otherFields = prev.filter(f => f.id !== fieldId);
      const updatedField = { ...field, order: newOrder };
      
      // Reorder all fields based on the new order
      const reorderedFields = [...otherFields, updatedField].sort((a, b) => a.order - b.order);
      
      // Update order numbers to be sequential
      return reorderedFields.map((f, index) => ({ ...f, order: index + 1 }));
    });
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('reorder_field', 'drag_drop', { 
      form_id: formId, 
      field_id: fieldId,
      new_order: newOrder
    });
  };

  const handleAddSection = () => {
    const newField: FormField = {
      id: `section_${Date.now()}`,
      type: 'section',
      label: 'New Section',
      required: false,
      order: nextFieldOrder,
      isSelected: false,
    };

    setFormFields(prev => [...prev, newField]);
    setNextFieldOrder(prev => prev + 1);
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('add_section', 'button', { form_id: formId });
  };

  const handleAddDivider = () => {
    const newField: FormField = {
      id: `divider_${Date.now()}`,
      type: 'divider',
      label: 'Divider',
      required: false,
      order: nextFieldOrder,
      isSelected: false,
    };

    setFormFields(prev => [...prev, newField]);
    setNextFieldOrder(prev => prev + 1);
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('add_divider', 'button', { form_id: formId });
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    
    // Cmd/Ctrl + S - Save
    if (cmdOrCtrl && e.key === 's') {
      e.preventDefault();
      handleSave();
      analytics.trackInteraction('keyboard_save', 'shortcut', { form_id: formId });
      return;
    }
    
    // Cmd/Ctrl + 1/2/3 - Switch tabs
    if (cmdOrCtrl && ['1', '2', '3'].includes(e.key)) {
      e.preventDefault();
      const tabMap = { '1': 'build', '2': 'design', '3': 'configure' };
      setActiveTab(tabMap[e.key as keyof typeof tabMap] as "build" | "design" | "configure");
      analytics.trackInteraction('keyboard_tab_switch', 'shortcut', { 
        form_id: formId, 
        tab: tabMap[e.key as keyof typeof tabMap] 
      });
      return;
    }
    
    // Delete - Remove selected field
    if (e.key === 'Delete' && selectedField) {
      e.preventDefault();
      handleFieldDelete(selectedField.id);
      analytics.trackInteraction('keyboard_delete_field', 'shortcut', { 
        form_id: formId, 
        field_id: selectedField.id 
      });
      return;
    }
    
    // Cmd/Ctrl + Z - Undo
    if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    
    // Cmd/Ctrl + Shift + Z - Redo
    if (cmdOrCtrl && e.key === 'Z' && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }
    
    // Cmd/Ctrl + ? - Show keyboard help
    if (cmdOrCtrl && e.key === '?') {
      e.preventDefault();
      setShowKeyboardHelp(true);
      analytics.trackInteraction('keyboard_help', 'shortcut', { form_id: formId });
      return;
    }
  }, [handleSave, activeTab, selectedField, handleFieldDelete, undo, redo, formId, analytics]);

  // Keyboard shortcuts effect
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Design management functions
  const handleDesignSettingsChange = (updates: Partial<DesignSettingsType>) => {
    setDesignSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('design_settings_change', 'form', { 
      form_id: formId, 
      updates: Object.keys(updates)
    });
  };

  const handleResetToDefaults = () => {
    setDesignSettings({
      selectedTheme: 'modern',
      primaryColor: '#3b82f6',
      fontFamily: 'Inter',
      borderRadius: 8,
      buttonText: 'Send Message',
      logoAlignment: 'center',
      fieldWidth: 'full',
      labelPosition: 'above',
      // New design options with defaults
      inputHeight: 40,
      inputPadding: 12,
      fieldSpacing: 16,
      fontSize: 16,
      labelSize: 14,
      backgroundColor: '#ffffff',
      textColor: '#374151',
      borderColor: '#d1d5db',
      focusColor: '#3b82f6',
      shadowIntensity: 0,
      buttonSize: 'medium',
      buttonStyle: 'solid'
    });
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('reset_design_defaults', 'button', { form_id: formId });
  };

  const handleExportCSS = () => {
    const css = `
/* Form Styles */
.form-container {
  font-family: ${designSettings.fontFamily};
}

.form-field {
  border-radius: ${designSettings.borderRadius}px;
}

.form-button {
  background-color: ${designSettings.primaryColor};
  border-radius: ${designSettings.borderRadius}px;
}

.form-field-width {
  width: ${designSettings.fieldWidth === 'full' ? '100%' : 'auto'};
  max-width: ${designSettings.fieldWidth === 'compact' ? '400px' : 'none'};
}
    `.trim();
    
    navigator.clipboard.writeText(css);
    alert('CSS copied to clipboard!');
    
    analytics.trackInteraction('export_css', 'button', { form_id: formId });
  };

  const handleSaveAsCustom = () => {
    // TODO: Implement save as custom theme
    alert('Save as custom theme feature coming soon!');
    
    analytics.trackInteraction('save_custom_theme', 'button', { form_id: formId });
  };

  const handleTestSubmission = () => {
    analytics.trackInteraction('test_submission', 'button', { 
      form_id: formId,
      field_count: formFields.length
    });
  };

  // Form settings management functions
  const handleFormSettingsChange = (updates: Partial<FormSettingsType>) => {
    setFormSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    analytics.trackInteraction('form_settings_change', 'form', { 
      form_id: formId, 
      updates: Object.keys(updates)
    });
  };

  const handleReconnectSheet = () => {
    // TODO: Implement Google Sheets reconnection
    alert('Google Sheets reconnection feature coming soon!');
    
    analytics.trackInteraction('reconnect_sheet', 'button', { form_id: formId });
  };

  const handleChangeSheet = () => {
    // TODO: Implement Google Sheets picker
    alert('Google Sheets picker feature coming soon!');
    
    analytics.trackInteraction('change_sheet', 'button', { form_id: formId });
  };

  const handleTestSync = () => {
    // TODO: Implement test sync
    alert('Test sync feature coming soon!');
    
    analytics.trackInteraction('test_sync', 'button', { form_id: formId });
  };

  const handleForceSync = () => {
    // TODO: Implement force sync
    alert('Force sync feature coming soon!');
    
    analytics.trackInteraction('force_sync', 'button', { form_id: formId });
  };

  // Loading skeleton components
  const EditorHeaderSkeleton = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewPanelSkeleton = () => (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 rounded-lg p-8">
          <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EditorPanelSkeleton = () => (
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="flex space-x-1">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MobileBottomBarSkeleton = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-12" />
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EditorHeaderSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PreviewPanelSkeleton />
            </div>
            <div className="lg:col-span-1">
              <EditorPanelSkeleton />
            </div>
          </div>
        </div>
        {isMobile && <MobileBottomBarSkeleton />}
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h2>
          <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button asChild>
            <Link href="/dashboard/forms">Back to Forms</Link>
          </Button>
        </div>
      </div>
    );
  }

  const saveStatusInfo = getSaveStatus();
  const SaveIcon = saveStatusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EDITOR HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* BREADCRUMB & FORM INFO */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 hover:text-gray-900"
              >
                <Link href="/dashboard/forms">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Forms
                </Link>
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              {/* FORM NAME */}
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleEdit();
                      if (e.key === "Escape") {
                        setTempTitle(formData.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="h-8 px-2 text-lg font-semibold border-none shadow-none focus:ring-2 focus:ring-[#2c5e2a]"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-semibold text-gray-900 hover:text-[#2c5e2a] transition-colors"
                  >
                    {formData.title}
                  </button>
                )}
                
                {/* STATUS BADGE & TOGGLE */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.status === "published"}
                    onCheckedChange={handleStatusToggle}
                    className="data-[state=checked]:bg-[#2c5e2a]"
                  />
                  <Badge 
                    variant={formData.status === "published" ? "default" : "secondary"}
                    className={formData.status === "published" ? "bg-green-100 text-green-800" : ""}
                  >
                    {formData.status === "published" ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* SAVE STATUS */}
            <div className="flex items-center gap-2 text-sm">
              <SaveIcon className={`w-4 h-4 ${saveStatusInfo.color}`} />
              <span className={saveStatusInfo.color}>{saveStatusInfo.text}</span>
            </div>

            {/* PRIMARY ACTIONS */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  analytics.trackInteraction('preview_form', 'button', { form_id: formId });
                  window.open(getFormUrl(), '_blank');
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShareModalOpen(true);
                  analytics.trackInteraction('share_form', 'button', { form_id: formId });
                }}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {/* TODO: Implement duplicate */}}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* TODO: Implement export */}}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Submissions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* TODO: Implement analytics */}}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteModalOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Form
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN EDITOR CONTENT */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'pb-24' : ''}`}>
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}>
          {/* LIVE PREVIEW PANEL */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-2'}`}>
            <Card 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={isMobile ? 'touch-manipulation' : ''}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <div className={`flex items-center gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                    {/* Device Simulator */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={previewMode === "desktop" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                        className="h-8 w-8 p-0"
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewMode === "tablet" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("tablet")}
                        className="h-8 w-8 p-0"
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewMode === "mobile" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                        className="h-8 w-8 p-0"
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Preview Actions - Hidden on mobile to save space */}
                    {!isMobile && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQRCode(!showQRCode)}
                          className="h-8"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEmbedCode(!showEmbedCode)}
                          className="h-8"
                        >
                          <Code className="w-4 h-4 mr-1" />
                          Embed
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Form URL */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-500 mb-1 block">Form URL</label>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate">{getFormUrl()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getFormUrl(), '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(getFormUrl(), 'form_url')}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="bg-gray-100 rounded-lg p-8">
                    <div className="max-w-md mx-auto space-y-4">
                      <Skeleton className="h-8 w-48 mx-auto" />
                      <Skeleton className="h-4 w-64 mx-auto" />
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`bg-gray-100 rounded-lg p-4 transition-all duration-200 ${
                    previewMode === "mobile" ? "max-w-sm mx-auto" : 
                    previewMode === "tablet" ? "max-w-md mx-auto" : 
                    "w-full"
                  }`}>
                  <div 
                    className="bg-white rounded-lg shadow-sm p-6"
                    style={{
                      fontFamily: designSettings.fontFamily || formData?.theme?.fontFamily || 'Inter',
                      borderRadius: designSettings.borderRadius || formData?.theme?.borderRadius || '8px',
                      backgroundColor: designSettings.backgroundColor || '#ffffff',
                      color: designSettings.textColor || '#374151',
                      fontSize: designSettings.fontSize || 16,
                      boxShadow: designSettings.shadowIntensity ? 
                        `0 ${designSettings.shadowIntensity}px ${designSettings.shadowIntensity * 2}px rgba(0,0,0,0.1)` : 
                        'none'
                    } as React.CSSProperties}
                  >
                    {/* Form Header */}
                    <div className="text-center mb-6">
                      {designSettings.logo && (
                        <div className={`mb-4 flex ${
                          designSettings.logoAlignment === 'left' ? 'justify-start' :
                          designSettings.logoAlignment === 'right' ? 'justify-end' :
                          'justify-center'
                        }`}>
                          <img
                            src={designSettings.logo}
                            alt="Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                      )}
                      <h2 
                        className="text-2xl font-bold mb-2"
                        style={{ 
                          fontFamily: designSettings.fontFamily,
                          color: designSettings.textColor || '#374151'
                        }}
                      >
                        {formData?.title || 'Get in Touch'}
                      </h2>
                      <p 
                        className="opacity-70"
                        style={{ 
                          fontFamily: designSettings.fontFamily,
                          color: designSettings.textColor || '#374151'
                        }}
                      >
                        {formData?.description || 'Leave your details below and we will reach out to you soon.'}
                      </p>
                    </div>

                    {/* Form Fields Preview */}
                    {formData?.fields && formData.fields.length > 0 ? (
                      <div style={{ 
                        gap: `${designSettings.fieldSpacing || 16}px`,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {formData.fields.map((field: any, index: number) => (
                          <div key={field.id || index} className="space-y-2">
                            <label 
                              className="block font-medium"
                              style={{ 
                                fontFamily: designSettings.fontFamily,
                                fontSize: designSettings.labelSize || 14,
                                color: designSettings.textColor || '#374151'
                              }}
                            >
                              {field.label || field.name || `Field ${index + 1}`}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {field.type === 'text' || field.type === 'email' || field.type === 'tel' ? (
                              <input
                                type={field.type}
                                placeholder={field.placeholder || `Enter ${field.label || field.name || 'text'}`}
                                className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                                style={{ 
                                  borderRadius: `${designSettings.borderRadius || 8}px`,
                                  fontFamily: designSettings.fontFamily,
                                  fontSize: designSettings.fontSize || 16,
                                  height: `${designSettings.inputHeight || 40}px`,
                                  padding: `${designSettings.inputPadding || 12}px`,
                                  borderColor: designSettings.borderColor || '#d1d5db',
                                  backgroundColor: designSettings.backgroundColor || '#ffffff',
                                  color: designSettings.textColor || '#374151',
                                  '--tw-ring-color': designSettings.focusColor || designSettings.primaryColor
                                } as React.CSSProperties}
                                disabled
                              />
                            ) : field.type === 'textarea' ? (
                              <textarea
                                placeholder={field.placeholder || `Enter ${field.label || field.name || 'text'}`}
                                rows={3}
                                className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                                style={{ 
                                  borderRadius: `${designSettings.borderRadius || 8}px`,
                                  fontFamily: designSettings.fontFamily,
                                  fontSize: designSettings.fontSize || 16,
                                  padding: `${designSettings.inputPadding || 12}px`,
                                  borderColor: designSettings.borderColor || '#d1d5db',
                                  backgroundColor: designSettings.backgroundColor || '#ffffff',
                                  color: designSettings.textColor || '#374151',
                                  '--tw-ring-color': designSettings.focusColor || designSettings.primaryColor
                                } as React.CSSProperties}
                                disabled
                              />
                            ) : field.type === 'select' ? (
                              <select
                                className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                                style={{ 
                                  borderRadius: `${designSettings.borderRadius || 8}px`,
                                  fontFamily: designSettings.fontFamily,
                                  fontSize: designSettings.fontSize || 16,
                                  height: `${designSettings.inputHeight || 40}px`,
                                  padding: `${designSettings.inputPadding || 12}px`,
                                  borderColor: designSettings.borderColor || '#d1d5db',
                                  backgroundColor: designSettings.backgroundColor || '#ffffff',
                                  color: designSettings.textColor || '#374151',
                                  '--tw-ring-color': designSettings.focusColor || designSettings.primaryColor
                                } as React.CSSProperties}
                                disabled
                              >
                                <option>Select an option</option>
                                {field.options?.map((option: string, optIndex: number) => (
                                  <option key={optIndex} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : field.type === 'checkbox' ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 focus:ring-2 focus:ring-offset-2 transition-colors"
                                  style={{ 
                                    '--tw-ring-color': designSettings.primaryColor,
                                    accentColor: designSettings.primaryColor
                                  } as React.CSSProperties}
                                  disabled
                                />
                                <span 
                                  className="text-sm"
                                  style={{ 
                                    fontFamily: designSettings.fontFamily,
                                    fontSize: designSettings.fontSize || 16,
                                    color: designSettings.textColor || '#374151'
                                  }}
                                >
                                  {field.label || field.name || 'Checkbox'}
                                </span>
                              </div>
                            ) : field.type === 'radio' ? (
                              <div className="space-y-2">
                                {field.options?.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={field.name || `field_${index}`}
                                      className="focus:ring-2 focus:ring-offset-2 transition-colors"
                                      style={{ 
                                        '--tw-ring-color': designSettings.primaryColor,
                                        accentColor: designSettings.primaryColor
                                      } as React.CSSProperties}
                                      disabled
                                    />
                                    <span 
                                      className="text-sm"
                                      style={{ 
                                        fontFamily: designSettings.fontFamily,
                                        fontSize: designSettings.fontSize || 16,
                                        color: designSettings.textColor || '#374151'
                                      }}
                                    >
                                      {option}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div 
                                className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm"
                                style={{ 
                                  borderRadius: `${designSettings.borderRadius}px`,
                                  fontFamily: designSettings.fontFamily
                                }}
                              >
                                {field.type || 'Field'} preview
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Submit Button */}
                        <button
                          className="w-full font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                          style={{ 
                            backgroundColor: designSettings.buttonStyle === 'outline' ? 'transparent' : 
                                           designSettings.buttonStyle === 'ghost' ? 'transparent' : 
                                           designSettings.primaryColor,
                            color: designSettings.buttonStyle === 'outline' || designSettings.buttonStyle === 'ghost' ? 
                                   designSettings.primaryColor : '#ffffff',
                            border: designSettings.buttonStyle === 'outline' ? 
                                   `2px solid ${designSettings.primaryColor}` : 'none',
                            borderRadius: `${designSettings.borderRadius || 8}px`,
                            fontFamily: designSettings.fontFamily,
                            fontSize: designSettings.fontSize || 16,
                            height: designSettings.buttonSize === 'small' ? '32px' :
                                   designSettings.buttonSize === 'large' ? '48px' : '40px',
                            padding: designSettings.buttonSize === 'small' ? '6px 16px' :
                                    designSettings.buttonSize === 'large' ? '12px 24px' : '8px 20px'
                          }}
                          disabled
                        >
                          {designSettings.buttonText || 'Submit'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <Wrench className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Building Your Form</h4>
                        <p className="text-gray-600 text-sm">Add fields in the Build tab to create your form</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                {/* QR Code Section */}
                {showQRCode && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">QR Code</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(getFormUrl(), 'qr_code')}
                        className="h-8"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <img
                        src={generateQRCode()}
                        alt="QR Code for form"
                        className="w-32 h-32 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Scan to open form on mobile device
                    </p>
                  </div>
                )}
                
                {/* Embed Code Section */}
                {showEmbedCode && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Embed Code</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generateEmbedCode(), 'embed_code')}
                        className="h-8"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Code
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre>{generateEmbedCode()}</pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Copy and paste this code into your website to embed the form
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* EDITOR PANEL */}
          <div className={`${isMobile ? 'order-2' : 'lg:col-span-1'}`}>
            <Card>
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={(value) => {
                  setActiveTab(value as "build" | "design" | "configure");
                  analytics.trackInteraction('tab_switch', 'tab', { 
                    form_id: formId, 
                    tab: value 
                  });
                }}>
                  <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
                    <TabsTrigger value="build" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
                      <Wrench className="w-4 h-4" />
                      {!isMobile && 'Build'}
                    </TabsTrigger>
                    <TabsTrigger value="design" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
                      <Palette className="w-4 h-4" />
                      {!isMobile && 'Design'}
                    </TabsTrigger>
                    <TabsTrigger value="configure" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
                      <Settings className="w-4 h-4" />
                      {!isMobile && 'Configure'}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Mobile Swipe Indicator */}
                {isMobile && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">Swipe left/right to switch tabs</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab}>
                  <TabsContent value="build" className="mt-0">
                    <div className={`${isMobile ? 'h-[400px]' : 'h-[600px]'} overflow-y-auto`}>
                      {loading ? (
                        <div className="space-y-4 p-4">
                          <Skeleton className="h-10 w-full" />
                          <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        </div>
                      ) : (
                        <FieldLibrary onAddField={handleAddField} />
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="design" className="mt-0">
                    <div className={`${isMobile ? 'h-[400px]' : 'h-[600px]'} overflow-y-auto`}>
                      {loading ? (
                        <div className="space-y-6 p-4">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-3 gap-2">
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </div>
                      ) : (
                        <DesignSettings
                          settings={designSettings}
                          onSettingsChange={handleDesignSettingsChange}
                          onResetToDefaults={handleResetToDefaults}
                          onExportCSS={handleExportCSS}
                          onSaveAsCustom={handleSaveAsCustom}
                        />
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="configure" className="mt-0">
                    <div className={`${isMobile ? 'h-[400px]' : 'h-[600px]'} overflow-y-auto`}>
                      {loading ? (
                        <div className="space-y-6 p-4">
                          <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Skeleton className="h-16 w-full" />
                              <Skeleton className="h-16 w-full" />
                              <Skeleton className="h-16 w-full" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                          <div className="space-y-4">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        </div>
                      ) : (
                        <ConfigurationPreview
                          settings={formSettings}
                          formFields={formFields}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM ACTION BAR */}
      {isMobile && showBottomBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="h-10"
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  analytics.trackInteraction('preview_form', 'button', { form_id: formId });
                  window.open(getFormUrl(), '_blank');
                }}
                className="h-10"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShareModalOpen(true);
                  analytics.trackInteraction('share_form', 'button', { form_id: formId });
                }}
                className="h-10"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRCode(!showQRCode)}
                className="h-10"
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      <Dialog open={isShareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Form</DialogTitle>
            <DialogDescription>
              Share this form with others by copying the link below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Form URL</label>
              <div className="flex gap-2">
                <Input
                  value={getFormUrl()}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(getFormUrl());
                    analytics.trackInteraction('copy_form_url', 'button', { form_id: formId });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formData.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KEYBOARD SHORTCUTS HELP MODAL */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your form building with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* General Shortcuts */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">General</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Save form</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘S</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show this help</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘?</kbd>
                </div>
              </div>
            </div>

            {/* Navigation Shortcuts */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Navigation</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Build tab</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Design tab</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Configure tab</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘3</kbd>
                </div>
              </div>
            </div>

            {/* Field Management */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Field Management</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delete selected field</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Delete</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Navigate between fields</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Tab</kbd>
                </div>
              </div>
            </div>

            {/* Undo/Redo */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Undo/Redo</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Undo last action</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘Z</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Redo last action</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘⇧Z</kbd>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKeyboardHelp(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
