-- Update analytics functions to include historical data
-- This migration only updates existing functions and doesn't recreate tables

-- Drop the existing function first, then recreate with new return type
DROP FUNCTION IF EXISTS get_user_dashboard_stats(UUID);

-- Create the get_user_dashboard_stats function with historical comparisons
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

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add the trigger for daily_form_analytics if it doesn't exist
DO $$ 
BEGIN
    -- Check if trigger exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_daily_analytics_updated_at' 
        AND tgrelid = 'daily_form_analytics'::regclass
    ) THEN
        CREATE TRIGGER update_daily_analytics_updated_at 
          BEFORE UPDATE ON daily_form_analytics 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
