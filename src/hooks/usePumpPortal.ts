import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendGroup, analyzeTrends, Token } from '../data/mockData';
import { getIpfsUrl, fetchIpfsJson } from '../lib/utils';

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
  const [stats, setStats] = useState({ totalProcessed: 0 });
  const [solPrice, setSolPrice] = useState(200); // Default 200 to show USD immediately
  const [clawToken, setClawToken] = useState<Token | null>(null);
  const clawTokenRef = useRef<Token | null>(null);
  const solPriceRef = useRef(200);
  const ws = useRef<WebSocket | null>(null);

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
    const isClawScout = name.includes('clawscout') || symbol.includes('clawscout') || name === 'clawscout' || symbol === 'clawscout';

    // Always add to 'recent' group
    let targetGroupIds = ['recent'];
    
    // CLAW / SEA
    if (hasKeyword(name, ['crab', 'lobster', 'claw', 'shrimp', 'sea', 'ocean', 'fish', 'whale', 'shark', 'coral', 'beach', 'shell'])) {
      targetGroupIds.push('claw-meta');
    } 
    
    // AI
    if (hasKeyword(name, ['bot', 'ai', 'gpt', 'agent', 'brain', 'neural', 'compute', 'data', 'algo', 'robot']) || symbol.includes('ai')) {
      targetGroupIds.push('ai-meta');
    } 
    
    // POLITIFI
    if (hasKeyword(name, ['trump', 'boden', 'maga', 'usa', 'biden', 'kamala', 'obama', 'putin', 'politics', 'vote', 'republic', 'democrat'])) {
      targetGroupIds.push('politifi');
    } 
    
    // CATS
    if (hasKeyword(name, ['cat', 'mew', 'kitty', 'kitten', 'meow', 'purr', 'feline', 'neko', 'gato'])) {
      targetGroupIds.push('cats');
    }
    
    // DOGS
    if (hasKeyword(name, ['dog', 'pup', 'shib', 'inu', 'bark', 'woof', 'canine', 'bonk', 'floki', 'doge'])) {
      targetGroupIds.push('dog-meta');
    }
    
    // FROGS
    if (hasKeyword(name, ['pepe', 'frog', 'toad', 'apu', 'croak', 'pond', 'amphibian', 'kek'])) {
      targetGroupIds.push('frog-meta');
    }
    
    // GAMING
    if (hasKeyword(name, ['game', 'play', 'bit', 'pixel', 'retro', 'arcade', 'win', 'bet', 'casino', 'quest', 'level', 'npc'])) {
      targetGroupIds.push('gaming');
    }
    
    // FOOD
    if (hasKeyword(name, ['food', 'eat', 'drink', 'beer', 'pizza', 'burger', 'taco', 'coffee', 'tea', 'snack', 'cake', 'sweet', 'fruit'])) {
      targetGroupIds.push('food');
    }

    // 2. Resolve Metadata & Preload Image
    let resolvedImageUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${data.mint}`; // Default fallback
    
    // Optimization: For ClawScout, try to get the image directly from Pump.fun API (skips metadata JSON fetch)
    // This is often faster because it saves one IPFS roundtrip
    if (isClawScout) {
        try {
             const proxyUrl = 'https://corsproxy.io/?';
             const targetUrl = `https://frontend-api.pump.fun/coins/${data.mint}`;
             // Race between IPFS metadata and Pump API
             const [metadataResult, apiResult] = await Promise.allSettled([
                 fetchIpfsJson(data.uri),
                 fetch(proxyUrl + encodeURIComponent(targetUrl)).then(res => res.json())
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
             resolvedImageUrl = '/images/clawscout-logo.jpg';
             
        } catch (e) {
            // Fallback to standard flow
            // FORCE OVERRIDE: Use local image for ClawScout even if error
            resolvedImageUrl = '/images/clawscout-logo.jpg';
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

    // Check if this is THE ClawScout token
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
            // Use a CORS proxy to avoid browser errors when fetching from frontend-api
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = `https://frontend-api.pump.fun/coins/${data.mint}`;
            const res = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            
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
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('Connected to PumpPortal');
      setIsConnected(true);
      
      // Subscribe to new token creations
      ws.current?.send(JSON.stringify({
        method: "subscribeNewToken", 
      }));

      // Remove global trade subscription to avoid noise and ensure we only track what we display
      // ws.current?.send(JSON.stringify({
      //    method: "subscribeTrade", 
      // }));
    };

    ws.current.onmessage = (event) => {
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

    ws.current.onclose = () => {
      console.log('Disconnected from PumpPortal');
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
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

  return { groups: filteredGroups, isConnected, stats, solPrice, clawToken };
};
