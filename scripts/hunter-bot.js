
import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
dotenv.config();

// Also try to load .env.local if .env didn't work or for overrides
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env files");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CONFIG = {
    targetNames: ["Coin"],
    targetSymbols: ["COIN"],
    officialMintAddress: "" 
};

console.log("----------------------------------------");
console.log("   $MoltScout GLOBAL FEED & HUNTER BOT  ");
console.log("----------------------------------------");
console.log("Status: INITIALIZING");
console.log("Mode: RECORDING ALL TOKENS + HUNTING TARGET");
console.log("Connecting to Pump.fun Stream...");

const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.on('open', function open() {
    console.log("Status: CONNECTED");
    console.log("Listening for new launches...");
    
    // Subscribe to new token creation events
    let payload = {
        method: "subscribeNewToken", 
    };
    ws.send(JSON.stringify(payload));
});

ws.on('message', async function message(data) {
    try {
        const token = JSON.parse(data);
        
        if (!token.mint) return;

        const name = token.name || "";
        const symbol = token.symbol || "";
        const mint = token.mint;
        const uri = token.uri || "";
        const marketCap = token.market_cap || 0;

        // 1. SAVE TO FEED (ALL TOKENS)
    // We use a separate table 'stream_feed' to store the history of all tokens
    // NOTE: You must create this table in Supabase first!
    supabase.from('stream_feed').insert({
        mint: mint,
        name: name,
        symbol: symbol,
        image_uri: uri,
        created_at: new Date().toISOString()
    }).then(({ error: feedError }) => {
        if (feedError) {
             // If table doesn't exist, we just log a warning once (or ignore to not spam)
             if (feedError.code === '42P01') { // undefined_table
                 console.warn("WARNING: Table 'stream_feed' does not exist. Only Target Hunting is active.");
             } else {
                 console.error("Feed Insert Error:", feedError.message);
             }
        } else {
            process.stdout.write('.'); // Dot for every saved token
        }
    });

    // 2. CHECK FOR TARGET (TEST MODE: Loose Match)
    const isNameMatch = CONFIG.targetNames.some(n => name.toLowerCase().includes(n.toLowerCase())); 
    const isSymbolMatch = CONFIG.targetSymbols.some(s => symbol.toUpperCase().includes(s)); 
        
        if (isNameMatch || isSymbolMatch) {
            console.log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(`   TARGET DETECTED: ${name} (${symbol}) FOUND!    `);
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(`Mint: ${mint}`);
            console.log("Pushing to 'official_token' table...");

            const { error } = await supabase.from('official_token').insert({
                mint: mint,
                name: name,
                symbol: symbol,
                image_uri: uri,
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error("CRITICAL ERROR: Failed to push target to Supabase!", error);
            } else {
                console.log("SUCCESS: Target locked globally.");
            }
        }

    } catch (e) {
        // console.error("Parse error", e);
    }
});

ws.on('error', function error(err) {
    console.error('WebSocket Error:', err);
});

ws.on('close', function close() {
    console.log('Connection closed. Reconnecting in 5s...');
    setTimeout(() => {
        process.exit(1);
    }, 5000);
});
