import { motion } from 'framer-motion';
import { TrendGroup } from '../data/mockData';
import { TokenCard } from './TokenCard';
import { Flame, Waves, Bot, Cat, Dog, Gamepad2, Utensils, Smile } from 'lucide-react';

interface TrendSectionProps {
  group: TrendGroup;
  solPrice?: number;
}

export const TrendSection = ({ group, solPrice }: TrendSectionProps) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'claw-meta': return <Waves className="text-claw-accent" size={24} />;
      case 'ai-meta': return <Bot className="text-red-300" size={24} />;
      case 'cats': return <Cat className="text-orange-300" size={24} />;
      case 'dog-meta': return <Dog className="text-orange-400" size={24} />;
      case 'frog-meta': return <Smile className="text-emerald-500" size={24} />; // Smile as proxy for frog
      case 'gaming': return <Gamepad2 className="text-rose-500" size={24} />;
      case 'food': return <Utensils className="text-red-400" size={24} />;
      case 'recent': return <Flame className="text-orange-500" size={24} />;
      default: return <Flame className="text-red-500" size={24} />;
    }
  };

  if (group.tokens.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-[#08080A]/80 border-l border-claw-primary/30 p-0 backdrop-blur-sm relative group overflow-hidden">
      {/* Scan line effect for section */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-claw-primary/20" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-claw-primary/20" />
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-0 flex items-center gap-3 bg-black/60 p-4 border-b border-claw-primary/20"
      >
        <div className="rounded-sm bg-black p-2 border border-claw-primary/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          {getIcon(group.id)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold text-white text-glow uppercase tracking-wider">
            {group.name}
          </h2>
          <p className="truncate text-xs text-claw-dim font-mono tracking-tight uppercase">
            // {group.description}
          </p>
        </div>
        
        <div className="hidden sm:block">
           <span className="bg-claw-primary text-black px-2 py-0.5 text-[10px] font-bold font-mono">
             SCORE_{group.trendScore}
           </span>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] p-4 custom-scrollbar bg-gradient-to-b from-black/20 to-transparent">
        {group.tokens.map((token) => (
          <TokenCard key={token.id} token={token} solPrice={solPrice} />
        ))}
      </div>
    </div>
  );
};
