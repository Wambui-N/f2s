-- Google Sheets Integration Schema

-- 1. Create sheet_connections table
CREATE TABLE sheet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  sheet_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_sheet_connections_user_id ON sheet_connections(user_id);
CREATE INDEX idx_sheet_connections_sheet_id ON sheet_connections(sheet_id);
CREATE UNIQUE INDEX idx_sheet_connections_user_sheet ON sheet_connections(user_id, sheet_id);

-- 2. Create form_submissions table for tracking
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_connection_id UUID REFERENCES sheet_connections(id) ON DELETE SET NULL,
  submission_data JSONB NOT NULL,
  sheet_row_number INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_sheet BOOLEAN DEFAULT false,
  sync_error TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ
);

-- Create indexes for submissions
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX idx_form_submissions_sheet_connection ON form_submissions(sheet_connection_id);
CREATE INDEX idx_form_submissions_synced ON form_submissions(synced_to_sheet);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at DESC);

-- 3. Enable RLS on both tables
ALTER TABLE sheet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for sheet_connections
CREATE POLICY "Users can view own sheet connections"
ON sheet_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sheet connections"
ON sheet_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sheet connections"
ON sheet_connections FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sheet connections"
ON sheet_connections FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create RLS policies for form_submissions
CREATE POLICY "Users can view own form submissions"
ON form_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own form submissions"
ON form_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own form submissions"
ON form_submissions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Add sheet_connection_id to forms table (optional - for default sheet per form)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE forms ADD COLUMN default_sheet_connection_id UUID REFERENCES sheet_connections(id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_column THEN 
            NULL;
    END;
END $$;

-- 7. Create a function to clean up old failed submissions (optional)
CREATE OR REPLACE FUNCTION cleanup_failed_submissions()
RETURNS void AS $$
BEGIN
  -- Delete submissions that failed to sync after 7 days and 5+ retries
  DELETE FROM form_submissions 
  WHERE synced_to_sheet = false 
    AND retry_count >= 5 
    AND submitted_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to get form submission stats
CREATE OR REPLACE FUNCTION get_form_submission_stats(form_uuid UUID)
RETURNS TABLE(
  total_submissions BIGINT,
  synced_submissions BIGINT,
  failed_submissions BIGINT,
  recent_submissions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE synced_to_sheet = true) as synced_submissions,
    COUNT(*) FILTER (WHERE synced_to_sheet = false AND retry_count >= 3) as failed_submissions,
    COUNT(*) FILTER (WHERE submitted_at > NOW() - INTERVAL '24 hours') as recent_submissions
  FROM form_submissions 
  WHERE form_id = form_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
