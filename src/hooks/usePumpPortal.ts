import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendGroup, analyzeTrends, Token } from '../data/mockData';
import { getIpfsUrl, fetchIpfsJson } from '../lib/utils';
import { CLAW_SCOUT_CONFIG } from '../clawConfig';

const WS_URL = 'wss://pumpportal.fun/api/data';



interface PumpPortalTrade {
  signature: string;
  mint: string;
  taderPublicKey: string;
  txType: 'buy' | 'sell' | 'trade';
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  solAmount: number;
}

interface PumpPortalToken {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  marketCapSol: number;
  vSolInBondingCurve: number;
  txType: 'create';
}

// Helper to preload image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) {
        resolve();
        return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't block forever
  });
};

export const usePumpPortal = (searchTerm: string = '') => {
  const [groups, setGroups] = useState<TrendGroup[]>(analyzeTrends());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalProcessed: 0 });
  const [solPrice, setSolPrice] = useState(200); // Default 200 to show USD immediately
  const [clawToken, setClawToken] = useState<Token | null>(null);
  const clawTokenRef = useRef<Token | null>(null);
  const solPriceRef = useRef(200);
  const ws = useRef<WebSocket | null>(null);

  // Load ClawToken from LocalStorage on mount
  useEffect(() => {
    try {
        const stored = localStorage.getItem('claw_token_data');
        if (stored) {
            const token = JSON.parse(stored);
            
            // Validation: If we have an official config, ensure the stored token matches
            if (CLAW_SCOUT_CONFIG.officialMintAddress && token.id !== CLAW_SCOUT_CONFIG.officialMintAddress) {
                console.log("Stored ClawToken mismatch with official config. Clearing.");
                localStorage.removeItem('claw_token_data');
                return;
            }

            // HUNTING MODE CHECK:
            // If official address is NOT set, and we are in hunting mode, CLEAR EVERYTHING to be safe.
            if (!CLAW_SCOUT_CONFIG.officialMintAddress) {
                 console.log("Hunting Mode Active: Clearing cached token.");
                 localStorage.removeItem('claw_token_data');
                 return;
            }

            setClawToken(token);
            clawTokenRef.current = token;
        } 
        /* 
        // DISABLED FOR HUNTING TEST
        else if (import.meta.env.DEV) {
            // PREVIEW MODE: Use Test Token
            setClawToken(TEST_TOKEN);
            clawTokenRef.current = TEST_TOKEN;
        }
        */
    } catch (e) {
        console.error("Failed to load stored token", e);
    }
  }, []);

  // Save ClawToken to LocalStorage whenever it updates
  useEffect(() => {
    if (clawToken) {
        // Force the override image if it's not set
        if (CLAW_SCOUT_CONFIG.image && clawToken.imageUrl !== CLAW_SCOUT_CONFIG.image) {
            setClawToken(prev => prev ? ({ ...prev, imageUrl: CLAW_SCOUT_CONFIG.image! }) : null);
            return;
        }
        localStorage.setItem('claw_token_data', JSON.stringify(clawToken));
    }
  }, [clawToken]);

  // Fetch SOL Price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
        const data = await response.json();
        const price = data?.data?.['So11111111111111111111111111111111111111112']?.price;
        if (price) {
          const p = parseFloat(price);
          setSolPrice(p);
          solPriceRef.current = p;
        }
      } catch (error) {
        console.error('Failed to fetch SOL price:', error);
      }
    };

    fetchSolPrice();
    // Refresh every minute
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Cache to prevent duplicate processing
  const processedMints = useRef<Set<string>>(new Set());
  // Buffer for trade updates to prevent excessive re-renders
  const tradeBuffer = useRef<PumpPortalTrade[]>([]);

  // Helper to check keywords
  const hasKeyword = useCallback((text: string, keywords: string[]) => keywords.some(k => text.includes(k)), []);

  const classifyToken = useCallback((name: string, symbol: string) => {
    const targetGroupIds = ['recent'];
    const n = name.toLowerCase();
    const s = symbol.toLowerCase();

    // CLAW / SEA
    if (hasKeyword(n, ['crab', 'lobster', 'claw', 'shrimp', 'sea', 'ocean', 'fish', 'whale', 'shark', 'coral', 'beach', 'shell'])) {
      targetGroupIds.push('claw-meta');
    } 
    
    // AI
    if (hasKeyword(n, ['bot', 'ai', 'gpt', 'agent', 'brain', 'neural', 'compute', 'data', 'algo', 'robot']) || s.includes('ai')) {
      targetGroupIds.push('ai-meta');
    } 
    
    // POLITIFI
    if (hasKeyword(n, ['trump', 'boden', 'maga', 'usa', 'biden', 'kamala', 'obama', 'putin', 'politics', 'vote', 'republic', 'democrat'])) {
      targetGroupIds.push('politifi');
    } 
    
    // CATS
    if (hasKeyword(n, ['cat', 'mew', 'kitty', 'kitten', 'meow', 'purr', 'feline', 'neko', 'gato'])) {
      targetGroupIds.push('cats');
    } 
    
    // DOGS
    if (hasKeyword(n, ['dog', 'pup', 'shib', 'inu', 'bark', 'woof', 'canine', 'bonk', 'floki', 'doge'])) {
      targetGroupIds.push('dog-meta');
    } 
    
    // FROGS
    if (hasKeyword(n, ['pepe', 'frog', 'toad', 'apu', 'croak', 'pond', 'amphibian', 'kek'])) {
      targetGroupIds.push('frog-meta');
    } 
    
    // GAMING
    if (hasKeyword(n, ['game', 'play', 'bit', 'pixel', 'retro', 'arcade', 'win', 'bet', 'casino', 'quest', 'level', 'npc'])) {
      targetGroupIds.push('gaming');
    } 
    
    // FOOD
    if (hasKeyword(n, ['food', 'eat', 'drink', 'beer', 'pizza', 'burger', 'taco', 'coffee', 'tea', 'snack', 'cake', 'sweet', 'fruit'])) {
      targetGroupIds.push('food');
    }

    return targetGroupIds;
  }, [hasKeyword]);

  const handleTrade = useCallback((data: PumpPortalTrade) => {
    tradeBuffer.current.push(data);
  }, []);

  // Flush trade buffer every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (tradeBuffer.current.length === 0) return;

      const trades = [...tradeBuffer.current];
      tradeBuffer.current = []; // Clear buffer

      setGroups(prevGroups => {
        try {
          // Create a map of updates by mint for faster lookup
          const updatesByMint = new Map<string, PumpPortalTrade>();
          const volumeByMint = new Map<string, number>();

          // Process all trades to sum volume
          trades.forEach(t => {
            if (t && t.mint && processedMints.current.has(t.mint)) {
                // Keep the last trade for state updates (MC, price)
                updatesByMint.set(t.mint, t);
                
                // Sum volume
                const currentVol = volumeByMint.get(t.mint) || 0;
                volumeByMint.set(t.mint, currentVol + (t.solAmount || 0));
            }
          });

          let hasUpdates = false;
          
          // Also check if ClawToken needs update
          if (processedMints.current.has('clawscout_placeholder') || (clawTokenRef.current && updatesByMint.has(clawTokenRef.current.id))) {
             // Logic to update clawToken state would go here if it was separate from groups
             // Since we're just storing it in state, let's update it here
             if (clawTokenRef.current && updatesByMint.has(clawTokenRef.current.id)) {
                 const t = clawTokenRef.current;
                 const update = updatesByMint.get(t.id);
                 const volumeToAdd = volumeByMint.get(t.id) || 0;
                 const currentSolPrice = solPriceRef.current || 200;
                 const mcSol = update ? (update.marketCapSol || 0) : (t.marketCap / currentSolPrice);
                 
                 const updatedClawToken = {
                      ...t,
                      marketCap: update ? mcSol * currentSolPrice : t.marketCap, 
                      vSolInBondingCurve: update ? (update.vSolInBondingCurve || t.vSolInBondingCurve) : t.vSolInBondingCurve,
                      volume24h: t.volume24h + volumeToAdd,
                      price: update ? (mcSol / 1000000000) : t.price,
                 };
                 
                 // Recalculate bonding curve
                 const launchMC = 4000;
                 const targetMC = 65000;
                 if (updatedClawToken.marketCap > launchMC) {
                    updatedClawToken.bondingCurve = Math.min(Math.max(((updatedClawToken.marketCap - launchMC) / (targetMC - launchMC)) * 100, 1), 100);
                 }

                 setClawToken(updatedClawToken);
                 clawTokenRef.current = updatedClawToken;
             }
          }

          const newGroups = prevGroups.map(group => {
            let groupUpdated = false;
            const updatedTokens = group.tokens.map(token => {
                  const update = updatesByMint.get(token.id);
                  const volumeToAdd = volumeByMint.get(token.id) || 0;
                  
                  if (update || volumeToAdd > 0) {
                    hasUpdates = true;
                    groupUpdated = true;
                    
                    const currentSolPrice = solPriceRef.current || 200;
                    const mcSol = update ? (update.marketCapSol || 0) : (token.marketCap / currentSolPrice);
                    
                    return {
                      ...token,
                      marketCap: update ? mcSol * currentSolPrice : token.marketCap, 
                      vSolInBondingCurve: update ? (update.vSolInBondingCurve || token.vSolInBondingCurve) : token.vSolInBondingCurve,
                      volume24h: token.volume24h + volumeToAdd,
                      price: update ? (mcSol / 1000000000) : token.price,
                    };
                  }
                  return token;
               });

            return groupUpdated ? { ...group, tokens: updatedTokens } : group;
          });

          return hasUpdates ? newGroups : prevGroups;
        } catch (err) {
          console.error("Error processing trade updates:", err);
          return prevGroups;
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Fetch initial data from Pump.fun API to populate the dashboard immediately
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            let url;
            // Use local API proxy in production (Saved on Host logic)
            if (import.meta.env.PROD) {
                url = '/api/tokens';
            } else {
                // Use local proxy in dev
                url = '/pump-api/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&include_nsfw=true';
            }
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch initial data');
            
            const data = await res.json();
            
            if (!Array.isArray(data)) return;

            setGroups(prevGroups => {
                const newGroups = [...prevGroups];
                
                data.forEach((item: any) => {
                    if (processedMints.current.has(item.mint)) return;
                    processedMints.current.add(item.mint);

                    const token: Token = {
                        id: item.mint,
                        name: item.name,
                        symbol: item.symbol,
                        price: (item.usd_market_cap || 0) / 1000000000, // Approximate based on MC
                        marketCap: item.usd_market_cap || 0,
                        volume24h: item.total_volume || 0,
                        change24h: 0,
                        imageUrl: getIpfsUrl(item.image_uri),
                        description: item.description || '',
                        created: item.created_timestamp,
                        vSolInBondingCurve: item.virtual_sol_reserves || 0,
                        bondingCurve: item.complete ? 100 : (item.bonding_curve_progress || 0) * 100
                    };

                    // Check for ClawSeek
                    const isOfficial = CLAW_SCOUT_CONFIG.officialMintAddress === item.mint;
                    const isNameMatch = CLAW_SCOUT_CONFIG.targetNames.some(n => item.name.toLowerCase().includes(n.toLowerCase())) || 
                                        CLAW_SCOUT_CONFIG.targetSymbols.some(s => item.symbol.toLowerCase().includes(s.toLowerCase()));

                    if (isOfficial || (isNameMatch && !CLAW_SCOUT_CONFIG.officialMintAddress)) {
                        setClawToken(prev => {
                            // If we already have the official one, don't overwrite with a name-match
                            if (prev && prev.id === CLAW_SCOUT_CONFIG.officialMintAddress) return prev;
                            
                            // Override image if configured
                            if (CLAW_SCOUT_CONFIG.image) {
                                return { ...token, imageUrl: CLAW_SCOUT_CONFIG.image };
                            }
                            return token; 
                        });
                    }

                    // Classify
                    const targetGroupIds = classifyToken(token.name, token.symbol);
                    
                    // Add to groups
                    targetGroupIds.forEach(groupId => {
                        const group = newGroups.find(g => g.id === groupId);
                        if (group) {
                            // Avoid duplicates in group
                            if (!group.tokens.some(t => t.id === token.id)) {
                                group.tokens.unshift(token);
                                // Limit group size
                                if (group.tokens.length > 50) group.tokens.pop();
                            }
                        }
                    });
                });

                return newGroups;
            });

        } catch (e) {
            console.error("Failed to fetch initial tokens", e);
        }
    };

    fetchInitialData();
  }, [classifyToken]);

    // Active Hunt: Search for ClawScout on server every time (for new users)
    const huntForClawToken = async () => {
        try {
            // PRIORITY 1: Check Hardcoded Config
            if (CLAW_SCOUT_CONFIG.officialMintAddress) {
                 const mint = CLAW_SCOUT_CONFIG.officialMintAddress;
                 
                 // 1. Create Skeleton Token immediately to replace "Hunting" screen
                 const skeletonToken: Token = {
                    id: mint,
                    name: CLAW_SCOUT_CONFIG.targetNames[0] || "$ClawSeek",
                    symbol: CLAW_SCOUT_CONFIG.targetSymbols[0] || "SEEK",
                    price: 0,
                    marketCap: 0,
                    volume24h: 0,
                    change24h: 0,
                    imageUrl: CLAW_SCOUT_CONFIG.image || "",
                    description: "Loading official token data...",
                    created: Date.now(),
                    vSolInBondingCurve: 0,
                    bondingCurve: 0
                 };

                 // Set initial state if empty (shows card immediately)
                 if (!clawTokenRef.current) {
                     setClawToken(skeletonToken);
                     clawTokenRef.current = skeletonToken;
                 }

                 let url;
                 if (import.meta.env.PROD) {
                    url = `/api/token-info?mint=${mint}`;
                 } else {
                    // Use local proxy in dev
                    url = `/pump-api/coins/${mint}`;
                 }
                 
                 const res = await fetch(url);
                 if (res.ok) {
                     const match = await res.json();
                     if (match) {
                        const token: Token = {
                            id: match.mint,
                            name: match.name,
                            symbol: match.symbol,
                            price: (match.usd_market_cap || 0) / 1000000000,
                            marketCap: match.usd_market_cap || 0,
                            volume24h: match.total_volume || 0,
                            change24h: 0,
                            imageUrl: CLAW_SCOUT_CONFIG.image || getIpfsUrl(match.image_uri),
                            description: match.description || '',
                            created: match.created_timestamp,
                            vSolInBondingCurve: match.virtual_sol_reserves || 0,
                            bondingCurve: match.complete ? 100 : (match.bonding_curve_progress || 0) * 100
                         };
                         setClawToken(token);
                         clawTokenRef.current = token;
                         return; // Stop hunting if we found the official one
                     }
                 }
            }

            // PRIORITY 2: Search by Name (if no official address yet)
            let url;
            if (import.meta.env.PROD) {
                url = `/api/search?term=ClawSeek`;
            } else {
                const proxyUrl = 'https://corsproxy.io/?';
                const targetUrl = `https://frontend-api.pump.fun/coins?offset=0&limit=5&sort=created_timestamp&order=DESC&include_nsfw=true&searchTerm=ClawSeek`;
                url = proxyUrl + encodeURIComponent(targetUrl);
            }

            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            
            if (Array.isArray(data) && data.length > 0) {
                // Find exact match or best match
                const match = data.find((t: any) => 
                    CLAW_SCOUT_CONFIG.targetNames.some(n => t.name.toLowerCase().includes(n.toLowerCase())) ||
                    CLAW_SCOUT_CONFIG.targetSymbols.some(s => t.symbol.toLowerCase().includes(s.toLowerCase()))
                );

                if (match) {
                     const token: Token = {
                        id: match.mint,
                        name: match.name,
                        symbol: match.symbol,
                        price: (match.usd_market_cap || 0) / 1000000000,
                        marketCap: match.usd_market_cap || 0,
                        volume24h: match.total_volume || 0,
                        change24h: 0,
                        imageUrl: CLAW_SCOUT_CONFIG.image || getIpfsUrl(match.image_uri),
                        description: match.description || '',
                        created: match.created_timestamp,
                        vSolInBondingCurve: match.virtual_sol_reserves || 0,
                        bondingCurve: match.complete ? 100 : (match.bonding_curve_progress || 0) * 100
                     };
                     
                     // Auto-Save Logic: If found by name/symbol and not hardcoded, save it to git
                     if (!CLAW_SCOUT_CONFIG.officialMintAddress) {
                         console.log("Found candidate for ClawSeek, auto-saving...", token.id);
                         fetch('/__save-claw-token', {
                             method: 'POST',
                             body: JSON.stringify({
                                 mint: match.mint,
                                 name: match.name,
                                 symbol: match.symbol
                             })
                         }).catch(err => console.error("Auto-save failed", err));
                     }

                     // Only update if we don't have it or it's different
                     if (!clawTokenRef.current || clawTokenRef.current.id !== token.id) {
                         setClawToken(token);
                         clawTokenRef.current = token;
                     }
                }
            }
        } catch (e) {
            console.error("Failed to hunt claw token", e);
        }
    };

    // Re-verify stored ClawToken data
    const verifyStoredToken = async () => {
        const stored = localStorage.getItem('claw_token_data');
        if (!stored) return;
        
        try {
            const token = JSON.parse(stored);
            let url;
            if (import.meta.env.PROD) {
                url = `/api/token-info?mint=${token.id}`;
            } else {
                url = `/pump-api/coins/${token.id}`;
            }

            const res = await fetch(url);
            if (!res.ok) return;
            const info = await res.json();
            
            if (info) {
                 const updatedToken = {
                    ...token,
                    marketCap: info.usd_market_cap || token.marketCap,
                    volume24h: info.total_volume || token.volume24h,
                    price: (info.usd_market_cap || 0) / 1000000000,
                    vSolInBondingCurve: info.virtual_sol_reserves || token.vSolInBondingCurve,
                    bondingCurve: info.complete ? 100 : (info.bonding_curve_progress || 0) * 100
                 };
                 setClawToken(updatedToken);
                 clawTokenRef.current = updatedToken;
            }
        } catch (e) {
            console.error("Failed to re-verify stored token", e);
        }
    };
    
    // Move execution to useEffect to avoid render loop
    useEffect(() => {
        huntForClawToken();
        verifyStoredToken();
    }, []); // Run once on mount (and when config changes ideally, but for now once is fine)

  const handleNewToken = useCallback(async (data: PumpPortalToken) => {
    if (processedMints.current.has(data.mint)) return;
    processedMints.current.add(data.mint);

    // Keep set size manageable
    if (processedMints.current.size > 2000) {
      const first = processedMints.current.values().next().value;
      if (first) processedMints.current.delete(first);
    }
    
    // Update total processed stats
    setStats(prev => ({ totalProcessed: prev.totalProcessed + 1 }));

    // 1. Basic Classification based on name/symbol
    const name = data.name.toLowerCase();
    const symbol = data.symbol.toLowerCase();
    
    // Check if this is THE ClawScout token (Priority Detection)
    const isOfficialConfig = CLAW_SCOUT_CONFIG.officialMintAddress === data.mint;
    const isNameMatch = CLAW_SCOUT_CONFIG.targetNames.some(n => name.includes(n.toLowerCase())) || 
                        CLAW_SCOUT_CONFIG.targetSymbols.some(s => symbol.includes(s.toLowerCase()));
    
    // Determine if this IS the ClawSeek token we care about
    let isClawScout = false;

    if (CLAW_SCOUT_CONFIG.officialMintAddress) {
        // If we have a hardcoded address, ONLY that address is ClawSeek
        isClawScout = isOfficialConfig;
    } else if (clawTokenRef.current) {
        // If we already found one during this session, ONLY that one is ClawSeek
        isClawScout = clawTokenRef.current.id === data.mint;
    } else {
        // We are hunting, and haven't found it yet.
        isClawScout = isNameMatch;
    }
    
    // Auto-Save from Stream (Only if we just found it)
    if (isClawScout && !CLAW_SCOUT_CONFIG.officialMintAddress && !clawTokenRef.current) {
        console.log("Found ClawSeek in stream, auto-saving...", data.mint);
        fetch('/__save-claw-token', {
             method: 'POST',
             body: JSON.stringify({
                 mint: data.mint,
                 name: data.name,
                 symbol: data.symbol
             })
        }).catch(err => console.error("Auto-save failed", err));
    }

    const targetGroupIds = classifyToken(name, symbol);

    // 2. Resolve Metadata & Preload Image
    let resolvedImageUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${data.mint}`; // Default fallback
    
    // Optimization: For ClawScout, try to get the image directly from Pump.fun API (skips metadata JSON fetch)
    // This is often faster because it saves one IPFS roundtrip
    if (isClawScout) {
        try {
             let apiUrl;
             if (import.meta.env.PROD) {
                apiUrl = `/api/token-info?mint=${data.mint}`;
             } else {
                const proxyUrl = 'https://corsproxy.io/?';
                const targetUrl = `https://frontend-api.pump.fun/coins/${data.mint}`;
                apiUrl = proxyUrl + encodeURIComponent(targetUrl);
             }

             // Race between IPFS metadata and Pump API
             const [metadataResult, apiResult] = await Promise.allSettled([
                 fetchIpfsJson(data.uri),
                 fetch(apiUrl).then(res => res.json())
             ]);

             // Check API result first (usually faster/more reliable for image link)
             if (apiResult.status === 'fulfilled' && apiResult.value && apiResult.value.image_uri) {
                 resolvedImageUrl = getIpfsUrl(apiResult.value.image_uri);
             } 
             // Fallback to IPFS metadata
             else if (metadataResult.status === 'fulfilled' && metadataResult.value && metadataResult.value.image) {
                 resolvedImageUrl = getIpfsUrl(metadataResult.value.image);
             }

             // FORCE OVERRIDE: Use local image for ClawScout
             resolvedImageUrl = CLAW_SCOUT_CONFIG.image || '/clawseek_logo.jpg';
             
        } catch (e) {
            // Fallback to standard flow
            // FORCE OVERRIDE: Use local image for ClawScout even if error
            resolvedImageUrl = CLAW_SCOUT_CONFIG.image || '/clawseek_logo.jpg';
        }
    } else if (data.uri) {
        // Standard flow for other tokens
        try {
            const metadata = await fetchIpfsJson(data.uri);
            if (metadata && metadata.image) {
                resolvedImageUrl = getIpfsUrl(metadata.image);
            }
        } catch (e) {
            // console.warn('Failed to resolve metadata', e);
        }
    }

    // Wait for image to load before displaying
    // If it fails to load within 2 seconds, we proceed with whatever we have
    try {
        await Promise.race([
            preloadImage(resolvedImageUrl),
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);
    } catch (e) {
        // Ignore preload errors
    }

    // 3. Create Token Object
    const newToken: Token = {
      id: data.mint,
      name: data.name || 'Unknown',
      symbol: data.symbol || '???',
      price: 0, 
      marketCap: (data.marketCapSol || 0) * (solPriceRef.current || 200), 
      volume24h: 0,
      change24h: 0, // Initial change is 0
      imageUrl: resolvedImageUrl, 
      description: `New launch on Pump.fun! Market Cap: ${(data.marketCapSol || 0).toFixed(2)} SOL`,
      created: Date.now(),
      vSolInBondingCurve: data.vSolInBondingCurve || 0,
      bondingCurve: 0 // Initialize bonding curve progress
    };

    // Calculate initial bonding curve progress
    // Launch ~4k, Grad ~65k USD
    const currentMC = newToken.marketCap;
    const launchMC = 4000;
    const targetMC = 65000;
    if (currentMC > launchMC) {
        newToken.bondingCurve = Math.min(Math.max(((currentMC - launchMC) / (targetMC - launchMC)) * 100, 1), 100);
    } else {
        newToken.bondingCurve = 1;
    }

    // Check if this is THE ClawSeek token
    // Lock mechanism: Only set if not already set (First come, first served)
    if (isClawScout && !clawTokenRef.current) {
        setClawToken(newToken);
        clawTokenRef.current = newToken;
    }

    // Subscribe to trades for this specific token
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
            method: "subscribeTokenTrade",
            keys: [data.mint]
        }));
    }

    // 4. Update State
    setGroups(prevGroups => {
      return prevGroups.map(group => {
        if (targetGroupIds.includes(group.id)) {
          // Check for duplicates
          const isDuplicate = group.tokens.some(t => t.id === newToken.id);
          if (isDuplicate) return group;

          // Add new token to the top, keep max 25
          const newTokens = [newToken, ...group.tokens].slice(0, 25);
          return {
            ...group,
            tokens: newTokens,
            trendScore: group.trendScore + (group.id === 'recent' ? 0 : 1) // Increase hype score for specific groups
          };
        }
        return group;
      }).sort((a, b) => b.trendScore - a.trendScore);
    });

    // Fetch Pump.fun API to correct any missing data (async, doesn't block UI anymore since we have valid initial data)
    setTimeout(async () => {
        try {
            let url;
            if (import.meta.env.PROD) {
                url = `/api/token-info?mint=${data.mint}`;
            } else {
                url = `/pump-api/coins/${data.mint}`;
            }

            const res = await fetch(url);
            
            if (!res.ok) throw new Error('Proxy/API Error');
            
            const info = await res.json();
            if (info) {
                setGroups(prev => prev.map(g => ({
                    ...g,
                    tokens: g.tokens.map(t => {
                        if (t.id === data.mint) {
                            return {
                                ...t,
                                marketCap: info.usd_market_cap || t.marketCap,
                                volume24h: info.total_volume || t.volume24h, 
                                imageUrl: getIpfsUrl(info.image_uri) || t.imageUrl
                            };
                        }
                        return t;
                    })
                })));
            }
        } catch (e) {
            // console.error("Failed to fetch initial pumpfun data", e);
        }
    }, 1000);

  }, [hasKeyword]);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let socket: WebSocket | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      try {
        socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          if (isUnmounted) {
            socket?.close();
            return;
          }
          console.log('Connected to PumpPortal');
          setIsConnected(true);
          setConnectionError(null);
          
          // Subscribe to new token creations
          socket?.send(JSON.stringify({
            method: "subscribeNewToken", 
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.txType === 'create') {
              handleNewToken(data);
            } else if (data.txType === 'trade' || data.txType === 'buy' || data.txType === 'sell') {
              handleTrade(data);
            }
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        socket.onclose = () => {
          if (isUnmounted) return;
          console.log('Disconnected from PumpPortal, reconnecting in 3s...');
          setIsConnected(false);
          // Retry connection after delay
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('Connection failed. Retrying...');
          // Close will trigger onclose which handles reconnect
          socket?.close();
        };

      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        setConnectionError('WebSocket blocked or invalid');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.close();
      }
    };
  }, [handleNewToken, handleTrade]);

  // Filter groups based on search term
  const filteredGroups = groups.map(group => ({
    ...group,
    tokens: group.tokens.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.includes(searchTerm)
    )
  })).filter(g => g.tokens.length > 0 || searchTerm === ''); // Hide empty groups if searching

  return { groups: filteredGroups, isConnected, connectionError, stats, solPrice, clawToken };
};
