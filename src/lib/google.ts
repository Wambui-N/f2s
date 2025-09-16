import { google } from 'googleapis';

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class GoogleAPIClient {
  private oauth2Client: any;

  constructor(tokens: GoogleTokens) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/auth/callback/google`
    );

    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    // Auto-refresh tokens
    this.oauth2Client.on('tokens', (tokens: any) => {
      if (tokens.refresh_token) {
        // Store new tokens in database
        this.updateStoredTokens(tokens);
      }
    });
  }

  private async updateStoredTokens(tokens: any) {
    // This will be implemented to update tokens in Supabase
    console.log('Updating stored tokens:', tokens);
  }

  async refreshTokens(): Promise<GoogleTokens> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || '',
        expires_at: credentials.expiry_date || Date.now() + 3600000,
      };
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh Google tokens');
    }
  }

  // Google Sheets API methods
  async getSheets() {
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
    return sheets;
  }

  async listSpreadsheets() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    });
    return response.data.files || [];
  }

  async createSpreadsheet(title: string) {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
    });
    return response.data;
  }

  async writeToSheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ) {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  }

  async getSheetHeaders(spreadsheetId: string, sheetName: string = 'Sheet1') {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    return response.data.values?.[0] || [];
  }

  // Google Drive API methods
  async getDrive() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    return drive;
  }

  async listFolders() {
    const drive = await this.getDrive();
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name, parents)',
      orderBy: 'name',
      pageSize: 100,
    });
    return response.data.files || [];
  }

  async createFolder(name: string, parentId?: string) {
    const drive = await this.getDrive();
    const response = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      },
    });
    return response.data;
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    folderId?: string
  ) {
    const drive = await this.getDrive();
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType,
        body: fileBuffer,
      },
    });
    return response.data;
  }

  // Google Calendar API methods
  async getCalendar() {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    return calendar;
  }

  async listCalendars() {
    const calendar = await this.getCalendar();
    const response = await calendar.calendarList.list();
    return response.data.items || [];
  }

  async createCalendarEvent(
    calendarId: string,
    event: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone?: string };
      end: { dateTime: string; timeZone?: string };
      attendees?: { email: string }[];
    }
  ) {
    const calendar = await this.getCalendar();
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    return response.data;
  }
}