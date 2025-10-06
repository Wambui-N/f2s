import { google } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SheetConnection,
  SubmissionData,
  SheetWriteResult,
} from "./types";

// Google Sheets API scopes needed
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

class GoogleSheetsService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async getSheets(accessToken: string, refreshToken: string) {
    const authClient = await this.getAuthClient(accessToken, refreshToken);
    return google.sheets({ version: "v4", auth: authClient });
  }

  private async getAuthClient(
    accessToken: string,
    refreshToken: string,
    expiresAt?: number
  ) {
    console.log("Creating OAuth2 client with environment variables:", {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0
    });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google API credentials not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiresAt,
    });

    // Proactively refresh the token if it's expired or close to expiring
    if (expiresAt && Date.now() >= expiresAt - 60000) {
      // 1 minute buffer
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Update the stored tokens in the database
        await this.updateStoredTokens(
          accessToken,
          credentials.access_token!,
          credentials.refresh_token || refreshToken,
          credentials.expiry_date || undefined
        );
      } catch (error) {
        console.error("Failed to refresh access token:", error);
        // This is a critical error, the refresh token might be invalid.
        // We'll mark the connection as inactive.
        await this.supabase
          .from("sheet_connections")
          .update({ is_active: false })
          .eq("refresh_token", refreshToken);
        throw new Error("Failed to refresh access token. Please reconnect.");
      }
    }

    // Handle token refresh automatically
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.access_token) {
        // Update the stored tokens in database
        await this.updateStoredTokens(
          accessToken,
          tokens.access_token,
          tokens.refresh_token || refreshToken,
          tokens.expiry_date || undefined
        );
      }
    });

    return oauth2Client;
  }

  private async updateStoredTokens(
    oldAccessToken: string,
    newAccessToken: string,
    refreshToken: string,
    expiresAt?: number | null
  ) {
    try {
      await this.supabase
        .from("sheet_connections")
        .update({
          access_token: newAccessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        })
        .eq("access_token", oldAccessToken);
    } catch (error) {
      console.error("Failed to update stored tokens:", error);
    }
  }

  async createSheet(
    userId: string,
    sheetName: string,
    accessToken: string,
    refreshToken: string,
    headers?: string[]  // Add optional headers parameter
  ): Promise<SheetConnection | null> {
    try {
      console.log("GoogleSheetsService.createSheet called with:", {
        userId,
        sheetName,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0
      });

      const authClient = await this.getAuthClient(accessToken, refreshToken);
      console.log("Auth client created successfully");
      
      const sheets = google.sheets({ version: "v4", auth: authClient });
      console.log("Sheets API client created");

      // Test the auth client first
      try {
        console.log("Testing auth client with a simple API call...");
        const drive = google.drive({ version: "v3", auth: authClient });
        const testResponse = await drive.files.list({
          pageSize: 1,
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
        });
        console.log(
          "Auth test successful, found",
          testResponse.data.files?.length || 0,
          "existing spreadsheets",
        );
      } catch (authTestError) {
        console.error("Auth test failed:", authTestError);
        throw new Error(
          `Authentication test failed: ${authTestError.message}`,
        );
      }

      // Create a new spreadsheet
      console.log("Creating spreadsheet with name:", sheetName);
      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: sheetName,
          },
          sheets: [
            {
              properties: {
                title: "Form Submissions",
                gridProperties: {
                  rowCount: 1000,
                  columnCount: headers?.length || 26, // Use headers length or default to A-Z
                },
              },
            },
          ],
        },
      });

      console.log("Spreadsheet created successfully:", response.data);
      const sheetId = response.data.spreadsheetId!;
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      console.log("Sheet ID:", sheetId, "URL:", sheetUrl);

      // If headers were provided, set them in the first row
      if (headers?.length) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: "Form Submissions!A1",
          valueInputOption: "RAW",
          requestBody: {
            values: [headers]
          }
        });
        console.log("Headers set successfully:", headers);
      }

      // Store the connection in our database and return the new record
      const { data, error } = await this.supabase
        .from("sheet_connections")
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
        console.error("Supabase insert error in sheet_connections:", error);
        // If a duplicate exists, try to fetch it instead
        if (error.code === "23505") {
          // Unique violation
          console.warn("Sheet connection already exists, fetching it instead.");
          const { data: existingData, error: existingError } = await this.supabase
            .from("sheet_connections")
            .select("*")
            .eq("user_id", userId)
            .eq("sheet_id", sheetId)
            .single();

          if (existingError) throw existingError;
          return existingData as SheetConnection;
        }
        throw error;
      }

      console.log("Sheet connection stored in database:", data);
      return data as SheetConnection;
    } catch (error) {
      console.error("Failed to create or link Google Sheet:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data
      });
      
      // Check if it's a Google API error
      if (error.response?.data) {
        console.error("Google API Error Response:", error.response.data);
      }
      
      // Check if it's an authentication error
      if (error.message?.includes('invalid_grant') || error.message?.includes('unauthorized')) {
        console.error("Authentication error - tokens may be invalid or expired");
      }
      
      return null;
    }
  }

  async connectExistingSheet(
    userId: string,
    sheetUrl: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<SheetConnection | null> {
    try {
      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      );
      if (!sheetIdMatch) {
        throw new Error("Invalid Google Sheets URL");
      }

      const sheetId = sheetIdMatch[1];
      const authClient = await this.getAuthClient(accessToken, refreshToken);
      const sheets = google.sheets({ version: "v4", auth: authClient });

      // Get sheet metadata to verify access and get name
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      const sheetName = response.data.properties?.title || "Unknown Sheet";

      // Store the connection
      const { data, error } = await this.supabase
        .from("sheet_connections")
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
      console.error("Failed to connect to existing sheet:", error);
      return null;
    }
  }

  async getSheetHeaders(sheetConnection: SheetConnection): Promise<string[]> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token,
      );
      const sheets = google.sheets({ version: "v4", auth: authClient });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetConnection.sheet_id,
        range: "Form Submissions!1:1", // First row
      });

      return response.data.values?.[0] || [];
    } catch (error) {
      console.error("Failed to get sheet headers:", error);
      return [];
    }
  }

  async syncHeaders(
    sheetConnection: SheetConnection,
    formHeaders: string[],
  ): Promise<boolean> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token,
      );
      const sheets = google.sheets({ version: "v4", auth: authClient });

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
      if (!mergedHeaders.includes("Timestamp")) {
        mergedHeaders.unshift("Timestamp");
      }

      // Update the header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetConnection.sheet_id,
        range: "Form Submissions!1:1",
        valueInputOption: "RAW",
        requestBody: {
          values: [mergedHeaders],
        },
      });

      // Update last synced timestamp
      await this.supabase
        .from("sheet_connections")
        .update({ last_synced: new Date().toISOString() })
        .eq("id", sheetConnection.id);

      return true;
    } catch (error) {
      console.error("Failed to sync headers:", error);
      return false;
    }
  }

  async writeSubmission(
    sheetConnection: SheetConnection,
    submission: SubmissionData,
    fieldMappings: Record<string, string>,
  ): Promise<SheetWriteResult> {
    try {
      const authClient = await this.getAuthClient(
        sheetConnection.access_token,
        sheetConnection.refresh_token,
      );
      const sheets = google.sheets({ version: "v4", auth: authClient });

      // Get current headers to know column order
      const headers = await this.getSheetHeaders(sheetConnection);

      // Check for new fields and sync headers if necessary
      const formFields = Object.values(fieldMappings);
      const newFields = formFields.filter((field) => !headers.includes(field));
      if (newFields.length > 0) {
        console.log("New fields detected, syncing headers:", newFields);
        await this.syncHeaders(sheetConnection, formFields);
        // Re-fetch headers after syncing
        headers.push(...newFields);
      }

      if (headers.length === 0) {
        return {
          success: false,
          error: "No headers found in sheet. Please sync headers first.",
          retryable: false,
        };
      }

      // Prepare row data based on header order
      const rowData = headers.map((header) => {
        if (header === "Timestamp") {
          return new Date().toISOString();
        }

        // Find the form field that maps to this header
        const fieldId = Object.keys(fieldMappings).find(
          (key) => fieldMappings[key] === header,
        );

        if (fieldId && submission[fieldId] !== undefined) {
          const value = submission[fieldId];

          // Handle different data types
          if (Array.isArray(value)) {
            return value.join(", "); // For checkboxes, multi-select
          }

          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value); // For complex objects
          }

          return String(value);
        }

        return ""; // Empty cell for unmapped columns
      });

      // Append the row to the sheet
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetConnection.sheet_id,
        range: "Form Submissions!A:Z",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      // Extract row number from the response
      const updatedRange = response.data.updates?.updatedRange;
      const rowNumber = updatedRange
        ? parseInt(updatedRange.split("!")[1].split(":")[0].replace(/\D/g, ""))
        : undefined;

      return {
        success: true,
        rowNumber,
      };
    } catch (error: any) {
      console.error("Failed to write to Google Sheet:", error);

      // Determine if error is retryable
      const retryable =
        error.code === 429 || // Rate limit
        error.code === 500 || // Server error
        error.code === 502 || // Bad gateway
        error.code === 503 || // Service unavailable
        error.code === 504; // Gateway timeout

      return {
        success: false,
        error: error.message || "Unknown error occurred",
        retryable,
      };
    }
  }

  async getUserSheetConnections(userId: string): Promise<SheetConnection[]> {
    try {
      const { data, error } = await this.supabase
        .from("sheet_connections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get user sheet connections:", error);
      return [];
    }
  }

  async deleteSheetConnection(
    connectionId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("sheet_connections")
        .delete()
        .eq("id", connectionId)
        .eq("user_id", userId);

      return !error;
    } catch (error) {
      console.error("Failed to delete sheet connection:", error);
      return false;
    }
  }
}

export { GoogleSheetsService };
