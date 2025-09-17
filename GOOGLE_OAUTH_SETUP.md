# Google OAuth Setup Guide for FormToSheets

This guide will help you set up Google OAuth authentication for your FormToSheets application.

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give your project a name (e.g., "FormToSheets")
4. Click "Create"

## 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: FormToSheets
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (click "Add or Remove Scopes"):
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users if in testing mode
6. Click "Save and Continue" through all steps

## 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Give it a name (e.g., "FormToSheets Web Client")
5. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://your-domain.com`)
6. Add Authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - Replace `your-supabase-project` with your actual Supabase project reference
7. Click "Create"
8. Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## 5. Configure Supabase Authentication

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" and click to configure it
5. Toggle "Enable sign in with Google" to ON
6. Enter your Google OAuth credentials:
   - **Client ID**: From step 4
   - **Client Secret**: From step 4
7. Click "Save"

## 6. Update Your Environment Variables

Add these to your `.env.local` file (if not already present):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Go to your landing page
3. Click "Sign In with Google" or "Get Started"
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you should be redirected back to your dashboard

## 8. Production Setup

For production deployment:

1. Update your Google OAuth credentials with your production domain
2. Make sure your Supabase project is properly configured
3. Update the redirect URIs to match your production Supabase URL
4. Test the full flow in production

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Console matches your Supabase callback URL exactly
   - Format: `https://your-project-ref.supabase.co/auth/v1/callback`

2. **"This app isn't verified" warning**:
   - This appears during development/testing
   - Click "Advanced" then "Go to FormToSheets (unsafe)" to proceed
   - For production, you'll need to verify your app with Google

3. **Users can't sign in**:
   - Check that the Google+ API is enabled
   - Verify OAuth consent screen is configured
   - Ensure test users are added if in testing mode

4. **Authentication doesn't work locally**:
   - Make sure `http://localhost:3000` is in your authorized origins
   - Check that your environment variables are correct

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- Use different OAuth credentials for development and production
- Regularly review and rotate your credentials
- Monitor your Google Cloud Console for any suspicious activity

## Next Steps

Once Google OAuth is working:
1. Users can sign in and access their dashboard
2. Forms are automatically associated with the authenticated user
3. Users can only see and edit their own forms
4. The waiting list functionality is replaced with proper authentication

Your FormToSheets application now has secure, scalable authentication powered by Google OAuth!

