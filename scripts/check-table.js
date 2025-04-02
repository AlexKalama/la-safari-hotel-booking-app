// Script to check Supabase room table structure and permissions
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with admin role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRoomsTable() {
  console.log('Checking rooms table structure and permissions...');
  
  // Try to get table definition
  try {
    console.log('1. Testing table existence and structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error querying rooms table:', tableError);
    } else {
      console.log('✅ Successfully queried rooms table');
      console.log('Table exists and is accessible');
    }
    
    // Try to insert a test record
    console.log('\n2. Testing insert permissions...');
    const testRoom = {
      name: 'Test Room ' + new Date().toISOString(),
      description: 'This is a test room created to check permissions',
      price: 100,
      capacity: 2,
      image_url: '/images/room-placeholder.jpg',
      amenities: JSON.stringify(['Test Amenity'])
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('rooms')
      .insert([testRoom])
      .select();
    
    if (insertError) {
      console.error('Error inserting test room:', insertError);
      console.log('⚠️ This suggests an issue with insert permissions or table structure');
    } else {
      console.log('✅ Successfully inserted test room:', insertData);
      
      // Clean up the test record
      if (insertData && insertData[0] && insertData[0].id) {
        const { error: deleteError } = await supabase
          .from('rooms')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('Error deleting test room:', deleteError);
        } else {
          console.log('✅ Successfully deleted test room');
        }
      }
    }
    
    // Check table structure
    console.log('\n3. Examining table columns...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'rooms' });
    
    if (columnsError) {
      console.error('Error getting table columns:', columnsError);
      console.log('ℹ️ You might need to create an RPC function for this. Skipping column check.');
    } else {
      console.log('Table columns:', columns);
    }
    
    // Check RLS policies
    console.log('\n4. Checking RLS policies (if you have the proper permissions)...');
    // Note: This is an admin-only operation and may not work in all setups
    
  } catch (error) {
    console.error('Unexpected error during table check:', error);
  }
}

checkRoomsTable();
