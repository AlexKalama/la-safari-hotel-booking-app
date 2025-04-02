// Insert packages sample script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uknogewfmzdlquydukpp.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // You should fill this

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample packages to insert
const packages = [
  {
    name: 'Bed & Breakfast',
    description: 'Start your day with our delicious breakfast buffet featuring fresh local ingredients and international favorites.',
    price_addon: 1000.00
  },
  {
    name: 'Half Board',
    description: 'Enjoy breakfast and dinner at our restaurant, allowing you to explore the local area during the day.',
    price_addon: 2500.00
  },
  {
    name: 'All Inclusive',
    description: 'Experience complete relaxation with all meals, snacks, and select beverages included throughout your stay.',
    price_addon: 4000.00
  },
  {
    name: 'Honeymoon Package',
    description: 'Celebrate your special occasion with champagne on arrival, romantic dinner, and spa treatment for two.',
    price_addon: 6000.00
  },
  {
    name: 'Business Package',
    description: 'Stay productive with high-speed WiFi, access to our business center, and complimentary breakfast.',
    price_addon: 2000.00
  }
];

// Insert packages into the database
async function insertPackages() {
  console.log('Inserting packages...');
  
  const { data, error } = await supabase
    .from('packages')
    .insert(packages)
    .select();
  
  if (error) {
    console.error('Error inserting packages:', error);
    return;
  }
  
  console.log('Successfully inserted packages:', data);
}

// Check if packages already exist
async function checkExistingPackages() {
  const { data, error } = await supabase
    .from('packages')
    .select('count')
    .single();
  
  if (error) {
    console.error('Error checking existing packages:', error);
    return false;
  }
  
  return data.count > 0;
}

// Main function
async function main() {
  const hasPackages = await checkExistingPackages();
  
  if (hasPackages) {
    console.log('Packages already exist in the database. Skipping insertion.');
    return;
  }
  
  await insertPackages();
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('Script completed');
    process.exit(0);
  });
