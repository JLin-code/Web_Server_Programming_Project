-- Setup functions for database migration
-- This file should be executed first to create functions needed for SQL execution

-- Create exec_sql function for database management
-- This avoids the issue with "relation public.pg_catalog.pg_tables does not exist"
CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT) 
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create unsafe_raw_sql function (used by setup scripts)
CREATE OR REPLACE FUNCTION unsafe_raw_sql(sql TEXT) 
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
DO $$
BEGIN
  -- Grant permissions to roles that might be used (will silently fail if role doesn't exist)
  EXECUTE 'GRANT EXECUTE ON FUNCTION exec_sql TO service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION unsafe_raw_sql TO service_role';
EXCEPTION
  WHEN OTHERS THEN
    -- Just log the error but continue
    RAISE NOTICE 'Permission grant error (this is usually OK): %', SQLERRM;
END $$;

-- Simple test function to verify connection
CREATE OR REPLACE FUNCTION test_connection() 
RETURNS TEXT AS $$
BEGIN
  RETURN 'Connection successful';
END;
$$ LANGUAGE plpgsql;

-- Verify we can query basic system tables without schema issues
CREATE OR REPLACE FUNCTION list_tables() 
RETURNS TABLE (table_name TEXT) AS $$
BEGIN
  -- Use proper schema reference 
  RETURN QUERY SELECT tablename::TEXT FROM pg_catalog.pg_tables WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;
