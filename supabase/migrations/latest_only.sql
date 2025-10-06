-- Drop the existing function first
DROP FUNCTION IF EXISTS get_user_dashboard_stats(uuid);

-- Recreate the function with correct column references
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id uuid)
RETURNS TABLE (
    total_forms bigint,
    total_views bigint,
    total_submissions bigint,
    forms_this_month bigint,
    forms_last_month bigint,
    views_this_month bigint,
    submissions_this_month bigint,
    submissions_last_month bigint,
    submissions_this_week bigint,
    submissions_last_week bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH form_stats AS (
        SELECT
            COUNT(DISTINCT f.id) as total_forms,
            COUNT(DISTINCT CASE WHEN f.created_at >= DATE_TRUNC('month', NOW()) THEN f.id END) as forms_this_month,
            COUNT(DISTINCT CASE WHEN f.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                               AND f.created_at < DATE_TRUNC('month', NOW()) THEN f.id END) as forms_last_month,
            COUNT(DISTINCT fv.id) as total_views,
            COUNT(DISTINCT CASE WHEN fv.created_at >= DATE_TRUNC('month', NOW()) THEN fv.id END) as views_this_month,
            COUNT(DISTINCT fs.id) as total_submissions,
            COUNT(DISTINCT CASE WHEN fs.created_at >= DATE_TRUNC('month', NOW()) THEN fs.id END) as submissions_this_month,
            COUNT(DISTINCT CASE WHEN fs.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                               AND fs.created_at < DATE_TRUNC('month', NOW()) THEN fs.id END) as submissions_last_month,
            COUNT(DISTINCT CASE WHEN fs.created_at >= DATE_TRUNC('week', NOW()) THEN fs.id END) as submissions_this_week,
            COUNT(DISTINCT CASE WHEN fs.created_at >= DATE_TRUNC('week', NOW() - INTERVAL '1 week')
                               AND fs.created_at < DATE_TRUNC('week', NOW()) THEN fs.id END) as submissions_last_week
        FROM forms f
        LEFT JOIN form_views fv ON f.id = fv.form_id
        LEFT JOIN form_submissions fs ON f.id = fs.form_id
        WHERE f.user_id = p_user_id
    )
    SELECT * FROM form_stats;
END;
$$ LANGUAGE plpgsql;