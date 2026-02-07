
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing .env credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("1. Testing Supabase Connection...");
    const { data, error } = await supabase.from('official_token').select('*').limit(1);

    if (error) {
        console.error("❌ Read Error:", error);
    } else {
        console.log("✅ Read Success. Data:", data);
    }

    console.log("2. Testing Write Permission (Mock Insert)...");
    const { error: writeError } = await supabase.from('official_token').upsert({
        id: 1,
        mint: "TEST_MINT_" + Date.now(),
        name: "Test Coin",
        symbol: "TEST",
        image_uri: "",
        created_at: new Date().toISOString()
    });

    if (writeError) {
        console.error("❌ Write Error:", writeError);
    } else {
        console.log("✅ Write Success.");
    }

    console.log("3. Testing Realtime Subscription...");
    const channel = supabase.channel('test_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'official_token' }, (payload) => {
            console.log("✅ Realtime Event Received:", payload.new);
            process.exit(0);
        })
        .subscribe((status) => {
            console.log("   Subscription Status:", status);
            if (status === 'SUBSCRIBED') {
                console.log("   Waiting for event...");
                // Trigger an update to test the listener
                setTimeout(async () => {
                    await supabase.from('official_token').upsert({
                         id: 1,
                         mint: "TEST_REALTIME_" + Date.now(),
                         name: "Realtime Coin",
                         symbol: "REAL",
                         image_uri: "",
                         created_at: new Date().toISOString()
                    });
                }, 2000);
            }
        });
        
    // Timeout after 10 seconds
    setTimeout(() => {
        console.log("⚠️ Realtime Test Timed Out (Check Browser Console for similar errors)");
        process.exit(1);
    }, 10000);
}

testConnection();
