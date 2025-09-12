# Supabase Setup for FormToSheets

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `formtosheets`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API keys > anon/public key

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Disable Email Confirmation

1. In your Supabase dashboard, go to Authentication > Settings
2. Under "User Signups", disable "Enable email confirmations"
3. This allows users to sign up without email verification

## 5. Optional: Set Up Email Templates

If you want to customize the signup experience:

1. Go to Authentication > Email Templates
2. Customize the "Confirm signup" template (though it won't be used)
3. You can also set up "Magic Link" templates for future features

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to your waiting list page
3. Try signing up with a test email
4. Check your Supabase dashboard > Authentication > Users to see the signup

## 7. Database Schema (Optional)

If you want to store additional user data, you can create a `waitlist_users` table:

```sql
CREATE TABLE waitlist_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'waitlist',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own data" ON waitlist_users
  FOR SELECT USING (auth.uid() = id);
```

## Notes

- Users will be created in Supabase Auth without email confirmation
- The temporary password is generated but not used (users can't log in with it)
- This is perfect for a waitlist where you just need email collection
- You can later implement proper authentication when you launch the full product
