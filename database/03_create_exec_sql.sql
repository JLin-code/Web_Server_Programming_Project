-- Create SQL execution function
-- This function allows executing SQL statements from the API

-- Create exec_sql function for database management
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
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
GRANT EXECUTE ON FUNCTION unsafe_raw_sql TO service_role;
