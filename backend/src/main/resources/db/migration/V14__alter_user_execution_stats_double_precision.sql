-- Fix column types in user_execution_stats to DOUBLE PRECISION to match Hibernate entity double mapping
ALTER TABLE user_execution_stats
    ALTER COLUMN rolling_7d_completion_rate TYPE DOUBLE PRECISION,
    ALTER COLUMN rolling_7d_avg_daily_focus_minutes TYPE DOUBLE PRECISION;
