"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FieldTypes, FormField, FormData, ConditionalRule } from "./types";
import { FormFieldElement } from "./FormFieldElement";
import { FormPreview } from "./FormPreview";
import { InlineEditableTitle } from "./InlineEditableTitle";
import { FieldSettingsPanel } from "./FieldSettingsPanel";
import { FormTemplates } from "./FormTemplates";
import { ConditionalLogic } from "./ConditionalLogic";
import { SheetMapping } from "./SheetMapping";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { PublishFlow } from "./PublishFlow";
import { DesignPanel } from "./DesignPanel";
import { FormSettingsPanel } from "./FormSettingsPanel";
import { IntegrationsPanel } from "./IntegrationsPanel";
import { SubmissionsPanel } from "./SubmissionsPanel";
import { EmailNotificationsPanel } from "./EmailNotificationsPanel";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  ArrowLeft,
  Plus,
  Palette,
  Eye,
  Settings,
  Send,
  ChevronRight,
  Type,
  Mail,
  Phone,
  Link as LinkIcon,
  FileText,
  Hash,
  ToggleLeft,
  List,
  Circle,
  CheckSquare,
  Calendar,
  Star,
  MapPin,
  Minus,
  AlignLeft,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Heading1,
  GitBranch,
  Share2,
  Save,
  Sparkles,
  Zap,
  Activity,
  BarChart3,
  CheckCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2
} from "lucide-react";
import { useFormStore } from "@/store/formStore";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface FieldButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  preview: React.ReactNode;
  category?: string;
}

function FieldButton({
  icon,
  label,
  description,
  onClick,
  preview,
}: FieldButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="w-full flex items-center space-x-3 p-4 text-left hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 group hover:shadow-md"
      >
        <div className="flex-shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
            {label}
          </div>
          <div className="text-xs text-gray-500 truncate group-hover:text-blue-700">
            {description}
          </div>
        </div>
      </button>

      {showPreview && (
        <div className="absolute left-full top-0 ml-3 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72 animate-scale-in">
          <div className="text-xs font-medium text-gray-700 mb-3">Live Preview:</div>
          <div className="pointer-events-none">{preview}</div>
        </div>
      )}
    </div>
  );
}

export function FormBuilder({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const {
    formData,
    selectedField,
    conditionalRules,
    fieldMappings,
    sheetHeaders,
    rightSidebar,
    updateFormTitle,
    updateFormDescription,
    addField,
    updateField,
    deleteField,
    duplicateField,
    moveField,
    setSelectedField,
    setConditionalRules,
    setFieldMappings,
    setSheetHeaders,
    setRightSidebar,
  } = useFormStore();

  const ref = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPublishFlow, setShowPublishFlow] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testSubmissionResult, setTestSubmissionResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"builder" | "logic" | "integrations" | "submissions" | "notifications" | "settings">("builder");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [formVersion, setFormVersion] = useState(0);
  const [expandedFieldIds, setExpandedFieldIds] = useState<string[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [rightPanel, setRightPanel] = useState<"fields" | "design" | "settings">("fields");
  const [showDesign, setShowDesign] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    currentState: undoRedoCurrentState,
    saveState: saveUndoRedoState,
    undo: undoState,
    redo: redoState,
    canUndo,
    canRedo,
  } = useUndoRedo(formData);

  // Enhanced auto-save with better feedback
  useEffect(() => {
    if (formData.title === "Untitled Form" && formData.fields.length === 3) {
      return;
    }

    if (!user || !formData.id || formData.id.startsWith("field_")) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("forms")
          .update({
            // Persist only columns that exist in the schema
            fields: formData.fields,
            title: formData.title,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formData.id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error auto-saving form:", error);
          setSaveStatus("idle");
        } else {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch (err) {
        console.error("Auto-save exception:", err);
        setSaveStatus("idle");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, user]);

  const handleUndoableAction = (action: (formData: FormData) => FormData) => {
    const newFormData = action(formData);
    useFormStore.setState({ formData: newFormData });
    saveUndoRedoState(newFormData);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggingOver(true),
      onDragLeave: () => setIsDraggingOver(false),
      onDrop: ({ source }) => {
        const startIndex = source.data.index as number;
        if (startIndex === undefined) return;
        const closest = Array.from((el as HTMLElement).querySelectorAll('[data-field-id]')).find(
          (el) => (el as HTMLElement).getBoundingClientRect().top > (source as any).location.current.input.clientY
        );
        const finishIndex = closest
          ? Array.from((el as HTMLElement).querySelectorAll('[data-field-id]')).indexOf(closest)
          : formData.fields.length;

        moveField(startIndex, finishIndex);
        setIsDraggingOver(false);
      },
    });
  }, [formData.fields, moveField]);

  const renderFieldTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      text: "Text",
      email: "Email",
      phone: "Phone",
      textarea: "Textarea",
      number: "Number",
      select: "Dropdown",
      radio: "Radio",
      checkbox: "Checkboxes",
      rating: "Rating",
      file: "File Upload",
      image: "Image Upload",
      address: "Address",
      date: "Date",
      header: "Header",
      divider: "Divider",
      url: "URL",
      richtext: "Rich Text",
      switch: "Switch",
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - enterprise polish */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <InlineEditableTitle title={formData.title} onSave={updateFormTitle} className="text-xl font-semibold text-gray-900" />
              <div className="flex items-center gap-2">
                {saveStatus === "saving" && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Saving…</span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                )}
                <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {formData.status === "published" ? "Published" : "Draft"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UndoRedoButtons
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={() => {
                const prevState = undoState();
                if (prevState) useFormStore.setState({ formData: prevState });
              }}
              onRedo={() => {
                const nextState = redoState();
                if (nextState) useFormStore.setState({ formData: nextState });
              }}
            />
            <div className="h-6 w-px bg-gray-300" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMenu(true)}
              className="flex items-center space-x-2 hover:bg-gray-50 border-gray-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field</span>
            </Button>
            
            <Button 
              onClick={() => setShowPublishFlow(true)} 
              className="bg-[#2c5e2a] text-white hover:bg-[#234b21] px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Send className="w-4 h-4 mr-2" /> 
              {formData.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main two-pane layout */}
      <div className="flex h-[calc(100vh-49px)]">
        {/* Live Preview */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="w-full bg-white">
                <FormPreview
                  formData={formData}
                  isPreview={true}
                  onSubmit={(data) => {
                    console.log("Form submitted:", data);
                    alert("Form submitted successfully! (Preview mode)");
                  }}
                />
          </div>
        </div>

        {/* Right Sidebar with Tabs */}
        <div className="w-[400px] border-l border-gray-200 bg-white flex flex-col shadow-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setRightPanel("fields")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanel === "fields"
                    ? "bg-white text-[#2c5e2a] border-b-2 border-[#2c5e2a]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Fields
                </div>
              </button>
              <button
                onClick={() => setRightPanel("design")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanel === "design"
                    ? "bg-white text-[#2c5e2a] border-b-2 border-[#2c5e2a]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Palette className="w-4 h-4" />
                  Design
                </div>
              </button>
              <button
                onClick={() => setRightPanel("settings")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanel === "settings"
                    ? "bg-white text-[#2c5e2a] border-b-2 border-[#2c5e2a]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </div>
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {rightPanel === "fields" && (
              <div className="p-4 space-y-3">
                {formData.fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-sm">No fields yet</p>
                    <p className="text-xs text-gray-400">Click "Add Field" to get started</p>
                  </div>
                ) : (
                  formData.fields.map((field: FormField, index: number) => {
                const isOpen = expandedFieldIds.includes(field.id);
                return (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const startIndex = Number(e.dataTransfer.getData("text/plain"));
                      const finishIndex = index;
                      if (!Number.isNaN(startIndex) && startIndex !== finishIndex) {
                        handleUndoableAction((currentData) => {
                          const newFields = [...currentData.fields];
                          const [removed] = newFields.splice(startIndex, 1);
                          newFields.splice(finishIndex, 0, removed);
                          return { ...currentData, fields: newFields };
                        });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors" title="Drag to reorder">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          <div className="text-xs text-gray-500">{renderFieldTypeLabel(field.type)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setExpandedFieldIds((ids) => ids.includes(field.id) ? ids.filter((id) => id !== field.id) : [...ids, field.id])} 
                          className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedField(field)} 
                          className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUndoableAction((currentData) => ({
                              ...currentData,
                              fields: currentData.fields.filter((f) => f.id !== field.id),
                            }))
                          }
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                handleUndoableAction((currentData) => {
                                  const newFields = [...currentData.fields];
                                  newFields[index] = { ...newFields[index], label: e.target.value } as any;
                                  return { ...currentData, fields: newFields };
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Placeholder</Label>
                            <Input
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                handleUndoableAction((currentData) => {
                                  const newFields = [...currentData.fields];
                                  newFields[index] = { ...newFields[index], placeholder: e.target.value } as any;
                                  return { ...currentData, fields: newFields };
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-gray-700">Required Field</Label>
                            <Switch
                              checked={field.required || false}
                              onCheckedChange={(checked) =>
                                handleUndoableAction((currentData) => {
                                  const newFields = [...currentData.fields];
                                  newFields[index] = { ...newFields[index], required: checked } as any;
                                  return { ...currentData, fields: newFields };
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })
                )}
              </div>
            )}

            {rightPanel === "design" && (
              <div className="h-full">
                <DesignPanel onClose={() => setRightPanel("fields")} />
              </div>
            )}

            {rightPanel === "settings" && (
              <div className="h-full">
                <FormSettingsPanel onClose={() => setRightPanel("fields")} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showTemplates && (
        <FormTemplates
          onSelectTemplate={(template) => {
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <DesignPanel onClose={() => setShowDesign(false)} />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <FormSettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {showPublishFlow && (
        <PublishFlow
          formData={formData}
          onClose={() => setShowPublishFlow(false)}
          onTest={() => {
            setShowPublishFlow(false);
            setIsTestMode(true);
          }}
        />
      )}

      {isTestMode && (
        <Dialog open={isTestMode} onOpenChange={setIsTestMode}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Test Form Submission
              </DialogTitle>
              <DialogDescription>
                This is a live preview of your form. Test the submission flow and see how data flows to your Google Sheet.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FormPreview
                formData={formData}
                isTestMode={true}
                onSubmit={async (data) => {
                  try {
                    const response = await fetch(`/api/forms/${formData.id}/submit`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ formData: data }),
                    });
                    const result = await response.json();
                    setTestSubmissionResult(
                      `Status: ${response.status}\n\n${JSON.stringify(result, null, 2)}`
                    );
                  } catch (error) {
                    setTestSubmissionResult(`Error: ${(error as Error).message}`);
                  }
                }}
              />

              {testSubmissionResult && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Server Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border">
                      {testSubmissionResult}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTestMode(false);
                  setTestSubmissionResult(null);
                }}
              >
                Close Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}