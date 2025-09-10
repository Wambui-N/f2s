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
  | 'hidden';

export interface FormField {
    id: string;
    type: FieldTypes;
    label: string;
    placeholder?: string;
    columnName: string;
    defaultValue?: string;
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
