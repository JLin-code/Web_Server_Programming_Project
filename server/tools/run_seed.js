require('dotenv').config({ path: '../../.env' });
const fs = require('fs');
const path = require('path');
const { supabase } = require('../models/supabase');

async function runSeedScript() {
  try {
    console.log('Reading SQL seed file...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed_data.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = seedSQL.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement.substring(0, 100) + '...');
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
  }
}

runSeedScript();
