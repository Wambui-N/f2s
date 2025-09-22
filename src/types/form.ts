export type FieldTypes =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime-local"
  | "time"
  | "file"
  | "hidden"
  | "url"
  | "address"
  | "rating"
  | "switch"
  | "divider"
  | "header"
  | "richtext"
  | "image";

export interface FormField {
  id: string;
  type: FieldTypes;
  label: string;
  placeholder?: string;
  columnName: string;
  name?: string; // For backward compatibility
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
  visibility?: "show" | "hide";
  multiple?: boolean;
  addressConfig?: {
    street: { enabled: boolean; label: string };
    city: { enabled: boolean; label: string };
    state: { enabled: boolean; label: string };
    zip: { enabled: boolean; label: string };
    country: { enabled: boolean; label: string };
  };
  ratingConfig?: {
    shape: "star" | "heart" | "circle";
    scale: 5 | 10;
    labelMin: string;
    labelMax: string;
  };
  content?: string;
}

export interface FormData {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
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
  default_sheet_connection_id?: string | null;
}

export interface ConditionalRule {
  id: string;
  conditionField: string;
  operator: "equals" | "contains" | "not_empty" | "empty";
  value: string;
  action: "show" | "hide";
  targetField: string;
  enabled: boolean;
}
