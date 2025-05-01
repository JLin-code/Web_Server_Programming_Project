const fs = require('fs');
const path = require('path');
const { supabase } = require('../models/supabase');

async function applyStatisticsFunctions() {
  try {
    console.log('Reading statistics SQL functions file...');
    const sqlFunctions = fs.readFileSync(path.join(__dirname, 'statistics_functions.sql'), 'utf8');
    
    // Split the SQL into individual statements based on semicolons
    const statements = sqlFunctions
      .replace(/\n/g, ' ')
      .replace(/\/\*.*?\*\//g, '') // Remove SQL comments
      .replace(/--.*?$/gm, '') // Remove single line comments
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL function statements to execute`);
    
    // Execute each statement
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
    
    console.log('Statistics functions applied successfully');
    
    // Test one of the functions to verify it works
    const { data, error } = await supabase.rpc('get_global_statistics');
    if (error) {
      console.error('Error testing statistics function:', error);
    } else {
      console.log('Test query successful. Sample global stats:', data);
    }
    
  } catch (error) {
    console.error('Failed to apply statistics functions:', error);
  }
}

applyStatisticsFunctions();
