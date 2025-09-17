# Google Sheets Permissions Fix

## The Problem
The error "Please reconnect your Google account with Sheets permissions" occurs because the current Google OAuth session doesn't include the necessary scopes for Google Sheets API access.

## Root Cause
When users first sign in with Google (for authentication), they only grant basic profile permissions. To access Google Sheets, we need additional scopes:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`

## Solution Options

### Option 1: Update Supabase OAuth Provider (Recommended)

1. **Go to Supabase Dashboard** → Authentication → Providers → Google
2. **Update the scopes** to include:
   ```
   openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file
   ```
3. **Save the changes**
4. **Users will need to re-authenticate** to get the new permissions

### Option 2: Separate OAuth Flow for Sheets (Current Implementation)

The code already handles this by having a separate "Authorize Google Sheets Access" button that requests additional permissions.

## Testing Steps

1. **Click "Debug Session"** button in settings to see current token status
2. **Click "Authorize Google Sheets Access"** to get Sheets permissions
3. **Try creating/connecting a sheet** after authorization

## Quick Fix Instructions

### Step 1: Update Supabase OAuth Scopes
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Click on Google provider
4. In the "Scopes" field, enter:
   ```
   openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file
   ```
5. Save changes

### Step 2: Test the Flow
1. Sign out and sign back in (to get new permissions)
2. Go to Settings
3. Try creating a new sheet

### Step 3: If Still Not Working
1. Click "Debug Session" to see what tokens are available
2. Check browser console for any error messages
3. Verify Google Cloud Console has Sheets API enabled

## Alternative: Manual Token Management

If the above doesn't work, we can implement a manual token exchange system where users explicitly authorize Sheets access separately from their main login.

## Environment Check

Make sure these are set in your `.env.local`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

These should match the OAuth credentials in your Google Cloud Console.
