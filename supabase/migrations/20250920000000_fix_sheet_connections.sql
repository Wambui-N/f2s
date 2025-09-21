-- Add foreign key constraint for user_id if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'sheet_connections_user_id_fkey'
    ) THEN
        ALTER TABLE sheet_connections
        ADD CONSTRAINT sheet_connections_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add unique constraint for sheet_id per user if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'sheet_connections_user_id_sheet_id_key'
    ) THEN
        ALTER TABLE sheet_connections
        ADD CONSTRAINT sheet_connections_user_id_sheet_id_key
        UNIQUE (user_id, sheet_id);
    END IF;
END $$;

-- Add index on user_id if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_sheet_connections_user_id'
    ) THEN
        CREATE INDEX idx_sheet_connections_user_id ON sheet_connections(user_id);
    END IF;
END $$;

-- Add index on is_active if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_sheet_connections_is_active'
    ) THEN
        CREATE INDEX idx_sheet_connections_is_active ON sheet_connections(is_active);
    END IF;
END $$;

-- Enable Row Level Security if not enabled
ALTER TABLE sheet_connections ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Users can view own connections" ON sheet_connections;
CREATE POLICY "Users can view own connections" ON sheet_connections
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own connections" ON sheet_connections;
CREATE POLICY "Users can insert own connections" ON sheet_connections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own connections" ON sheet_connections;
CREATE POLICY "Users can update own connections" ON sheet_connections
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own connections" ON sheet_connections;
CREATE POLICY "Users can delete own connections" ON sheet_connections
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Set default for is_active if not set
ALTER TABLE sheet_connections 
ALTER COLUMN is_active SET DEFAULT true;
