-- Create the exec_sql function for database setup
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant usage permission
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;

-- Print success message
DO $$ 
BEGIN 
  RAISE NOTICE 'exec_sql function created successfully. You can now run the setup_db.js script.';
END $$;
