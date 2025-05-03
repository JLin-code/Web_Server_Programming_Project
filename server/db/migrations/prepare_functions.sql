-- Create a function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant required permissions
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
