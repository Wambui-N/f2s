-- Create table to track form views
CREATE TABLE form_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT, -- To track unique sessions
  country TEXT,
  city TEXT
);

-- Enable RLS for form_views
ALTER TABLE form_views ENABLE ROW LEVEL SECURITY;

-- Policy: Form owners can view their form views
CREATE POLICY "Form owners can view form views" ON form_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_views.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: Anyone can insert form views (for tracking public forms)
CREATE POLICY "Anyone can insert form views" ON form_views
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_form_views_form_id ON form_views(form_id);
CREATE INDEX idx_form_views_viewed_at ON form_views(viewed_at);
CREATE INDEX idx_form_views_session_id ON form_views(session_id);

-- Create table to store daily analytics summaries (for better performance)
CREATE TABLE daily_form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, date)
);

-- Enable RLS for daily_form_analytics
ALTER TABLE daily_form_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Form owners can view their analytics
CREATE POLICY "Form owners can view analytics" ON daily_form_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = daily_form_analytics.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: System can insert/update analytics (for automated aggregation)
CREATE POLICY "System can manage analytics" ON daily_form_analytics
  FOR ALL WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_daily_analytics_form_id ON daily_form_analytics(form_id);
CREATE INDEX idx_daily_analytics_date ON daily_form_analytics(date);

-- Create function to get form analytics
CREATE OR REPLACE FUNCTION get_form_analytics(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  form_id UUID,
  form_title TEXT,
  total_views BIGINT,
  total_submissions BIGINT,
  conversion_rate DECIMAL,
  recent_views BIGINT,
  recent_submissions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as form_id,
    f.title as form_title,
    COALESCE(v.total_views, 0) as total_views,
    COALESCE(s.total_submissions, 0) as total_submissions,
    CASE 
      WHEN COALESCE(v.total_views, 0) > 0 
      THEN ROUND((COALESCE(s.total_submissions, 0)::DECIMAL / v.total_views) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    COALESCE(v.recent_views, 0) as recent_views,
    COALESCE(s.recent_submissions, 0) as recent_submissions
  FROM forms f
  LEFT JOIN (
    SELECT 
      fv.form_id,
      COUNT(*) as total_views,
      COUNT(CASE WHEN fv.viewed_at >= NOW() - INTERVAL '%s days' THEN 1 END) as recent_views
    FROM form_views fv
    GROUP BY fv.form_id
  ) v ON f.id = v.form_id
  LEFT JOIN (
    SELECT 
      fs.form_id,
      COUNT(*) as total_submissions,
      COUNT(CASE WHEN fs.submitted_at >= NOW() - INTERVAL '%s days' THEN 1 END) as recent_submissions
    FROM form_submissions fs
    GROUP BY fs.form_id
  ) s ON f.id = s.form_id
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  total_forms BIGINT,
  total_views BIGINT,
  total_submissions BIGINT,
  conversion_rate DECIMAL,
  forms_this_month BIGINT,
  views_this_month BIGINT,
  submissions_this_month BIGINT,
  forms_last_month BIGINT,
  views_last_month BIGINT,
  submissions_last_month BIGINT,
  submissions_this_week BIGINT,
  submissions_last_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM forms WHERE user_id = p_user_id) as total_forms,
    (SELECT COUNT(*) FROM form_views fv 
     JOIN forms f ON f.id = fv.form_id 
     WHERE f.user_id = p_user_id) as total_views,
    (SELECT COUNT(*) FROM form_submissions fs 
     JOIN forms f ON f.id = fs.form_id 
     WHERE f.user_id = p_user_id) as total_submissions,
    CASE 
      WHEN (SELECT COUNT(*) FROM form_views fv 
            JOIN forms f ON f.id = fv.form_id 
            WHERE f.user_id = p_user_id) > 0 
      THEN ROUND(
        (SELECT COUNT(*)::DECIMAL FROM form_submissions fs 
         JOIN forms f ON f.id = fs.form_id 
         WHERE f.user_id = p_user_id) / 
        (SELECT COUNT(*) FROM form_views fv 
         JOIN forms f ON f.id = fv.form_id 
         WHERE f.user_id = p_user_id) * 100, 2
      )
      ELSE 0 
    END as conversion_rate,
    (SELECT COUNT(*) FROM forms 
     WHERE user_id = p_user_id 
     AND created_at >= DATE_TRUNC('month', NOW())) as forms_this_month,
    (SELECT COUNT(*) FROM form_views fv 
     JOIN forms f ON f.id = fv.form_id 
     WHERE f.user_id = p_user_id 
     AND fv.viewed_at >= DATE_TRUNC('month', NOW())) as views_this_month,
    (SELECT COUNT(*) FROM form_submissions fs 
     JOIN forms f ON f.id = fs.form_id 
     WHERE f.user_id = p_user_id 
     AND fs.submitted_at >= DATE_TRUNC('month', NOW())) as submissions_this_month,
    (SELECT COUNT(*) FROM forms 
     WHERE user_id = p_user_id 
     AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
     AND created_at < DATE_TRUNC('month', NOW())) as forms_last_month,
    (SELECT COUNT(*) FROM form_views fv 
     JOIN forms f ON f.id = fv.form_id 
     WHERE f.user_id = p_user_id 
     AND fv.viewed_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
     AND fv.viewed_at < DATE_TRUNC('month', NOW())) as views_last_month,
    (SELECT COUNT(*) FROM form_submissions fs 
     JOIN forms f ON f.id = fs.form_id 
     WHERE f.user_id = p_user_id 
     AND fs.submitted_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
     AND fs.submitted_at < DATE_TRUNC('month', NOW())) as submissions_last_month,
    (SELECT COUNT(*) FROM form_submissions fs 
     JOIN forms f ON f.id = fs.form_id 
     WHERE f.user_id = p_user_id 
     AND fs.submitted_at >= DATE_TRUNC('week', NOW())) as submissions_this_week,
    (SELECT COUNT(*) FROM form_submissions fs 
     JOIN forms f ON f.id = fs.form_id 
     WHERE f.user_id = p_user_id 
     AND fs.submitted_at >= DATE_TRUNC('week', NOW() - INTERVAL '1 week')
     AND fs.submitted_at < DATE_TRUNC('week', NOW())) as submissions_last_week;
END;
$$ LANGUAGE plpgsql;

-- Create function to track form view
CREATE OR REPLACE FUNCTION track_form_view(
  p_form_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  view_id UUID;
BEGIN
  INSERT INTO form_views (form_id, ip_address, user_agent, referrer, session_id)
  VALUES (p_form_id, p_ip_address, p_user_agent, p_referrer, p_session_id)
  RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update daily analytics when submissions are added
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily analytics
  INSERT INTO daily_form_analytics (form_id, date, submissions_count)
  VALUES (NEW.form_id, DATE(NEW.submitted_at), 1)
  ON CONFLICT (form_id, date)
  DO UPDATE SET 
    submissions_count = daily_form_analytics.submissions_count + 1,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for form submissions
CREATE TRIGGER update_analytics_on_submission
  AFTER INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics();

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger for daily_form_analytics
CREATE TRIGGER update_daily_analytics_updated_at 
  BEFORE UPDATE ON daily_form_analytics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
