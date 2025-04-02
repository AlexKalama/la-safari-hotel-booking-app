// Run this script to add guest_phone column to the bookings table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function alterTable() {
  try {
    // First check if column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('bookings')
      .select('guest_phone')
      .limit(1);

    if (columnsError && columnsError.message.includes('column "guest_phone" does not exist')) {
      console.log('The guest_phone column does not exist. Adding it now...');
      
      // Execute the SQL to add the column
      const { error } = await supabase.rpc('run_sql_query', {
        query: 'ALTER TABLE public.bookings ADD COLUMN guest_phone character varying;'
      });
      
      if (error) {
        console.error('Error adding guest_phone column:', error);
        return;
      }
      
      console.log('Successfully added guest_phone column to bookings table!');
    } else {
      console.log('The guest_phone column already exists. No changes needed.');
    }
  } catch (error) {
    console.error('Error altering table:', error);
  }
}

alterTable();
