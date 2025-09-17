import { google } from 'googleapis';
import { supabase } from './supabase';

// Google Sheets API scopes needed
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

export interface SheetConnection {
  id: string;
  user_id: string;
  sheet_id: string;
  sheet_name: string;
  sheet_url: string;
  access_token: string;
  refresh_token: string;
  created_at: string;
  last_synced: string | null;
  is_active: boolean;
}

export interface FormSubmission {
  [fieldId: string]: any;
}

export interface SheetWriteResult {
  success: boolean;
  rowNumber?: number;
  error?: string;
  retryable?: boolean;
}

class GoogleSheetsService {
  private async getAuthClient(accessToken: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        // Update the stored tokens in database
        await this.updateStoredTokens(accessToken, tokens.access_token!, tokens.refresh_token);
      }
    });

    return oauth2Client;
  }

  private async updateStoredTokens(oldAccessToken: string, newAccessToken: string, refreshToken: string) {
    try {
      await supabase
        .from('sheet_connections')
        .update({
          access_token: newAccessToken,
          refresh_token: refreshToken,
        })
        .eq('access_token', oldAccessToken);
    } catch (error) {
      console.error('Failed to update stored tokens:', error);
    }
  }

  async createSheet(
    userId: string,
    sheetName: string,
    accessToken: string,
    refreshToken: string
  ): Promise<SheetConnection | null> {
    try {
      const authClient = await this.getAuthClient(accessToken, refreshToken);
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Create a new spreadsheet
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: sheetName,
          },
          sheets: [{
            properties: {
              title: 'Form Submissions',
              gridProperties: {
                rowCount: 1000,
                columnCount: 26, // A-Z columns
              },
            },
          }],
        },
      });

      const sheetId = response.data.spreadsheetId!;
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

      // Store the connection in our database and return the new record
      const { data, error } = await supabase
        .from('sheet_connections')
        .insert({
          user_id: userId,
          sheet_id: sheetId,
          sheet_name: sheetName,
          sheet_url: sheetUrl,
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .select()
        .single();

      if (error) {
        // If a duplicate exists, try to fetch it instead
        if (error.code === '23505') { // Unique violation
          console.warn("Sheet connection already exists, fetching it instead.");
          const { data: existingData, error: existingError } = await supabase
            .from('sheet_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('sheet_id', sheetId)
            .single();
          
          if (existingError) throw existingError;
          return existingData as SheetConnection;
        }
        throw error;
      }

      return data as SheetConnection;
    } catch (error) {
      console.error('Failed to create or link Google Sheet:', error);
      return null;
    }
  }

  async connectExistingSheet(
    userId: string,
    sheetUrl: string,
    accessToken: string,
    refreshToken: string
  ): Promise<SheetConnection | null> {
    try {
      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL');
      }

      const sheetId = sheetIdMatch[1];
      const authClient = await this.getAuthClient(accessToken, refreshToken);
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Get sheet metadata to verify access and get name
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      const sheetName = response.data.properties?.title || 'Unknown Sheet';

      // Store the connection
      const { data, error } = await supabase
        .from('sheet_connections')
        .insert({
          user_id: userId,
          sheet_id: sheetId,
          sheet_name: sheetName,
          sheet_url: sheetUrl,
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .select()
        .single();

      if (error) throw error;

      return data as SheetConnection;
    } catch (error) {
      console.error('Failed to connect to existing sheet:', error);
      return null;
    }
  }

  async getSheetHeaders(sheetConnection: SheetConnection): Promise<string[]> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token
      );
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetConnection.sheet_id,
        range: 'Form Submissions!1:1', // First row
      });

      return response.data.values?.[0] || [];
    } catch (error) {
      console.error('Failed to get sheet headers:', error);
      return [];
    }
  }

  async syncHeaders(
    sheetConnection: SheetConnection,
    formHeaders: string[]
  ): Promise<boolean> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token
      );
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Get current headers
      const currentHeaders = await this.getSheetHeaders(sheetConnection);
      
      // Merge headers (add new ones, keep existing)
      const mergedHeaders = [...currentHeaders];
      
      for (const header of formHeaders) {
        if (!mergedHeaders.includes(header)) {
          mergedHeaders.push(header);
        }
      }

      // Add timestamp column if not present
      if (!mergedHeaders.includes('Timestamp')) {
        mergedHeaders.unshift('Timestamp');
      }

      // Update the header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetConnection.sheet_id,
        range: 'Form Submissions!1:1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [mergedHeaders],
        },
      });

      // Update last synced timestamp
      await supabase
        .from('sheet_connections')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', sheetConnection.id);

      return true;
    } catch (error) {
      console.error('Failed to sync headers:', error);
      return false;
    }
  }

  async writeSubmission(
    sheetConnection: SheetConnection,
    submission: FormSubmission,
    fieldMappings: Record<string, string>
  ): Promise<SheetWriteResult> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token
      );
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Get current headers to know column order
      const headers = await this.getSheetHeaders(sheetConnection);
      
      if (headers.length === 0) {
        return {
          success: false,
          error: 'No headers found in sheet. Please sync headers first.',
          retryable: false,
        };
      }

      // Prepare row data based on header order
      const rowData = headers.map(header => {
        if (header === 'Timestamp') {
          return new Date().toISOString();
        }

        // Find the form field that maps to this header
        const fieldId = Object.keys(fieldMappings).find(
          key => fieldMappings[key] === header
        );

        if (fieldId && submission[fieldId] !== undefined) {
          const value = submission[fieldId];
          
          // Handle different data types
          if (Array.isArray(value)) {
            return value.join(', '); // For checkboxes, multi-select
          }
          
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value); // For complex objects
          }
          
          return String(value);
        }

        return ''; // Empty cell for unmapped columns
      });

      // Append the row to the sheet
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetConnection.sheet_id,
        range: 'Form Submissions!A:Z',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      });

      // Extract row number from the response
      const updatedRange = response.data.updates?.updatedRange;
      const rowNumber = updatedRange ? 
        parseInt(updatedRange.split('!')[1].split(':')[0].replace(/\D/g, '')) : 
        undefined;

      return {
        success: true,
        rowNumber,
      };

    } catch (error: any) {
      console.error('Failed to write to Google Sheet:', error);
      
      // Determine if error is retryable
      const retryable = error.code === 429 || // Rate limit
                        error.code === 500 || // Server error
                        error.code === 502 || // Bad gateway
                        error.code === 503 || // Service unavailable
                        error.code === 504;   // Gateway timeout

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        retryable,
      };
    }
  }

  async getUserSheetConnections(userId: string): Promise<SheetConnection[]> {
    try {
      const { data, error } = await supabase
        .from('sheet_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user sheet connections:', error);
      return [];
    }
  }

  async deleteSheetConnection(connectionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sheet_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Failed to delete sheet connection:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
