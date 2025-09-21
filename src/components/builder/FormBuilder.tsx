"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  BarChart3
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
  const [activeTab, setActiveTab] = useState<"builder" | "logic" | "integrations" | "submissions" | "notifications">("builder");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [formVersion, setFormVersion] = useState(0);

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
            form_data: formData,
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
        const closest = Array.from(el.querySelectorAll('[data-field-id]')).find(
          (el) => el.getBoundingClientRect().top > source.location.current.input.clientY
        );
        const finishIndex = closest
          ? Array.from(el.querySelectorAll('[data-field-id]')).indexOf(closest)
          : formData.fields.length;

        moveField(startIndex, finishIndex);
        setIsDraggingOver(false);
      },
    });
  }, [formData.fields, moveField]);

  const renderRightSidebar = () => {
    if (!rightSidebar) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              {rightSidebar === "fields" && (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Fields
                </>
              )}
              {rightSidebar === "design" && (
                <>
                  <Palette className="w-5 h-5 mr-2" />
                  Design
                </>
              )}
              {rightSidebar === "settings" && (
                <>
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightSidebar(null)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>

          {rightSidebar === "fields" && (
            <div className="space-y-8">
              {/* Input Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Input Fields
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <FieldButton
                    icon={<Type className="w-5 h-5" />}
                    label="Text Input"
                    description="Single line text field"
                    onClick={() => addField("text")}
                    preview={
                      <input
                        type="text"
                        placeholder="Enter text..."
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                  <FieldButton
                    icon={<Mail className="w-5 h-5" />}
                    label="Email"
                    description="Email address with validation"
                    onClick={() => addField("email")}
                    preview={
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                  <FieldButton
                    icon={<Phone className="w-5 h-5" />}
                    label="Phone"
                    description="Phone number input"
                    onClick={() => addField("phone")}
                    preview={
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                  <FieldButton
                    icon={<FileText className="w-5 h-5" />}
                    label="Textarea"
                    description="Multi-line text input"
                    onClick={() => addField("textarea")}
                    preview={
                      <textarea
                        placeholder="Enter message..."
                        className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                  <FieldButton
                    icon={<Hash className="w-5 h-5" />}
                    label="Number"
                    description="Numeric input with validation"
                    onClick={() => addField("number")}
                    preview={
                      <input
                        type="number"
                        placeholder="123"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                </div>
              </div>

              {/* Choice Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Circle className="w-4 h-4 mr-2" />
                  Choice Fields
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <FieldButton
                    icon={<List className="w-5 h-5" />}
                    label="Dropdown"
                    description="Single selection dropdown"
                    onClick={() => addField("select")}
                    preview={
                      <select className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                        <option>Choose option...</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    }
                  />
                  <FieldButton
                    icon={<Circle className="w-5 h-5" />}
                    label="Radio Buttons"
                    description="Single choice selection"
                    onClick={() => addField("radio")}
                    preview={
                      <div className="space-y-2">
                        <label className="flex items-center text-sm">
                          <input type="radio" name="preview" className="mr-2 text-blue-600" />
                          Option 1
                        </label>
                        <label className="flex items-center text-sm">
                          <input type="radio" name="preview" className="mr-2 text-blue-600" />
                          Option 2
                        </label>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<CheckSquare className="w-5 h-5" />}
                    label="Checkboxes"
                    description="Multiple choice selection"
                    onClick={() => addField("checkbox")}
                    preview={
                      <div className="space-y-2">
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="mr-2 text-blue-600" />
                          Option 1
                        </label>
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="mr-2 text-blue-600" />
                          Option 2
                        </label>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<Star className="w-5 h-5" />}
                    label="Rating"
                    description="Star or scale rating"
                    onClick={() => addField("rating")}
                    preview={
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Upload Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Fields
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <FieldButton
                    icon={<Upload className="w-5 h-5" />}
                    label="File Upload"
                    description="Upload any file type"
                    onClick={() => addField("file")}
                    preview={
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50">
                        <Upload className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                        <p className="text-xs text-blue-700">Click to upload files</p>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<ImageIcon className="w-5 h-5" />}
                    label="Image Upload"
                    description="Upload images with preview"
                    onClick={() => addField("image")}
                    preview={
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-purple-50">
                        <ImageIcon className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                        <p className="text-xs text-purple-700">Upload images</p>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Special Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Special Fields
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <FieldButton
                    icon={<MapPin className="w-5 h-5" />}
                    label="Address"
                    description="Complete address form"
                    onClick={() => addField("address")}
                    preview={
                      <div className="space-y-2">
                        <input
                          placeholder="Street Address"
                          className="w-full px-2 py-1 border rounded text-xs"
                        />
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            placeholder="City"
                            className="px-2 py-1 border rounded text-xs"
                          />
                          <input
                            placeholder="State"
                            className="px-2 py-1 border rounded text-xs"
                          />
                        </div>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<Calendar className="w-5 h-5" />}
                    label="Date Picker"
                    description="Date selection with calendar"
                    onClick={() => addField("date")}
                    preview={
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    }
                  />
                  <FieldButton
                    icon={<Heading1 className="w-5 h-5" />}
                    label="Section Header"
                    description="Organize form sections"
                    onClick={() => addField("header")}
                    preview={
                      <h3 className="text-lg font-semibold text-gray-900">
                        Section Title
                      </h3>
                    }
                  />
                  <FieldButton
                    icon={<Minus className="w-5 h-5" />}
                    label="Divider"
                    description="Visual section separator"
                    onClick={() => addField("divider")}
                    preview={
                      <div>
                        <p className="text-sm font-medium mb-2">Section Title</p>
                        <div className="border-t-2 border-gray-200"></div>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {rightSidebar === "design" && <DesignPanel />}

          {rightSidebar === "settings" && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="form-title" className="text-sm font-medium">Form Title</Label>
                <Input
                  id="form-title"
                  value={formData.title}
                  onChange={(e) => updateFormTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="form-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="form-description"
                  value={formData.description || ""}
                  onChange={(e) => updateFormDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
                  placeholder="Describe what this form is for..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Enhanced Navigation Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <InlineEditableTitle
                title={formData.title}
                onSave={updateFormTitle}
                className="text-xl font-semibold"
              />
              
              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2">
                {saveStatus === "saving" && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                )}
                <StatusBadge
                  status={formData.status === "published" ? "success" : "pending"}
                  text={formData.status === "published" ? "Published" : "Draft"}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebar("fields")}
                className="flex items-center space-x-2 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Field</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebar("design")}
                className="flex items-center space-x-2 hover:bg-purple-50"
              >
                <Palette className="w-4 h-4" />
                <span>Design</span>
              </Button>
              
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebar("settings")}
                className="flex items-center space-x-2 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
              
              {formData.status === "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPublishFlow(true)}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              )}
              
              <Button
                onClick={() => setShowPublishFlow(true)}
                className="flex items-center space-x-2 btn-primary"
              >
                <Send className="w-4 h-4" />
                <span>{formData.status === "published" ? "Published" : "Publish"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 p-6">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as any)} 
            className="h-full flex flex-col"
          >
            <TabsList className="mb-6 bg-white shadow-sm border">
              <TabsTrigger value="builder" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Builder</span>
              </TabsTrigger>
              <TabsTrigger value="logic" className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>Logic</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Submissions</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="flex-grow">
              <div className="space-y-6 h-full overflow-y-auto scrollbar-thin">
                <FormPreview
                  formData={formData}
                  isPreview={true}
                  onSubmit={(data) => {
                    console.log("Form submitted:", data);
                    alert("Form submitted successfully! (Preview mode)");
                  }}
                />

                {/* Enhanced Builder View */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Form Fields
                      </h3>
                      <Badge variant="secondary" className="px-3 py-1">
                        {formData.fields.length} fields
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={ref}
                      className={`space-y-4 ${
                        isDraggingOver ? "bg-blue-50 rounded-lg p-4 border-2 border-dashed border-blue-300" : ""
                      }`}
                    >
                      {formData.fields.map((field: FormField, index: number) => (
                        <FormFieldElement
                          key={field.id}
                          field={field}
                          index={index}
                          onEdit={setSelectedField}
                          onDelete={(fieldId) =>
                            handleUndoableAction((currentData) => ({
                              ...currentData,
                              fields: currentData.fields.filter((f) => f.id !== fieldId),
                            }))
                          }
                          onDuplicate={(fieldToDuplicate) =>
                            handleUndoableAction((currentData) => {
                              const newFields = [...currentData.fields];
                              const index = newFields.findIndex((f) => f.id === fieldToDuplicate.id);
                              if (index > -1) {
                                newFields.splice(index + 1, 0, {
                                  ...fieldToDuplicate,
                                  id: `field_${Date.now()}`,
                                  label: `${fieldToDuplicate.label} (Copy)`,
                                });
                              }
                              return { ...currentData, fields: newFields };
                            })
                          }
                          onMoveUp={(index) => {
                            if (index > 0) {
                              handleUndoableAction((currentData) => {
                                const newFields = [...currentData.fields];
                                const [removed] = newFields.splice(index, 1);
                                newFields.splice(index - 1, 0, removed);
                                return { ...currentData, fields: newFields };
                              });
                            }
                          }}
                          onMoveDown={(index) => {
                            if (index < formData.fields.length - 1) {
                              handleUndoableAction((currentData) => {
                                const newFields = [...currentData.fields];
                                const [removed] = newFields.splice(index, 1);
                                newFields.splice(index + 1, 0, removed);
                                return { ...currentData, fields: newFields };
                              });
                            }
                          }}
                          isSelected={selectedField?.id === field.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="logic" className="flex-grow">
              <ConditionalLogic
                fields={formData.fields}
                rules={conditionalRules}
                onUpdateRules={setConditionalRules}
              />
            </TabsContent>
            
            <TabsContent value="integrations" className="flex-grow">
              <IntegrationsPanel
                key={formVersion}
                formData={formData}
                onConnectionUpdate={() => {
                  setFormVersion((v) => v + 1);
                }}
              />
            </TabsContent>
            
            <TabsContent value="submissions" className="flex-grow">
              <SubmissionsPanel key={formVersion} formData={formData} />
            </TabsContent>
            
            <TabsContent value="notifications" className="flex-grow">
              <EmailNotificationsPanel 
                formId={formData.id} 
                formTitle={formData.title}
                formData={formData}
              />
            </TabsContent>
          </Tabs>
        </div>

        {selectedField && (
          <div className="w-80 border-l bg-white shadow-lg">
            <FieldSettingsPanel
              field={selectedField}
              onClose={() => setSelectedField(null)}
            />
          </div>
        )}
      </div>

      {renderRightSidebar()}

      {showTemplates && (
        <FormTemplates
          onSelectTemplate={(template) => {
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
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