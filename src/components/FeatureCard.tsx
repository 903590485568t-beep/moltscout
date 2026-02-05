import { motion } from 'framer-motion';
import { Token } from '../data/mockData';
import { getIpfsUrl, shortenAddress } from '../lib/utils';
import { Copy, Check, ExternalLink, Zap } from 'lucide-react';
import { useState } from 'react';

interface FeatureCardProps {
  token: Token | null;
  solPrice?: number;
}

export const FeatureCard = ({ token, solPrice = 200 }: FeatureCardProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatUSD = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(1)}`;
  };

  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[420px] h-[200px] rounded-3xl overflow-hidden border-2 border-claw-primary/50 bg-claw-panel/90 shadow-[0_0_40px_rgba(139,92,246,0.2)] backdrop-blur-md flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-claw-primary/10 via-transparent to-claw-accent/5 opacity-60" />
        
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 p-[2px] rounded-3xl bg-gradient-to-r from-claw-primary/50 via-claw-accent/50 to-claw-primary/50 opacity-50 animate-pulse mask-image-content" />

        <div className="flex flex-col items-center gap-4 text-center p-8 relative z-10">
          <div className="h-16 w-16 rounded-full bg-claw-primary/20 flex items-center justify-center border-2 border-claw-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse">
            <span className="text-3xl">🎯</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">Hunting...</h3>
            <p className="text-sm text-claw-dim font-medium">
              Awaiting <span className="text-claw-primary font-bold">$ClawSeek</span> Launch
            </p>
          </div>
        </div>
        
        {/* Scanning effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-claw-primary/20 to-transparent transform skew-x-12 animate-shine" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-[450px] group"
    >
      {/* 1. Crawling Gradient Layer (The "Border") */}
      <div className="absolute -inset-[4px] rounded-3xl overflow-hidden z-0">
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#8b5cf6_360deg)] animate-spin-slow opacity-100" />
      </div>

      {/* 2. Glow Layer */}
      <div className="absolute -inset-[2px] rounded-3xl bg-claw-primary/30 blur-xl z-0 animate-glow-pulse" />

      {/* 3. Static Border Background (Hides the center of the gradient) */}
      <div className="absolute inset-[2px] bg-[#08080A] rounded-[22px] z-0" />

      {/* 3. Main Content Layer */}
      <div className="relative z-10 p-6 rounded-[22px] bg-[#08080A]/90 backdrop-blur-xl h-full border border-white/5 shadow-[0_0_60px_rgba(139,92,246,0.2)]">
      
      {/* Background Effects */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-claw-primary/30 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-claw-accent/20 rounded-full blur-[80px] opacity-40 pointer-events-none" />
      
      {/* "OFFICIAL" Badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-bl from-claw-primary to-claw-primary/80 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-xl shadow-lg z-20 tracking-wider">
        Official Project Token
      </div>

        <div className="flex items-start gap-5 mb-5 relative z-10">
            <div className="relative">
                <img 
                  src={getIpfsUrl(token.imageUrl)} 
                  alt={token.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-claw-accent text-black p-1.5 rounded-full border-2 border-[#08080A]">
                    <Zap size={14} strokeWidth={3} />
                </div>
            </div>
            
            <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-3xl font-black text-white leading-none mb-1 tracking-tight">{token.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-claw-primary">${token.symbol}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-claw-accent animate-pulse" />
                    <span className="text-xs text-claw-dim font-mono">Live on Solana</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 font-medium">
                   The native utility token of the ClawSeek ecosystem. Hold to unlock premium features and faster scanning speeds.
                </p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5 relative z-10">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-[10px] text-claw-dim uppercase font-bold tracking-wider mb-1">Market Cap</div>
                <div className="text-lg font-mono font-bold text-white leading-none">
                    {formatUSD(token.marketCap)}
                </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-[10px] text-claw-dim uppercase font-bold tracking-wider mb-1">Volume 24h</div>
                <div className="text-lg font-mono font-bold text-white leading-none">
                    {formatUSD(token.volume24h * solPrice)}
                </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-[10px] text-claw-dim uppercase font-bold tracking-wider mb-1">Curve</div>
                <div className="text-lg font-mono font-bold text-claw-accent leading-none">
                    {Math.round(token.bondingCurve)}%
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
            <a 
              href={`https://pump.fun/${token.id}`}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 bg-gradient-to-r from-claw-primary to-violet-600 hover:from-violet-500 hover:to-violet-600 text-white font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-claw-primary/25 hover:shadow-claw-primary/40 hover:-translate-y-0.5"
            >
              BUY ON PUMP.FUN
              <ExternalLink size={18} strokeWidth={3} />
            </a>
            
            <a 
               href={`https://gmgn.ai/sol/token/${token.id}`}
               target="_blank" 
               rel="noreferrer"
               className="bg-[#1A1D26] hover:bg-[#252A36] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-colors"
            >
               GMGN Chart
            </a>

            <button 
              onClick={copyToClipboard}
              className="bg-[#1A1D26] hover:bg-[#252A36] text-claw-dim hover:text-white font-mono text-xs py-3 rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-all group"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              <span className="truncate max-w-[100px]">{token.id.slice(0, 4)}...{token.id.slice(-4)}</span>
            </button>
        </div>
      </div>
    </motion.div>
  );
};