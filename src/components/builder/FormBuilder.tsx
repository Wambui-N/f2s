"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldTypes, FormField, FormData, ConditionalRule } from './types';
import { FormFieldElement } from './FormFieldElement';
import { FormPreview } from './FormPreview';
import { InlineEditableTitle } from './InlineEditableTitle';
import { FieldSettingsPanel } from './FieldSettingsPanel';
import { FormTemplates } from './FormTemplates';
import { ConditionalLogic } from './ConditionalLogic';
import { SheetMapping } from './SheetMapping';
import { UndoRedoButtons } from './UndoRedoButtons';
import { PublishFlow } from './PublishFlow';
import { DesignPanel } from './DesignPanel';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import {
  ArrowLeft,
  Plus,
  Palette,
  Eye,
  Undo2,
  Settings,
  Send,
  ChevronRight,
  Type,
  Mail,
  Phone,
  Link,
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
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

interface FieldButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  preview: React.ReactNode;
}

function FieldButton({ icon, label, description, onClick, preview }: FieldButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
      >
        <div className="flex-shrink-0 text-gray-500 group-hover:text-gray-700">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 truncate">{description}</div>
        </div>
      </button>
      
      {/* Hover Preview Tooltip */}
      {showPreview && (
        <div className="absolute left-full top-0 ml-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
          <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
          <div className="pointer-events-none">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}

export function FormBuilder({ onBack }: { onBack: () => void }) {
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
  const [activeTab, setActiveTab] = useState<'preview' | 'logic' | 'mapping'>('preview');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const {
    currentState: undoRedoCurrentState,
    saveState: saveUndoRedoState,
    undo: undoState,
    redo: redoState,
    canUndo,
    canRedo,
  } = useUndoRedo(formData);

  // Debounced auto-save effect
  useEffect(() => {
    // Don't save the initial default form data until it's changed
    if (formData.title === 'Untitled Form' && formData.fields.length === 3) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      if (formData.id) {
        const { error } = await supabase
          .from('forms')
          .update({ 
            form_data: formData,
            title: formData.title,
            description: formData.description 
          })
          .eq('id', formData.id);

        if (error) {
          console.error('Error auto-saving form:', error);
          setSaveStatus('idle'); // Or an error state
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      }
    }, 1500); // 1.5-second debounce delay

    return () => clearTimeout(timer);
  }, [formData]);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsDraggingOver(true),
      onDragLeave: () => setIsDraggingOver(false),
      onDrop: ({ source }) => {
        const startIndex = source.data.index as number;
        const finishIndex = formData.fields.length;
        moveField(startIndex, finishIndex);
        setIsDraggingOver(false);
      },
    });
  }, [formData.fields, moveField]);

  const handleSyncHeaders = async () => {
    // Simulate API call to get sheet headers
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSheetHeaders(['Full Name', 'Email', 'Phone', 'Company', 'Service Type', 'Budget', 'Message']);
  };

  const renderRightSidebar = () => {
    if (!rightSidebar) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {rightSidebar === 'fields' && 'Add Fields'}
              {rightSidebar === 'design' && 'Design'}
              {rightSidebar === 'settings' && 'Settings'}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setRightSidebar(null)}>
              ×
            </Button>
          </div>

          {rightSidebar === 'fields' && (
            <div className="space-y-6">
              {/* Input Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Input Fields
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <FieldButton
                    icon={<Type className="w-4 h-4" />}
                    label="Text"
                    description="Single line text input"
                    onClick={() => addField('text')}
                    preview={<input type="text" placeholder="Enter text..." className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                  <FieldButton
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    description="Email address input"
                    onClick={() => addField('email')}
                    preview={<input type="email" placeholder="name@example.com" className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                  <FieldButton
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    description="Phone number input"
                    onClick={() => addField('phone')}
                    preview={<input type="tel" placeholder="+1 (555) 123-4567" className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                  <FieldButton
                    icon={<Link className="w-4 h-4" />}
                    label="URL"
                    description="Website URL input"
                    onClick={() => addField('url')}
                    preview={<input type="url" placeholder="https://example.com" className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                  <FieldButton
                    icon={<FileText className="w-4 h-4" />}
                    label="Textarea"
                    description="Multi-line text input"
                    onClick={() => addField('textarea')}
                    preview={<textarea placeholder="Enter message..." className="w-full px-3 py-2 border rounded-md text-sm h-16 resize-none" />}
                  />
                  <FieldButton
                    icon={<Hash className="w-4 h-4" />}
                    label="Number"
                    description="Numeric input"
                    onClick={() => addField('number')}
                    preview={<input type="number" placeholder="123" className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                </div>
              </div>

              {/* Choice Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Circle className="w-4 h-4 mr-2" />
                  Choice Fields
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <FieldButton
                    icon={<List className="w-4 h-4" />}
                    label="Select"
                    description="Dropdown selection"
                    onClick={() => addField('select')}
                    preview={
                      <select className="w-full px-3 py-2 border rounded-md text-sm">
                        <option>Choose option...</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    }
                  />
                  <FieldButton
                    icon={<Circle className="w-4 h-4" />}
                    label="Radio"
                    description="Single choice selection"
                    onClick={() => addField('radio')}
                    preview={
                      <div className="space-y-1">
                        <label className="flex items-center text-sm">
                          <input type="radio" name="preview" className="mr-2" />
                          Option 1
                        </label>
                        <label className="flex items-center text-sm">
                          <input type="radio" name="preview" className="mr-2" />
                          Option 2
                        </label>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<CheckSquare className="w-4 h-4" />}
                    label="Checkbox"
                    description="Multiple choice selection"
                    onClick={() => addField('checkbox')}
                    preview={
                      <div className="space-y-1">
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="mr-2" />
                          Option 1
                        </label>
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="mr-2" />
                          Option 2
                        </label>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<Star className="w-4 h-4" />}
                    label="Rating"
                    description="Star or scale rating"
                    onClick={() => addField('rating')}
                    preview={
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<ToggleLeft className="w-4 h-4" />}
                    label="Switch"
                    description="Toggle on/off"
                    onClick={() => addField('switch')}
                    preview={
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                        </div>
                        <span className="text-sm">Toggle option</span>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Upload Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Fields
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <FieldButton
                    icon={<Upload className="w-4 h-4" />}
                    label="File Upload"
                    description="Upload any file type"
                    onClick={() => addField('file')}
                    preview={
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center">
                        <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Click to upload</p>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<ImageIcon className="w-4 h-4" />}
                    label="Image Upload"
                    description="Upload images only"
                    onClick={() => addField('image')}
                    preview={
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center">
                        <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Upload image</p>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Special Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Special Fields
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <FieldButton
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                    description="Complete address form"
                    onClick={() => addField('address')}
                    preview={
                      <div className="space-y-2">
                        <input placeholder="Street Address" className="w-full px-2 py-1 border rounded text-xs" />
                        <div className="grid grid-cols-2 gap-1">
                          <input placeholder="City" className="px-2 py-1 border rounded text-xs" />
                          <input placeholder="State" className="px-2 py-1 border rounded text-xs" />
                        </div>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<Calendar className="w-4 h-4" />}
                    label="Date"
                    description="Date picker"
                    onClick={() => addField('date')}
                    preview={<input type="date" className="w-full px-3 py-2 border rounded-md text-sm" />}
                  />
                  <FieldButton
                    icon={<Heading1 className="w-4 h-4" />}
                    label="Header"
                    description="Section title/heading"
                    onClick={() => addField('header')}
                    preview={
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Section Title</h3>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<Minus className="w-4 h-4" />}
                    label="Divider"
                    description="Section separator"
                    onClick={() => addField('divider')}
                    preview={
                      <div>
                        <p className="text-sm font-medium">Section Title</p>
                        <div className="border-t mt-1"></div>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<AlignLeft className="w-4 h-4" />}
                    label="Text Block"
                    description="Rich text content"
                    onClick={() => addField('richtext')}
                    preview={
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm">Add instructions or information here...</p>
                      </div>
                    }
                  />
                  <FieldButton
                    icon={<EyeOff className="w-4 h-4" />}
                    label="Hidden"
                    description="Hidden form field"
                    onClick={() => addField('hidden')}
                    preview={
                      <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-500 italic">
                        Hidden field (not visible to users)
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {rightSidebar === 'design' && (
            <DesignPanel />
          )}

          {rightSidebar === 'settings' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="form-title">Form Title</Label>
                <Input
                  id="form-title"
                  value={formData.title}
                  onChange={(e) => updateFormTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={formData.description || ''}
                  onChange={(e) => updateFormDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tally-style Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft size={16} />
            </Button>
            <ChevronRight size={16} className="text-gray-400" />
            <InlineEditableTitle
              title={formData.title}
              onSave={updateFormTitle}
              className="text-lg font-medium"
            />
             {saveStatus === 'saving' && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Save size={12} className="animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Save size={12} />
                <span>Saved</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightSidebar('fields')}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add field</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightSidebar('design')}
              className="flex items-center space-x-2"
            >
              <Palette size={16} />
              <span>Design</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('preview')}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Preview</span>
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
              onClick={() => setRightSidebar('settings')}
              className="flex items-center space-x-2"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Button>
            <Button
              onClick={() => setShowPublishFlow(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} />
              <span>Publish</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </Button>
                <Button
                  variant={activeTab === 'logic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('logic')}
                >
                  Logic
                </Button>
                <Button
                  variant={activeTab === 'mapping' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('mapping')}
                >
                  Sheet Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-lg border">
                    <FormPreview 
                      formData={formData} 
                      isPreview={true}
                      onSubmit={(data) => {
                        console.log('Form submitted:', data);
                        alert('Form submitted successfully! (Preview mode)');
                      }}
                    />
                  </div>
                  
                  {/* Builder view for editing */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Form Builder</h3>
                    <div ref={ref} className={`space-y-4 ${isDraggingOver ? 'bg-muted/40 rounded-md p-4' : ''}`}>
                      {formData.fields.map((field: FormField, index: number) => (
                        <FormFieldElement
                          key={field.id}
                          field={field}
                          index={index}
                          onEdit={setSelectedField}
                          onDelete={deleteField}
                          isSelected={selectedField?.id === field.id}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'logic' && (
                <ConditionalLogic
                  fields={formData.fields}
                  rules={conditionalRules}
                  onUpdateRules={setConditionalRules}
                />
              )}
              {activeTab === 'mapping' && (
                <SheetMapping
                  fields={formData.fields}
                  sheetHeaders={sheetHeaders}
                  fieldMappings={fieldMappings}
                  onUpdateMappings={setFieldMappings}
                  onSyncHeaders={handleSyncHeaders}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {selectedField && (
          <div className="w-80 border-l bg-white">
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
            // setFormData(template);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showPublishFlow && (
        <PublishFlow
          formData={formData}
          onClose={() => setShowPublishFlow(false)}
        />
      )}
    </div>
  );
}