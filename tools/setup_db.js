require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Get Supabase credentials from environment variables with improved fallbacks
const supabaseUrl = process.env.SUPABASE_URL;
// Explicitly prioritize the service_key instead of service_role_key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 
                    process.env.SUPABASE_KEY;

// Add more detailed debugging to see what's happening with environment variables
const envVariables = {
  'SUPABASE_URL': process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing',
  'SUPABASE_KEY': process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing',
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
};

console.log('🛠️  SUPABASE DATABASE SETUP TOOL');
console.log('=============================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);
console.log('\nDetailed Environment Variable Status:');
Object.entries(envVariables).forEach(([key, value]) => console.log(`${key}: ${value}`));

// More reliable key type detection
// Service role keys are much longer than anon keys and typically contain specific patterns
const keyLength = supabaseKey?.length || 0;
const isLikelyServiceRole = keyLength > 150 || 
                           (supabaseKey && (supabaseKey.includes('service_role') || 
                                         supabaseKey.includes('admin') ||
                                         supabaseKey.includes('service-role')));

const keyType = isLikelyServiceRole ? 'service_role' : 'other';
console.log(`\nKey analysis: Length=${keyLength}, Using key type: ${keyType}`);

if (keyType === 'other') {
  console.warn('\n⚠️  WARNING: You appear to be using an anon key, not a service_role key.');
  console.warn('This will likely result in permission errors when executing SQL.');
  console.warn('Please check which environment variable contains your service role key:');
  console.warn('1. Get your service role key from your Supabase dashboard');
  console.warn('2. Add it to your .env file as SUPABASE_SERVICE_KEY=your_service_role_key');
  
  // Try to use service key directly if available
  if (process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n🔄 SUPABASE_SERVICE_KEY is available but wasn\'t detected as service role.');
    console.log('   Will try to use it anyway...');
  }
}

// Check for SQL files
const sqlDir = path.join(__dirname, '..', 'database');
const sqlFiles = [];

if (fs.existsSync(sqlDir)) {
  fs.readdirSync(sqlDir).forEach(file => {
    if (file.endsWith('.sql')) {
      const filePath = path.join(sqlDir, file);
      const stats = fs.statSync(filePath);
      sqlFiles.push({
        name: file,
        path: filePath,
        size: stats.size
      });
    }
  });
}

// Also check for seed_data.sql in the root directory
const rootSqlPath = path.join(__dirname, '..', 'seed_data.sql');
if (fs.existsSync(rootSqlPath)) {
  const stats = fs.statSync(rootSqlPath);
  sqlFiles.push({
    name: 'seed_data.sql',
    path: rootSqlPath,
    size: stats.size
  });
}

console.log('\n📂 SQL File Check:');
if (sqlFiles.length === 0) {
  console.log('❌ No SQL files found in the database directory or root directory.');
} else {
  sqlFiles.forEach(file => {
    console.log(`✅ Found SQL file: ${file.name}`);
    console.log(`   Size: ${file.size} bytes`);
  });
}

// Function to execute SQL
async function executeSql(sqlContent) {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Cannot execute SQL.');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test SQL capabilities by running a simple query first
    console.log('\n🔄 Testing SQL execution capabilities...');
    
    // Instead of querying pg_catalog directly, try to use a simple query
    const { data: testData, error: testError } = await supabase
      .from('pg_tables')  // Without the public.pg_catalog prefix
      .select('tablename')
      .limit(1)
      .maybeSingle();
    
    if (testError) {
      console.log(`Note: Simple test query failed: ${testError.message}`);
      console.log('Trying alternative approach...');
      
      // Try using RPC to call our test function if it exists
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('test_connection');
        
      if (rpcError) {
        console.log(`Note: RPC test failed: ${rpcError.message}`);
        console.log('Creating SQL execution function...');
        
        // Try to create the exec_sql function directly with SQL
        try {
          const createFuncSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT) 
          RETURNS VOID AS $$
          BEGIN
            EXECUTE sql_string;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
          `;
          
          const { error: sqlError } = await supabase.sql(createFuncSql);
          if (sqlError) {
            console.error(`❌ Could not create exec_sql function: ${sqlError.message}`);
          } else {
            console.log('✅ Created exec_sql function directly');
          }
        } catch (directErr) {
          console.error(`❌ SQL execution error: ${directErr.message}`);
          console.error('Make sure you are using the service_role key with SQL permissions.');
          return false;
        }
      } else {
        console.log('✅ RPC test successful');
      }
    } else {
      console.log('✅ SQL test query successful');
    }
    
    // Now try with direct SQL execution
    console.log('\n🔄 Executing SQL content...');
    
    // Split SQL into separate statements (simple approach)
    const statements = sqlContent
      .replace(/\r\n/g, '\n')
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
      
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i+1}/${statements.length}...`);
      
      try {
        // Try direct SQL execution if available
        const { error: directError } = await supabase.sql(stmt);
        if (directError) {
          // Fall back to RPC
          const { error: rpcError } = await supabase.rpc('exec_sql', { sql_string: stmt });
          
          if (rpcError) {
            console.error(`❌ Failed to execute SQL statement: ${rpcError.message}`);
            return false;
          }
        }
      } catch (err) {
        // Try using exec_sql RPC function as fallback
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_string: stmt });
          if (error) {
            console.error(`❌ Failed to execute SQL statement: ${error.message}`);
            return false;
          }
        } catch (rpcErr) {
          console.error(`❌ Failed to execute SQL: ${rpcErr.message}`);
          return false;
        }
      }
    }
    
    console.log('✅ SQL executed successfully');
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction(supabase) {
  const createFunctionSql = `
  CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT) 
  RETURNS VOID AS $$
  BEGIN
    EXECUTE sql_string;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    const { error } = await supabase.rpc('unsafe_raw_sql', { 
      sql: createFunctionSql 
    });
    
    if (error) {
      if (error.message.includes('function "unsafe_raw_sql" does not exist')) {
        // Try creating the unsafe_raw_sql function first
        const { error: setupError } = await supabase.from('_setup').select('*').limit(1);
        
        if (setupError) {
          console.error(`❌ Cannot create helper functions: ${setupError.message}`);
          console.error('Please make sure you are using the service_role key.');
          return false;
        }
      } else {
        console.error(`❌ Error creating exec_sql function: ${error.message}`);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  }
}

// Main function
async function run() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing required Supabase environment variables.');
    console.error('Please make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
    process.exit(1);
  }
  
  if (sqlFiles.length === 0) {
    console.error('\n❌ No SQL files found. Please create SQL files in the database directory.');
    process.exit(1);
  }
  
  console.log('\n⚠️  WARNING: This will reset your database and all existing data will be lost.');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Press Y to continue or any other key to cancel... ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('\n❌ Operation cancelled by user.');
      rl.close();
      process.exit(0);
    }
    
    rl.close();
    
    // Execute all SQL files in order
    for (const file of sqlFiles) {
      console.log(`\n🔄 Processing ${file.name}...`);
      
      try {
        const sqlContent = fs.readFileSync(file.path, 'utf8');
        const success = await executeSql(sqlContent);
        
        if (!success) {
          console.error(`\n❌ Failed to execute ${file.name}`);
          process.exit(1);
        }
        
        console.log(`✅ Successfully executed ${file.name}`);
      } catch (err) {
        console.error(`\n❌ Error reading ${file.name}: ${err.message}`);
        process.exit(1);
      }
    }
    
    console.log('\n✅ Database setup completed successfully!');
  });
}

// Run the setup
run();
