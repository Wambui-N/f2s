-- 1. Create the forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft',
  form_data JSONB
);

-- 2. Enable Row Level Security (RLS)
-- This ensures that your data is secure and users can only access their own data.
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- IMPORTANT: For V1, since you don't have user logins for the dashboard,
-- these policies are very permissive. Anyone with the anon key can read/write.
-- You should implement user authentication for the dashboard before going to production.

-- Policy: Allow anyone to view all forms (for now)
CREATE POLICY "Public forms are viewable by everyone."
ON forms FOR SELECT
USING (true);

-- Policy: Allow anyone to insert new forms (for now)
CREATE POLICY "Anyone can create new forms."
ON forms FOR INSERT
WITH CHECK (true);

-- Policy: Allow anyone to update any form (for now)
CREATE POLICY "Anyone can update any form."
ON forms FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Allow anyone to delete any form (for now)
CREATE POLICY "Anyone can delete any form."
ON forms FOR DELETE
USING (true);

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
