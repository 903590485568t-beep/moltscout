
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDb() {
  console.log("Clearing 'official_token' table...");
  
  const { error } = await supabase
    .from('official_token')
    .delete()
    .neq('id', 0); // Delete all rows (id is likely not 0, or we can use gt 0)

  if (error) {
    console.error("Error clearing official_token:", error);
  } else {
    console.log("SUCCESS: 'official_token' table cleared.");
  }
}

clearDb();
