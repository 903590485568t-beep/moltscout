
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
dotenv.config();

// Also try to load .env.local
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetOfficialToken() {
    console.log("Clearing 'official_token' table...");
    
    // Instead of deleting (which fails due to RLS), we insert a RESET command
    // This pushes a new "latest" row that the frontend interprets as "Clear Everything"
    const { data, error } = await supabase
        .from('official_token')
        .insert({
            mint: 'RESET',
            name: 'RESET',
            symbol: 'RESET',
            image_uri: '',
            created_at: new Date().toISOString() // Ensure it is the newest
        })
        .select();

    if (error) {
        console.error("Error inserting RESET command:", error);
    } else {
        console.log("SUCCESS: RESET command pushed. Frontend should clear.", data);
    }
}

resetOfficialToken();
