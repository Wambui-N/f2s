# Database Migration Instructions

To enable real analytics data with historical comparisons:

## ⚠️ Error Fix: "relation already exists"
If you got the "relation already exists" error, it means some tables were already created. Use the update migration instead.

## Option 1: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project directory
cd your-project-directory

# Run the update migration (this only updates functions, doesn't recreate tables)
supabase db push
```

## Option 2: Manual SQL Execution - Use the UPDATE Migration
If you got the "relation already exists" error, use the update migration file:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250919000001_update_analytics_functions.sql`
4. Execute the SQL

## Option 3: Fresh Installation
If you're setting up from scratch and haven't run any analytics migrations:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor  
3. Copy and paste the contents of `supabase/migrations/20250919000000_analytics_tracking.sql`
4. Execute the SQL

## What this migration adds:
- `form_views` table to track when people visit forms
- `daily_form_analytics` table for aggregated analytics data
- Database functions for analytics calculations:
  - `get_user_dashboard_stats()` - Gets overall user statistics with historical comparisons
  - `get_form_analytics()` - Gets per-form analytics data
  - `track_form_view()` - Records a form view
- Automatic triggers to update analytics when submissions are added
- **NEW**: Historical data calculations for month-over-month and week-over-week comparisons

## After running the migration:
- The analytics dashboard will show real data instead of mock data
- Form views will be tracked automatically when people visit your published forms
- **Dashboard stats will show real percentage changes** based on actual historical data:
  - "vs last month" comparisons for forms and submissions
  - "vs last week" comparisons for recent activity
  - Real conversion rates and trends

## Dashboard Features Now Working:
✅ Real form counts from database
✅ Actual submission numbers  
✅ Real percentage changes (not mock data)
✅ Historical comparisons (month-over-month, week-over-week)
✅ Form view tracking on public forms
