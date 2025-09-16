export type FieldTypes =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'hidden'
  // New field types
  | 'url'
  | 'address'
  | 'rating'
  | 'switch'
  | 'divider'
  | 'header'
  | 'richtext'
  | 'image';

export interface FormField {
  id: string;
  type: FieldTypes;
  label: string;
  placeholder?: string;
  columnName: string;
  defaultValue?: string | string[] | boolean | number;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
  required?: boolean;
  cssClass?: string;
  visibility?: 'show' | 'hide';

  // Type-specific properties
  multiple?: boolean; // For file & image upload
  addressConfig?: { // For address field
    street: { enabled: boolean; label: string };
    city: { enabled: boolean; label: string };
    state: { enabled: boolean; label: string };
    zip: { enabled: boolean; label: string };
    country: { enabled: boolean; label: string };
  };
  ratingConfig?: { // For rating field
    shape: 'star' | 'heart' | 'circle';
    scale: 5 | 10;
    labelMin: string;
    labelMax: string;
  };
  content?: string; // For divider and richtext
}

export interface FormData {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    theme: {
        primaryColor: string;
        fontFamily: string;
        borderRadius: string;
        spacing: string;
    };
    settings: {
        submitText: string;
        successMessage: string;
        errorMessage: string;
    };
    lastSaved?: Date;
}

export interface ConditionalRule {
  id: string;
  conditionField: string;
  operator: 'equals' | 'contains' | 'not_empty' | 'empty';
  value: string;
  action: 'show' | 'hide';
  targetField: string;
  enabled: boolean;
}
