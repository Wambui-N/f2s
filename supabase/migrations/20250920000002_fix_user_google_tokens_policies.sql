-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON user_google_tokens;

-- Recreate policies with proper syntax
CREATE POLICY "Users can view own tokens"
ON user_google_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
ON user_google_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
ON user_google_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
ON user_google_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON user_google_tokens TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Ensure the table has the correct structure
ALTER TABLE user_google_tokens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_google_tokens ALTER COLUMN access_token SET NOT NULL;
ALTER TABLE user_google_tokens ALTER COLUMN refresh_token SET NOT NULL;

-- Add default value for expires_at if missing
ALTER TABLE user_google_tokens 
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '1 hour');

-- Ensure RLS is enabled
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;
