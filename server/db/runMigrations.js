const fs = require('fs').promises;
const path = require('path');
const { supabase, executeSql } = require('../utils/supabaseClient');

// Function to read and execute SQL files
async function executeSqlFile(filePath) {
  try {
    console.log(`Executing SQL file: ${filePath}`);
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Execute the SQL query using the utility function
    const result = await executeSql(sql);
    
    if (result && result.error) {
      throw new Error(`Error executing ${path.basename(filePath)}: ${result.error}`);
    }
    
    console.log(`✓ Successfully executed ${path.basename(filePath)}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to execute ${path.basename(filePath)}`);
    console.error(error);
    throw error;
  }
}

// Function to run all migrations in order
async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Define paths to check for SQL files
    const sqlDirectories = [
      path.join(__dirname, '..', 'sql'),
      path.join(__dirname, 'migrations'),
      path.join(__dirname, '..', '..', 'sql')
    ];
    
    // Find the first directory that exists
    let sqlDir = null;
    for (const dir of sqlDirectories) {
      try {
        await fs.access(dir);
        sqlDir = dir;
        console.log(`Found SQL directory: ${dir}`);
        break;
      } catch (err) {
        // Directory doesn't exist, try the next one
      }
    }
    
    if (!sqlDir) {
      throw new Error('Could not find any SQL directory');
    }
    
    // Get all SQL files and sort them alphabetically to ensure correct execution order
    const files = await fs.readdir(sqlDir);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (sqlFiles.length === 0) {
      console.log('No SQL files found to execute.');
      return;
    }
    
    console.log(`Found ${sqlFiles.length} SQL files to execute:`);
    sqlFiles.forEach(file => console.log(`- ${file}`));
    
    // Execute each file in order
    for (const file of sqlFiles) {
      await executeSqlFile(path.join(sqlDir, file));
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations, executeSqlFile };
