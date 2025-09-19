-- Create table for form email notification settings
CREATE TABLE form_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}', -- Array of email addresses
  subject_template TEXT DEFAULT 'New submission from {{form_title}}',
  email_template TEXT DEFAULT 'You have received a new form submission.',
  include_submission_data BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id)
);

-- Enable RLS for form_email_settings
ALTER TABLE form_email_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Form owners can manage their email settings
CREATE POLICY "Form owners can manage email settings" ON form_email_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_email_settings.form_id 
      AND forms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_email_settings.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_form_email_settings_form_id ON form_email_settings(form_id);

-- Create table to log sent emails
CREATE TABLE email_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE,
  recipient_emails TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for email_notifications_log
ALTER TABLE email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Policy: Form owners can view their email logs
CREATE POLICY "Form owners can view email logs" ON email_notifications_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = email_notifications_log.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: System can insert email logs
CREATE POLICY "System can insert email logs" ON email_notifications_log
  FOR INSERT WITH CHECK (true);

-- Policy: System can update email logs
CREATE POLICY "System can update email logs" ON email_notifications_log
  FOR UPDATE WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_email_log_form_id ON email_notifications_log(form_id);
CREATE INDEX idx_email_log_submission_id ON email_notifications_log(submission_id);
CREATE INDEX idx_email_log_status ON email_notifications_log(status);
CREATE INDEX idx_email_log_created_at ON email_notifications_log(created_at);

-- Create function to get form email settings with defaults
CREATE OR REPLACE FUNCTION get_form_email_settings(p_form_id UUID)
RETURNS TABLE (
  form_id UUID,
  form_title TEXT,
  form_owner_email TEXT,
  is_enabled BOOLEAN,
  recipient_emails TEXT[],
  subject_template TEXT,
  email_template TEXT,
  include_submission_data BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as form_id,
    f.title as form_title,
    u.email as form_owner_email,
    COALESCE(fes.is_enabled, true) as is_enabled,
    COALESCE(fes.recipient_emails, ARRAY[u.email]) as recipient_emails,
    COALESCE(fes.subject_template, 'New submission from ' || f.title) as subject_template,
    COALESCE(fes.email_template, 'You have received a new form submission from ' || f.title || '.') as email_template,
    COALESCE(fes.include_submission_data, true) as include_submission_data
  FROM forms f
  JOIN auth.users u ON f.user_id = u.id
  LEFT JOIN form_email_settings fes ON f.id = fes.form_id
  WHERE f.id = p_form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to interpolate template variables
CREATE OR REPLACE FUNCTION interpolate_email_template(
  template TEXT,
  form_title TEXT,
  submission_data JSONB
)
RETURNS TEXT AS $$
DECLARE
  result TEXT := template;
  key TEXT;
  value TEXT;
BEGIN
  -- Replace form variables
  result := REPLACE(result, '{{form_title}}', COALESCE(form_title, ''));
  
  -- Replace submission data variables
  FOR key, value IN SELECT * FROM jsonb_each_text(submission_data)
  LOOP
    result := REPLACE(result, '{{' || key || '}}', COALESCE(value, ''));
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically create default email settings for new forms
CREATE OR REPLACE FUNCTION create_default_email_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default email settings for the new form
  INSERT INTO form_email_settings (form_id, recipient_emails)
  VALUES (
    NEW.id,
    ARRAY[(SELECT email FROM auth.users WHERE id = NEW.user_id)]
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new forms
CREATE TRIGGER create_default_email_settings_trigger
  AFTER INSERT ON forms
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_settings();

-- Add updated_at trigger for form_email_settings
CREATE TRIGGER update_form_email_settings_updated_at 
  BEFORE UPDATE ON form_email_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
