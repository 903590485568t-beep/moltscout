import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Copy, Check, Clock, ExternalLink, BarChart3 } from 'lucide-react';
import { Token } from '../data/mockData';
import { formatNumber, cn, getIpfsUrl, IPFS_GATEWAYS } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Global cache for resolved image URLs to prevent re-fetching
const imageCache = new Map<string, string>();

interface TokenCardProps {
  token: Token;
  rank?: number;
  solPrice?: number;
}

export const TokenCard = ({ token, solPrice }: TokenCardProps) => {
  const [image, setImage] = useState(() => {
    if (imageCache.has(token.id)) return imageCache.get(token.id)!;
    return token.imageUrl;
  });
  
  const [loading, setLoading] = useState(() => !imageCache.has(token.id) && !token.imageUrl.includes('dicebear'));
  const [copied, setCopied] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  useEffect(() => {
    // If the token image URL changes (e.g. from API correction), update state
    if (token.imageUrl !== image && !token.imageUrl.includes('dicebear')) {
        const optimizedUrl = getIpfsUrl(token.imageUrl);
        setImage(optimizedUrl);
        // If it's a new real image, reset loading state to show it
        if (!imageCache.has(token.id)) {
            setLoading(true);
        }
    } else if (token.imageUrl !== image) {
        // If it changed back to dicebear or something else
        setImage(token.imageUrl);
    }
  }, [token.imageUrl, token.id]);

  const handleImageOnLoad = () => {
    setLoading(false);
    if (!image.includes('dicebear')) {
        imageCache.set(token.id, image);
    }
  };

  const handleImageError = () => {
    // If we're already on the fallback (DiceBear), stop
    if (image.includes('dicebear')) return;

    // Try next gateway
    const nextIndex = gatewayIndex + 1;
    if (nextIndex < IPFS_GATEWAYS.length) {
        let hash = '';
        if (image.includes('/ipfs/')) {
            hash = image.split('/ipfs/')[1];
        } else if (token.imageUrl.includes('/ipfs/')) {
             // Extract hash from original if possible
             if (token.imageUrl.includes('/ipfs/')) {
                hash = token.imageUrl.split('/ipfs/')[1];
             }
        }

        if (hash) {
            const nextUrl = `${IPFS_GATEWAYS[nextIndex]}${hash}`;
            setGatewayIndex(nextIndex);
            setImage(nextUrl);
            return;
        }
    }

    // Fallback to DiceBear if all gateways fail
    setImage(`https://api.dicebear.com/7.x/identicon/svg?seed=${token.id}`);
    setLoading(false);
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(token.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bonding Curve Calculation
  // Pump.fun graduation target is roughly $69k USD Market Cap
  // Assuming SOL price ~$200 for calculation parity with usePumpPortal
  // Target in USD = 69,000.
  // Current Market Cap is stored in USD (approx).
  // If we want a more visual "King of the Hill" progress:
  // 0% = 5k MC (approx launch)
  // 100% = 65k MC (graduation)
  const calculateCurveProgress = (marketCap: number) => {
    const launchMC = 4000; // $4k
    const targetMC = 65000; // $65k
    
    if (marketCap <= launchMC) return 1; // Minimum 1%
    const progress = ((marketCap - launchMC) / (targetMC - launchMC)) * 100;
    return Math.min(Math.max(progress, 1), 100);
  };

  const curveProgress = calculateCurveProgress(token.marketCap);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative flex flex-col gap-4 bg-claw-panel/50 hover:bg-claw-panel border border-claw-dim/10 rounded-xl p-4 transition-colors overflow-hidden w-full shrink-0"
    >
      {/* Top Row: Avatar + Info + Actions */}
      <div className="flex items-start gap-4">
        {/* Avatar - Large */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-claw-primary/20 bg-claw-bg shadow-md">
            {loading && <div className="absolute inset-0 bg-claw-panel animate-pulse" />}
            <img 
            src={image} 
            alt={token.symbol} 
            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            onLoad={handleImageOnLoad}
            />
        </div>

        {/* Info & Actions */}
        <div className="flex flex-1 flex-col justify-between min-h-[64px]">
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-lg leading-tight truncate" title={token.name}>
                        {token.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-mono text-claw-primary/90">${token.symbol}</span>
                        <span className="flex items-center gap-1 bg-claw-bg/50 px-1.5 py-0.5 rounded text-[10px] text-claw-dim border border-claw-dim/10">
                            <Clock size={10} />
                            {formatDistanceToNow(token.created, { addSuffix: true })}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-claw-bg hover:bg-claw-primary/20 rounded-lg transition-colors border border-claw-dim/10"
                        title="Copy CA"
                    >
                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-claw-dim" />}
                    </button>
                    
                    <a 
                        href={`https://pump.fun/${token.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-claw-bg hover:bg-claw-primary/20 rounded-lg transition-colors border border-claw-dim/10"
                        title="View on Pump.fun"
                    >
                        <ExternalLink size={18} className="text-claw-dim" />
                    </a>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Row: Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 border-t border-claw-dim/10 pt-3">
        {/* MC */}
        <div className="flex flex-col">
            <span className="text-[10px] text-claw-dim uppercase tracking-wider font-bold">Mkt Cap</span>
            <span className="font-mono text-base font-bold text-claw-primary">
                ${formatNumber(token.marketCap)}
            </span>
        </div>

        {/* Volume */}
        <div className="flex flex-col border-l border-claw-dim/10 pl-3">
            <span className="text-[10px] text-claw-dim uppercase tracking-wider font-bold">Volume</span>
            <span className="font-mono text-base font-bold text-white">
                {`$${formatNumber(token.volume24h * (solPrice || 200))}`}
            </span>
        </div>

        {/* Bonding Curve */}
        <div className="flex flex-col border-l border-claw-dim/10 pl-3">
             <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-claw-dim uppercase tracking-wider font-bold">Curve</span>
                <span className="text-[10px] font-mono text-white">{curveProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full bg-claw-bg rounded-full overflow-hidden mt-1.5 border border-claw-dim/10">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${curveProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                        "h-full rounded-full shadow-inner",
                        curveProgress >= 100 ? "bg-green-500 animate-pulse" : "bg-gradient-to-r from-claw-primary to-claw-accent"
                    )}
                />
            </div>
        </div>
      </div>
    </motion.div>
  );
};
