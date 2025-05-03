require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

// Print environment status
console.log('\n📋 Environment Variables:');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);

// Check key type (service role or anon)
const keyType = supabaseKey?.includes('service_role') ? 'service_role' : 
                (supabaseKey?.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9') ? 'likely service_role' : 'other');
console.log(`Using key type: ${keyType}`);

if (keyType === 'other') {
  console.warn('\n⚠️  WARNING: You appear to be using an anon key, not a service_role key.');
  console.warn('This will likely result in permission errors when executing SQL.');
  console.warn('Please make sure SUPABASE_SERVICE_KEY is set in your environment.');
}

// Process command line arguments
const args = process.argv.slice(2);
let customSqlPath = null;
let sqlFiles = [];

// Parse command-line arguments
args.forEach(arg => {
  if (arg.startsWith('--path=')) {
    customSqlPath = arg.substring(7);
    console.log(`🔍 Using custom SQL path: ${customSqlPath}`);
  }
});

// Define paths to check for SQL files
const sqlPaths = [
  path.join(__dirname, '..', 'sql'),
  path.join(__dirname, '..', 'database'),
  path.join(__dirname, '..', 'server', 'sql')
];

// Add custom path if provided
if (customSqlPath) {
  sqlPaths.push(customSqlPath);
}

// Find SQL files in all locations
for (const sqlDir of sqlPaths) {
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
}

// Remove duplicates based on file path
if (sqlFiles.length > 0) {
  const uniqueFiles = [];
  const paths = new Set();
  
  sqlFiles.forEach(file => {
    if (!paths.has(file.path)) {
      paths.add(file.path);
      uniqueFiles.push(file);
    }
  });
  
  sqlFiles = uniqueFiles;
}

console.log('\n📂 SQL File Check:');
if (sqlFiles.length === 0) {
  console.error('\n❌ No SQL files found. Please create SQL files in the sql directory.');
  console.error('Or run the script with --path=/path/to/your/sql/files');
  process.exit(1);
} else {
  sqlFiles.forEach(file => {
    console.log(`✅ Found SQL file: ${file.name}`);
    console.log(`   Size: ${file.size} bytes`);
    console.log(`   Path: ${file.path}`);
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
    
    // Test SQL capabilities first with a simpler query
    console.log('\n🔄 Testing SQL execution capabilities...');
    
    // Try a simpler query that doesn't reference pg_catalog directly
    const { data: testData, error: testError } = await supabase
      .from('pg_tables')  // Without the public schema prefix
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log(`Note: Simple table query failed: ${testError.message}`);
      
      // Try to create the exec_sql function if it doesn't exist
      console.log('Creating SQL execution function...');
      
      // Try direct SQL execution for creating the function
      try {
        const { error: sqlError } = await supabase.sql(`
          CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT) 
          RETURNS VOID AS $$
          BEGIN
            EXECUTE sql_string;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        
        if (sqlError) {
          console.error(`❌ SQL execution failed: ${sqlError.message}`);
        } else {
          console.log('✅ Created exec_sql function');
        }
      } catch (sqlErr) {
        console.error(`❌ Could not create SQL function: ${sqlErr.message}`);
        console.error('Please make sure you are using the service_role key.');
        return false;
      }
    } else {
      console.log('✅ SQL capabilities confirmed');
    }
    
    // Now try with SQL execution
    console.log('\n🔄 Executing SQL content...');
    
    // Split SQL into separate statements
    const statements = sqlContent
      .replace(/\r\n/g, '\n')
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
      
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement with multiple fallback approaches
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i+1}/${statements.length}...`);
      
      let executed = false;
      
      // Method 1: Try direct SQL execution
      try {
        const { error } = await supabase.sql(stmt);
        if (!error) {
          executed = true;
        }
      } catch (err) {
        // Direct execution not supported
      }
      
      // Method 2: Try using exec_sql function if Method 1 failed
      if (!executed) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_string: stmt });
          if (error) {
            console.error(`❌ Failed to execute SQL statement: ${error.message}`);
            return false;
          }
          executed = true;
        } catch (rpcErr) {
          console.error(`❌ RPC execution error: ${rpcErr.message}`);
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

// Main function
async function run() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing required Supabase environment variables.');
    console.error('Please make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
    process.exit(1);
  }
  
  if (sqlFiles.length === 0) {
    console.error('\n❌ No SQL files found. Please create SQL files in the sql directory.');
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
