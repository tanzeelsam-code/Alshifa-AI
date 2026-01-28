-- ==========================================================================
-- FILE: supabase/migrations/001_add_edge_function_tables.sql
-- Adds tables for API usage logging and audit logs
-- Replaces filesystem-based logging from /server
-- ==========================================================================

-- API Usage Logs (replaces costMonitoring.js filesystem logging)
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for daily aggregation queries
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint);

-- Audit Logs (replaces filesystem audit.log and errors.log)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'SECURITY')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for level filtering and time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (Edge Functions use service role key)
-- This prevents direct frontend access to these tables
CREATE POLICY "Service role full access on api_usage_logs" ON api_usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs" ON audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================================================
-- HELPER FUNCTIONS FOR STATS
-- ==========================================================================

-- Function to get daily usage stats
CREATE OR REPLACE FUNCTION get_daily_usage_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_requests BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cost DECIMAL,
  avg_cost_per_request DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    COALESCE(SUM(input_tokens), 0)::BIGINT as total_input_tokens,
    COALESCE(SUM(output_tokens), 0)::BIGINT as total_output_tokens,
    COALESCE(SUM(estimated_cost), 0)::DECIMAL as total_cost,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(estimated_cost) / COUNT(*), 0)
      ELSE 0
    END::DECIMAL as avg_cost_per_request
  FROM api_usage_logs
  WHERE DATE(created_at) = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly usage stats
CREATE OR REPLACE FUNCTION get_monthly_usage_stats(target_month TEXT DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'))
RETURNS TABLE (
  month TEXT,
  total_requests BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cost DECIMAL,
  avg_cost_per_request DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    target_month as month,
    COUNT(*)::BIGINT as total_requests,
    COALESCE(SUM(input_tokens), 0)::BIGINT as total_input_tokens,
    COALESCE(SUM(output_tokens), 0)::BIGINT as total_output_tokens,
    COALESCE(SUM(estimated_cost), 0)::DECIMAL as total_cost,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(estimated_cost) / COUNT(*), 0)
      ELSE 0
    END::DECIMAL as avg_cost_per_request
  FROM api_usage_logs
  WHERE to_char(created_at, 'YYYY-MM') = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
