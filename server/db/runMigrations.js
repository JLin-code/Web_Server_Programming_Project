const fs = require('fs').promises;
const path = require('path');
const { supabase } = require('../config/supabase');

// Function to read and execute SQL files
async function executeSqlFile(filePath) {
  try {
    console.log(`Executing SQL file: ${filePath}`);
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Execute the SQL query using the REST API approach
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw new Error(`Error executing ${path.basename(filePath)}: ${error.message}`);
    }
    
    console.log(`✓ Successfully executed ${path.basename(filePath)}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to execute ${path.basename(filePath)}`);
    console.error(error);
    throw error;
  }
}

// Function to run all migrations in order
async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Sort files to ensure correct execution order
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of sqlFiles) {
      await executeSqlFile(path.join(migrationsDir, file));
    }
    
    console.log('✅ All migrations executed successfully');
  } catch (error) {
    console.error('❌ Migration process failed');
    console.error(error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations, executeSqlFile };
