# Google Sheets Integration Setup Guide

## Overview
This guide will help you set up the Google Sheets integration for FormToSheets, allowing forms to automatically write submissions to Google Sheets in real-time.

## Prerequisites
- Google Cloud Console access
- Supabase project set up
- Google OAuth already configured (from authentication setup)

## Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your FormToSheets project
3. Navigate to **"APIs & Services"** → **"Library"**
4. Search for **"Google Sheets API"**
5. Click on it and press **"Enable"**
6. Also search for **"Google Drive API"** and enable it (needed for creating new sheets)

## Step 2: Update OAuth Scopes

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Click **"Edit App"**
3. Go to the **"Scopes"** section
4. Click **"Add or Remove Scopes"**
5. Add these additional scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
6. Click **"Update"** and **"Save and Continue"**

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://uiujqdpnlqzsekfyxvue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# New Google API variables (from your OAuth credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

You can find your Google Client ID and Secret in:
- Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client

## Step 4: Update Supabase Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the contents of sheets_integration_schema.sql
-- (The file contains all necessary tables and policies)
```

Copy and paste the entire contents of the `sheets_integration_schema.sql` file and execute it.

## Step 5: Test the Integration

1. **Start your development server**: `npm run dev`
2. **Sign in** to your dashboard
3. **Go to Settings** (click the Settings button in dashboard)
4. **Connect a Google Sheet**:
   - Click "Connect Sheet"
   - Choose "Create New Sheet" or "Connect Existing Sheet"
   - If first time: Click "Authorize Google Sheets Access"
   - Follow Google OAuth flow (you'll see additional permissions for Sheets)
   - Create/connect your sheet

5. **Create a test form**:
   - Go back to Dashboard
   - Create a new form
   - Add some fields (name, email, message)
   - In the form builder, go to "Sheet Mapping" tab
   - Map your form fields to sheet columns

6. **Test submission**:
   - Go to the "Preview" tab
   - Fill out the form and submit
   - Check your Google Sheet - the data should appear automatically!

## How It Works

### Architecture
```
Form Submission → API Endpoint → Google Sheets Service → Google Sheets
                      ↓
                Database Storage (backup/tracking)
```

### Key Features

1. **Real-time Writing**: Submissions are written to Google Sheets immediately
2. **Automatic Header Sync**: Form field labels become sheet column headers
3. **Retry Logic**: Failed submissions are retried with exponential backoff
4. **Error Handling**: Robust error handling with user feedback
5. **Data Backup**: All submissions are stored in Supabase as backup
6. **Duplicate Protection**: Headers are merged, not duplicated

### API Endpoints

- `POST /api/forms/[formId]/submit` - Submit form data
- `GET /api/forms/[formId]/submit` - Get form submissions
- `POST /api/sheets/connect` - Connect existing sheet
- `POST /api/sheets/create` - Create new sheet
- `POST /api/sheets/[connectionId]/sync-headers` - Sync form headers to sheet

## Troubleshooting

### Common Issues

1. **"Insufficient permissions" error**:
   - Make sure Google Sheets API is enabled
   - Verify OAuth scopes include spreadsheets access
   - Re-authorize in Settings if needed

2. **"Sheet not found" error**:
   - Check the Google Sheets URL is correct
   - Ensure the sheet is accessible to the connected Google account
   - Verify the sheet ID extraction from URL

3. **Headers not syncing**:
   - Go to Settings → Find your sheet → Click sync button
   - Check that form fields have proper labels
   - Ensure sheet connection is active

4. **Submissions not appearing**:
   - Check the form has a default sheet connection
   - Verify field mappings in the Sheet Mapping tab
   - Look for error messages in submission response

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check form submission response** in Network tab
3. **Verify sheet connection** in Settings page
4. **Test with simple form** (just name + email fields)

## Production Considerations

1. **Rate Limits**: Google Sheets API has rate limits (100 requests per 100 seconds per user)
2. **Error Monitoring**: Set up monitoring for failed sheet writes
3. **Backup Strategy**: Submissions are stored in Supabase as backup
4. **Performance**: Consider batching for high-volume forms
5. **Security**: Tokens are encrypted and stored securely

## Data Flow Example

1. User submits form with:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "message": "Hello world"
   }
   ```

2. System creates sheet row:
   ```
   | Timestamp | Name | Email | Message |
   |-----------|------|-------|---------|
   | 2024-01-15 14:30:00 | John Doe | john@example.com | Hello world |
   ```

3. Response confirms success:
   ```json
   {
     "success": true,
     "message": "Submission saved and synced to Google Sheets successfully!",
     "rowNumber": 42,
     "synced": true
   }
   ```

Your Google Sheets integration is now ready for production! 🎉
