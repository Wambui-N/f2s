"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FieldTypes, FormField, FormData } from './types';
import { FormFieldElement } from './FormFieldElement';
import { InlineEditableTitle } from './InlineEditableTitle';
import { FieldSettingsPanel } from './FieldSettingsPanel';
import { FormTemplates } from './FormTemplates';
import { ConditionalLogic, ConditionalRule } from './ConditionalLogic';
import { SheetMapping } from './SheetMapping';
import { useUndoRedo, UndoRedoButtons } from './UndoRedo';
import { PublishFlow } from './PublishFlow';
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
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';

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

  // Undo/Redo functionality - This would need to be integrated with Zustand
  // For now, we'll keep it simple and not integrate it with the store
  // const { canUndo, canRedo, undo, redo, saveState } = useUndoRedo(formData);

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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => addField('text')} className="h-12">Text</Button>
                <Button variant="outline" onClick={() => addField('email')} className="h-12">Email</Button>
                <Button variant="outline" onClick={() => addField('phone')} className="h-12">Phone</Button>
                <Button variant="outline" onClick={() => addField('textarea')} className="h-12">Textarea</Button>
                <Button variant="outline" onClick={() => addField('select')} className="h-12">Select</Button>
                <Button variant="outline" onClick={() => addField('number')} className="h-12">Number</Button>
                <Button variant="outline" onClick={() => addField('date')} className="h-12">Date</Button>
                <Button variant="outline" onClick={() => addField('radio')} className="h-12">Radio</Button>
                <Button variant="outline" onClick={() => addField('checkbox')} className="h-12">Checkbox</Button>
                <Button variant="outline" onClick={() => addField('file')} className="h-12">File</Button>
              </div>
            </div>
          )}

          {/* Other sidebar content can be added here */}
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
            <Button
              variant="ghost"
              size="sm"
              // onClick={undo} disabled={!canUndo}
              className="flex items-center space-x-2"
            >
              <Undo2 size={16} />
              <span>Undo</span>
            </Button>
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
                <div ref={ref} className={`space-y-4 ${isDraggingOver ? 'bg-muted/40 rounded-md p-4' : ''}`}>
                  {formData.description && (
                    <div className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-md">
                      {formData.description}
                    </div>
                  )}
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
              onUpdate={updateField}
              onDelete={deleteField}
              onDuplicate={duplicateField}
              onMoveUp={(fieldId: string) => {
                const index = formData.fields.findIndex((f) => f.id === fieldId);
                if (index > 0) moveField(index, index - 1);
              }}
              onMoveDown={(fieldId: string) => {
                const index = formData.fields.findIndex((f) => f.id === fieldId);
                if (index < formData.fields.length - 1) moveField(index, index + 1);
              }}
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