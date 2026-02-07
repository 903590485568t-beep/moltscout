
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking 'official_token' table...");
    const { data, error } = await supabase.from('official_token').select('*');
    
    if (error) {
        console.error("Error reading DB:", error);
    } else {
        console.log("Rows in DB:", data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
