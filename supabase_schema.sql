-- 1. Create the forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  form_data JSONB NOT NULL
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_forms_user_id ON forms(user_id);

-- Create an index on created_at for ordering
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);

-- 2. Enable Row Level Security (RLS)
-- This ensures that your data is secure and users can only access their own data.
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- These policies ensure users can only access their own forms

-- Policy: Users can view their own forms
CREATE POLICY "Users can view own forms"
ON forms FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own forms
CREATE POLICY "Users can insert own forms"
ON forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own forms
CREATE POLICY "Users can update own forms"
ON forms FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own forms
CREATE POLICY "Users can delete own forms"
ON forms FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create a server-side function to get form submissions (placeholder)
-- This function would be called from your dashboard to get submissions for a form.
-- You would need to create a `submissions` table to store form submissions.
CREATE OR REPLACE FUNCTION get_form_submissions(form_id UUID)
RETURNS JSONB AS $$
DECLARE
  submissions_data JSONB;
BEGIN
  -- This is a placeholder. In a real app, you would query your submissions table.
  -- SELECT jsonb_agg(submission) INTO submissions_data FROM submissions WHERE submissions.form_id = get_form_submissions.form_id;
  
  -- Returning mock data for now
  submissions_data := '[]'::jsonb;
  
  RETURN submissions_data;
END;
$$ LANGUAGE plpgsql;
