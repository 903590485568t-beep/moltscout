import { motion } from 'framer-motion';
import { Token } from '../data/mockData';
import { getIpfsUrl } from '../lib/utils';
import { ExternalLink, Zap, Check, Copy } from 'lucide-react';
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
        className="relative w-full max-w-[420px] h-[200px] overflow-hidden border border-claw-primary/50 bg-black/90 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center group"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)" // Tech/Cut corner
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent_70%)] opacity-60" />
        
        {/* Tech Lines */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-claw-primary/50" />
        <div className="absolute bottom-0 right-0 w-20 h-[20px] bg-claw-primary/20" />
        <div className="absolute top-4 left-4 w-2 h-2 bg-claw-primary" />
        <div className="absolute top-4 right-4 w-2 h-2 bg-claw-primary" />
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-claw-primary" />

        <div className="flex flex-col items-center gap-4 text-center p-8 relative z-10">
          <div className="h-16 w-16 rounded-sm bg-claw-primary/10 flex items-center justify-center border border-claw-primary/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse relative">
            {/* Crosshair corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-claw-primary" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-claw-primary" />
            <span className="text-3xl text-claw-primary">⚡</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wider uppercase font-display">Scanning...</h3>
            <p className="text-sm text-claw-dim font-mono tracking-widest uppercase text-[10px]">
              Waiting for Signal: <span className="text-claw-primary font-bold">Moltseek</span>
            </p>
          </div>
        </div>
        
        {/* Scanning effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100%] left-0 w-full h-[20%] bg-claw-primary/20 blur-md animate-scan-down" />
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
      {/* HUD Container */}
      <div className="relative bg-black/80 border border-claw-primary/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.15)]"
           style={{
             clipPath: "polygon(0 0, 100% 0, 100% 90%, 92% 100%, 0 100%)"
           }}>
           
        {/* Decorative HUD Elements */}
        <div className="absolute top-0 left-0 w-32 h-[2px] bg-claw-primary" />
        <div className="absolute top-0 right-0 w-8 h-[2px] bg-claw-primary" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-claw-primary/30" />
        <div className="absolute -left-[1px] top-10 bottom-10 w-[2px] bg-claw-primary/30" />
        
        {/* "OFFICIAL" Badge - Tech Style */}
        <div className="absolute -top-[1px] right-8 bg-claw-primary text-black text-[9px] font-bold uppercase px-3 py-1 tracking-widest">
          Official Token
        </div>

        {/* Content */}
        <div className="flex items-start gap-5 mb-5 relative z-10">
            <div className="relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute -inset-1 border border-claw-primary/50 rounded-sm" />
                <img 
                  src={getIpfsUrl(token.imageUrl)} 
                  alt={token.name}
                  className="w-24 h-24 rounded-sm object-cover border border-white/10 shadow-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all"
                />
                <div className="absolute -bottom-2 -right-2 bg-claw-primary text-black p-1 rounded-sm border border-black shadow-[0_0_10px_rgba(239,68,68,0.5)]">
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
                   The native utility token of the MoltScout ecosystem. Hold to unlock premium features and faster scanning speeds.
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
                    {Math.round(token.bondingCurve || 0)}%
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