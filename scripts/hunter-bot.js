
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

// GLOBAL STATE
let isTargetLocked = false;

// Check if we already have a target in DB
async function checkExistingTarget() {
    const { data, error } = await supabase
        .from('official_token')
        .select('*')
        .limit(1)
        .maybeSingle();

    if (data) {
        console.log(`[STATE] Target already acquired: ${data.name} ($${data.symbol}). Monitoring only.`);
        isTargetLocked = true;
    } else {
        console.log(`[STATE] No target found. HUNTING STARTED for: ${CONFIG.targetSymbols.join(', ')}`);
        isTargetLocked = false;
    }
}

ws.on('open', async function open() {
    console.log("Status: CONNECTED");
    await checkExistingTarget();
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

        // 1. SAVE TO FEED (ALL TOKENS) - FIRE AND FORGET
        supabase.from('stream_feed').insert({
            mint: mint,
            name: name,
            symbol: symbol,
            image_uri: uri,
            created_at: new Date().toISOString()
        }).then(({ error }) => {
            if (error && error.code !== '23505') { // Ignore duplicate key errors
                 // console.error("Feed Error:", error.message);
            } else {
                process.stdout.write('.'); 
            }
        });

        // 2. CHECK FOR TARGET
        if (isTargetLocked) return; // Stop checking if we already have one

        const isNameMatch = CONFIG.targetNames.some(n => name.toLowerCase().includes(n.toLowerCase())); 
        const isSymbolMatch = CONFIG.targetSymbols.some(s => symbol.toUpperCase() === s.toUpperCase()); // Strict Symbol Match
        
        if (isNameMatch || isSymbolMatch) {
            console.log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(`   TARGET DETECTED: ${name} (${symbol})    `);
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            
            // DOUBLE CHECK: Race condition protection
            const { data: existing } = await supabase.from('official_token').select('mint').limit(1).maybeSingle();
            if (existing) {
                console.log("Target was captured by another process. Locking.");
                isTargetLocked = true;
                return;
            }

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
                isTargetLocked = true;
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
