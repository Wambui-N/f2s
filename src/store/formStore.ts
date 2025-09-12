import { create } from 'zustand';
import { produce } from 'immer';
import {
  FormData,
  FormField,
  FieldTypes,
  ConditionalRule,
} from '../../components/builder/types';

// Helper to generate unique IDs
const generateId = () =>
  `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialFormData: FormData = {
  id: generateId(),
  title: 'Client Consultation Form',
  description: 'Please fill out this form to schedule your consultation.',
  fields: [
    {
      id: generateId(),
      type: 'text',
      label: 'Full Name',
      columnName: 'fullName',
      placeholder: 'John Smith',
      required: true,
    },
    {
      id: generateId(),
      type: 'email',
      label: 'Email Address',
      columnName: 'email',
      placeholder: 'john@example.com',
      required: true,
    },
    {
      id: generateId(),
      type: 'phone',
      label: 'Phone Number',
      columnName: 'phone',
      placeholder: '+1 (555) 123-4567',
    },
  ],
  theme: {
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: '8px',
    spacing: '16px',
  },
  settings: {
    submitText: 'Book Consultation',
    successMessage:
      "Thank you! We'll be in touch within 24 hours to schedule your consultation.",
    errorMessage:
      'There was an error submitting your request. Please try again or contact us directly.',
  },
  lastSaved: new Date(),
};

interface FormState {
  formData: FormData;
  selectedField: FormField | null;
  conditionalRules: ConditionalRule[];
  fieldMappings: Record<string, string>;
  sheetHeaders: string[];
  rightSidebar: 'fields' | 'design' | 'settings' | null;

  // Actions
  setFormData: (formData: FormData) => void;
  updateFormTitle: (title: string) => void;
  updateFormDescription: (description: string) => void;

  addField: (type: FieldTypes) => void;
  updateField: (updatedField: FormField) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (field: FormField) => void;
  moveField: (startIndex: number, finishIndex: number) => void;
  setSelectedField: (field: FormField | null) => void;

  setConditionalRules: (rules: ConditionalRule[]) => void;
  setFieldMappings: (mappings: Record<string, string>) => void;
  setSheetHeaders: (headers: string[]) => void;

  setRightSidebar: (sidebar: 'fields' | 'design' | 'settings' | null) => void;
}

export const useFormStore = create<FormState>((set) => ({
  formData: initialFormData,
  selectedField: null,
  conditionalRules: [],
  fieldMappings: {},
  sheetHeaders: [
    'Full Name',
    'Email',
    'Phone',
    'Company',
    'Service Type',
    'Budget',
  ],
  rightSidebar: null,

  // Actions
  setFormData: (formData) => set({ formData }),
  updateFormTitle: (title) =>
    set(
      produce((state) => {
        state.formData.title = title;
        state.formData.lastSaved = new Date();
      })
    ),
  updateFormDescription: (description) =>
    set(
      produce((state) => {
        state.formData.description = description;
        state.formData.lastSaved = new Date();
      })
    ),

  addField: (type) =>
    set(
      produce((state) => {
        const fieldDefaults = {
          text: {
            label: 'Full Name',
            columnName: 'fullName',
            placeholder: 'Enter your full name',
          },
          email: {
            label: 'Email Address',
            columnName: 'email',
            placeholder: 'Enter your email',
          },
          phone: {
            label: 'Phone Number',
            columnName: 'phone',
            placeholder: '+1 (555) 123-4567',
          },
          textarea: {
            label: 'Message',
            columnName: 'message',
            placeholder: 'Tell us about your project...',
          },
          select: {
            label: 'Service Type',
            columnName: 'serviceType',
            options: ['Consulting', 'Coaching', 'Photography', 'Other'],
          },
          number: {
            label: 'Budget',
            columnName: 'budget',
            placeholder: 'Enter your budget',
          },
          date: {
            label: 'Preferred Date',
            columnName: 'preferredDate',
            placeholder: 'Select a date',
          },
          radio: {
            label: 'Priority Level',
            columnName: 'priority',
            options: ['High', 'Medium', 'Low'],
          },
          checkbox: {
            label: 'Services Needed',
            columnName: 'servicesNeeded',
            options: ['Strategy', 'Implementation', 'Support'],
          },
          file: {
            label: 'Upload File',
            columnName: 'uploadedFile',
            placeholder: 'Choose file',
          },
          hidden: {
            label: 'Hidden Field',
            columnName: 'hiddenField',
            placeholder: 'Hidden value',
          },
        };

        const defaults = fieldDefaults[type as keyof typeof fieldDefaults];
        const newField: FormField = {
          id: generateId(),
          type,
          label: defaults.label,
          columnName: defaults.columnName,
          placeholder:
            'placeholder' in defaults ? defaults.placeholder : undefined,
          options: 'options' in defaults ? defaults.options : undefined,
          required: false,
        };
        state.formData.fields.push(newField);
      })
    ),

  updateField: (updatedField) =>
    set(
      produce((state) => {
        const index = state.formData.fields.findIndex(
          (f: FormField) => f.id === updatedField.id
        );
        if (index !== -1) {
          state.formData.fields[index] = updatedField;
        }
        if (state.selectedField?.id === updatedField.id) {
          state.selectedField = updatedField;
        }
      })
    ),

  deleteField: (fieldId) =>
    set(
      produce((state) => {
        state.formData.fields = state.formData.fields.filter(
          (f: FormField) => f.id !== fieldId
        );
        if (state.selectedField?.id === fieldId) {
          state.selectedField = null;
        }
      })
    ),

  duplicateField: (field) =>
    set(
      produce((state) => {
        const duplicatedField: FormField = {
          ...field,
          id: generateId(),
          label: `${field.label} (Copy)`,
        };
        const index = state.formData.fields.findIndex(
          (f: FormField) => f.id === field.id
        );
        state.formData.fields.splice(index + 1, 0, duplicatedField);
      })
    ),

  moveField: (startIndex, finishIndex) =>
    set(
      produce((state) => {
        const [removed] = state.formData.fields.splice(startIndex, 1);
        state.formData.fields.splice(finishIndex, 0, removed);
      })
    ),

  setSelectedField: (field) => set({ selectedField: field }),

  setConditionalRules: (rules) => set({ conditionalRules: rules }),
  setFieldMappings: (mappings) => set({ fieldMappings: mappings }),
  setSheetHeaders: (headers) => set({ sheetHeaders: headers }),

  setRightSidebar: (sidebar) => set({ rightSidebar: sidebar }),
}));
