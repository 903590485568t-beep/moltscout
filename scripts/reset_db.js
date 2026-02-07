
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
    
    // Delete all rows where mint is not empty (effectively all)
    const { error } = await supabase
        .from('official_token')
        .delete()
        .neq('mint', 'empty_string_check');

    if (error) {
        console.error("Error clearing table:", error);
    } else {
        console.log("SUCCESS: 'official_token' table cleared.");
    }
}

resetOfficialToken();
