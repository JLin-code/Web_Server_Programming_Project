require('dotenv').config({ path: '../../.env' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin privileges needed for database operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runSeedScript() {
  try {
    console.log('Reading SQL seed file...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed_data.sql'), 'utf8');
    
    // Split the SQL into individual statements based on semicolons
    // But be careful with statements that contain semicolons within strings
    const statements = seedSQL
      .replace(/\n/g, ' ')
      .replace(/\/\*.*?\*\//g, '') // Remove SQL comments
      .replace(/--.*?$/gm, '') // Remove single line comments
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement directly with PostgreSQL query
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement.substring(0, 150) + '...');
        } else {
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError);
        // Continue with next statement rather than stopping completely
      }
    }
    
    console.log('Seed script completed');
    
    // Verify data was inserted correctly
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error verifying users table:', error);
    } else {
      console.log(`Found ${data.length} users in database`);
      if (data.length > 0) {
        console.log('Sample user:', JSON.stringify(data[0], null, 2));
      }
    }
    
  } catch (err) {
    console.error('Error running seed script:', err);
  } finally {
    process.exit(0); // Ensure script exits when done
  }
}

runSeedScript();
