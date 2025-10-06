-- Create forms table if not exists
CREATE TABLE IF NOT EXISTS forms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    fields jsonb NOT NULL DEFAULT '[]'::jsonb,
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    default_sheet_connection_id uuid REFERENCES sheet_connections(id) ON DELETE SET NULL
);

-- Create submissions table if not exists
CREATE TABLE IF NOT EXISTS submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
    data jsonb NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add sync tracking columns to submissions
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS synced_to_sheet boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_error text;

-- Add sync status index
CREATE INDEX IF NOT EXISTS idx_submissions_synced ON submissions(synced_to_sheet);

-- Add indexes for forms
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Add indexes for submissions (basic)
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for forms
DROP POLICY IF EXISTS "Users can view own forms" ON forms;
DROP POLICY IF EXISTS "Users can insert own forms" ON forms;
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;

-- Create policies for forms
CREATE POLICY "Users can view own forms" ON forms
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forms" ON forms
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON forms
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON forms
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Drop existing policies for submissions
DROP POLICY IF EXISTS "Users can view submissions for owned forms" ON submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;

-- Create policies for submissions
CREATE POLICY "Users can view submissions for owned forms" ON submissions
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = submissions.form_id
        AND forms.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can insert submissions" ON submissions
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Trigger to update forms.updated_at
CREATE OR REPLACE FUNCTION update_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_forms_updated_at();
