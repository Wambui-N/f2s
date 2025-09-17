// A generic type for form submission data, which is a key-value map.
// The key is the field ID, and the value can be a string, number, boolean, or an array of strings.
export type SubmissionData = Record<
  string,
  string | number | boolean | string[]
>;

// Represents the structure of the 'sheet_connections' table in Supabase.
export interface SheetConnection {
  id: string;
  user_id: string;
  form_id?: string; // form_id can be nullable
  sheet_id: string;
  sheet_name: string;
  sheet_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  access_token: string;
  refresh_token: string;
  expires_at?: string;
  last_synced?: string | null;
}

// The result of a write operation to a Google Sheet.
export interface SheetWriteResult {
  success: boolean;
  rowNumber?: number;
  error?: string;
  retryable?: boolean;
}
