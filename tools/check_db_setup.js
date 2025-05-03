const fs = require('fs');
const path = require('path');

console.log('🔍 Database Setup Diagnostic Tool');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Found' : '❌ Missing'}\n`);

// Check possible SQL file directories
const possibleDirs = [
  { name: 'database directory', path: path.join(__dirname, '..', 'database') },
  { name: 'server/tools directory', path: path.join(__dirname, '..', 'server', 'tools') },
  { name: 'tools directory', path: path.join(__dirname, '..', 'tools') },
  { name: 'root directory', path: path.join(__dirname, '..') }
];

console.log('📂 SQL File Locations:');
let totalSqlFiles = 0;

possibleDirs.forEach(dir => {
  try {
    if (fs.existsSync(dir.path)) {
      const files = fs.readdirSync(dir.path).filter(file => file.endsWith('.sql'));
      console.log(`${dir.name}: ${files.length > 0 ? '✅ ' + files.length + ' SQL files found' : '❌ No SQL files'}`);
      if (files.length > 0) {
        files.forEach(file => {
          const fullPath = path.join(dir.path, file);
          const stats = fs.statSync(fullPath);
          console.log(`   - ${file} (${stats.size} bytes) at ${fullPath}`);
        });
        totalSqlFiles += files.length;
      }
    } else {
      console.log(`${dir.name}: ❌ Directory does not exist`);
    }
  } catch (error) {
    console.log(`${dir.name}: ❌ Error: ${error.message}`);
  }
});

console.log(`\nTotal SQL files found: ${totalSqlFiles}`);

// Suggest next steps
console.log('\n📝 Recommendations:');
if (totalSqlFiles === 0) {
  console.log('❌ No SQL files were found in any of the expected directories.');
  console.log('   - Check that your SQL files have the .sql extension');
  console.log('   - Create a "database" directory in the project root and place SQL files there');
} else {
  console.log('✅ SQL files were found. Make sure the setup scripts are looking in these locations.');
  console.log('   The current db_setup.js script may be looking for SQL files in the wrong location.');
}

console.log('\n💡 Try running: node tools/db_setup.js --path=<path_to_sql_file>');
