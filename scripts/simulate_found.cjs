
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateFound() {
  console.log("Simulating 'Found' token $MOLTSEEK...");

  // Mock data for the "Official" token
  // Matches the schema used in hunter-bot.js
  const mockToken = {
    mint: "MoltseekTestMintAddress123456789", 
    name: "Moltseek",
    symbol: "MOLTSEEK",
    image_uri: "https://pump.mypinata.cloud/ipfs/QmQ2kZg1v5g5j5g5j5g5j5g5j5g5j5g5j5g5j5g5j5g5", 
    created_at: new Date().toISOString()
  };

  // 1. Update official_token table (Trigger for the "Hunting" card)
  // Using upsert on ID 1 ensures we only have one "active" target found
  const { error: officialError } = await supabase
    .from('official_token')
    .upsert([ { id: 1, ...mockToken } ]); 

  if (officialError) {
    console.error("Error updating official_token:", officialError);
  } else {
    console.log("SUCCESS: official_token updated with $MOLTSEEK");
  }

  // 2. Add to stream_feed (Trigger for the History list)
  const { error: feedError } = await supabase
    .from('stream_feed')
    .insert([ mockToken ]);

  if (feedError) {
    console.error("Error inserting into stream_feed:", feedError);
  } else {
    console.log("SUCCESS: Added to stream_feed");
  }
}

simulateFound();
