import { motion } from 'framer-motion';
import { Token } from '../data/mockData';
import { formatNumber, getIpfsUrl } from '../lib/utils';
import { Copy, Check, ExternalLink } from 'lucide-react';
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
        className="relative w-[320px] h-[160px] rounded-2xl overflow-hidden border border-claw-primary/30 bg-claw-panel/80 shadow-[0_0_30px_rgba(0,255,163,0.1)] backdrop-blur-sm flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-claw-primary/5 to-transparent opacity-50" />
        <div className="flex flex-col items-center gap-3 text-center p-6 relative z-10">
          <div className="h-12 w-12 rounded-full bg-claw-primary/10 flex items-center justify-center border border-claw-primary/20 animate-pulse">
            <span className="text-2xl">🦀</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Coming Soon</h3>
            <p className="text-xs text-claw-dim font-mono">
              Waiting for $ClawScout launch...
            </p>
          </div>
        </div>
        
        {/* Scanning effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-claw-primary/10 to-transparent transform skew-x-12 animate-shine" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative w-[380px] rounded-2xl overflow-hidden border-2 border-claw-primary bg-[#0A0C10] shadow-[0_0_50px_rgba(0,255,163,0.2)]"
    >
      {/* Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-claw-primary/20 rounded-full blur-[50px]" />
      
      <div className="p-5 relative z-10">
        <div className="flex items-start gap-4 mb-4">
            <img 
              src={getIpfsUrl(token.imageUrl)} 
              alt={token.name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-white/10 shadow-lg"
            />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-white leading-none mb-1">{token.name}</h3>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-claw-primary">${token.symbol}</span>
                                <span className="px-1.5 py-0.5 rounded bg-claw-primary/20 text-claw-primary text-[10px] font-bold uppercase border border-claw-primary/30">
                                    Official
                                </span>
                            </div>
                            <span className="text-[10px] text-claw-dim font-mono tracking-tight">
                                Native Platform Token
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {/* Old buttons removed */}
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="text-[10px] text-claw-dim uppercase font-bold">Market Cap</div>
                        <div className="text-lg font-mono font-bold text-white leading-none mt-0.5">
                            {formatUSD(token.marketCap)}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="text-[10px] text-claw-dim uppercase font-bold">Volume</div>
                        <div className="text-lg font-mono font-bold text-claw-primary leading-none mt-0.5">
                            {formatUSD(token.volume24h * solPrice)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Bonding Curve Progress */}
        <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                <span className="text-claw-dim">Bonding Curve Progress</span>
                <span className="text-white">{token.vSolInBondingCurve > 0 ? 'Active' : 'Graduated'}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${token.bondingCurve}%` }}
                    className="h-full bg-gradient-to-r from-claw-primary to-emerald-400"
                />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
             <a 
                href={`https://pump.fun/${token.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#87CEEB] hover:bg-[#7ab8d4] text-black font-black uppercase text-sm h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
                <img src="/pump-fun-logo.png" alt="" className="w-5 h-5 hidden" /> {/* Placeholder for logo if needed */}
                💊 Pump.fun
            </a>
            <a 
                href={`https://gmgn.ai/sol/token/${token.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-claw-primary hover:bg-claw-primary/90 text-black font-black uppercase text-sm h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,163,0.3)]"
            >
                ⚡ GMGN (Fast)
            </a>
            <button 
                onClick={copyToClipboard}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-claw-dim hover:text-white transition-colors"
                title="Copy Contract Address"
            >
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
        </div>
      </div>
    </motion.div>
  );
};