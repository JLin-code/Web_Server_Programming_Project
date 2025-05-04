const fs = require('fs').promises;
const path = require('path');
const { supabase, executeSql } = require('../utils/supabaseClient');

// Function to read SQL file and execute it
async function executeSqlFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sql = await fs.readFile(filePath, 'utf8');
    
    console.log(`Executing SQL file: ${path.basename(filePath)}`);
    const result = await executeSql(sql);
    
    console.log(`✅ Successfully executed ${path.basename(filePath)}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to execute ${path.basename(filePath)}: ${error.message}`);
    throw error;
  }
}

// Main function to execute all SQL files in a directory
async function executeSqlFiles(directory) {
  try {
    // Check if directory exists
    try {
      await fs.access(directory);
    } catch (error) {
      console.error(`❌ Directory not found: ${directory}`);
      process.exit(1);
    }
    
    // Get all SQL files
    const files = await fs.readdir(directory);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute in alphabetical order
    
    if (sqlFiles.length === 0) {
      console.log(`⚠️ No SQL files found in ${directory}`);
      return;
    }
    
    console.log(`Found ${sqlFiles.length} SQL files to execute:`);
    sqlFiles.forEach(file => console.log(`- ${file}`));
    
    // Execute each SQL file
    for (const file of sqlFiles) {
      const filePath = path.join(directory, file);
      await executeSqlFile(filePath);
    }
    
    console.log('✅ All SQL files executed successfully');
  } catch (error) {
    console.error('❌ Failed to execute SQL files:', error);
    process.exit(1);
  }
}

// Check for SQL directories in clean server-only paths
const sqlDirectories = [
  path.join(__dirname, '..', 'sql'),
  path.join(__dirname, '..', 'database', 'migrations'),
  path.join(__dirname, '..', 'database')
];

// If this script is run directly, execute SQL files from command line arguments
if (require.main === module) {
  // Check for directory argument or use default paths
  let directory = process.argv[2];
  
  if (!directory) {
    // Try to find a valid SQL directory
    for (const dir of sqlDirectories) {
      try {
        fs.access(dir);
        directory = dir;
        break;
      } catch (err) {
        // Directory doesn't exist, try next one
      }
    }
    
    // If still no directory found, use default
    if (!directory) {
      directory = path.join(__dirname, '..', 'sql');
    }
  }
  
  console.log(`Executing SQL files from: ${directory}`);
  executeSqlFiles(directory)
    .then(() => {
      console.log('🎉 SQL execution complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 SQL execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  executeSqlFile,
  executeSqlFiles,
  sqlDirectories
};
