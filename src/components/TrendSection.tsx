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
      case 'ai-meta': return <Bot className="text-blue-400" size={24} />;
      case 'cats': return <Cat className="text-yellow-400" size={24} />;
      case 'dog-meta': return <Dog className="text-orange-400" size={24} />;
      case 'frog-meta': return <Smile className="text-green-500" size={24} />; // Smile as proxy for frog
      case 'gaming': return <Gamepad2 className="text-purple-500" size={24} />;
      case 'food': return <Utensils className="text-red-400" size={24} />;
      case 'recent': return <Flame className="text-orange-500" size={24} />;
      default: return <Flame className="text-red-500" size={24} />;
    }
  };

  if (group.tokens.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-claw-dim/10 bg-claw-panel/20 p-4">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-4 flex items-center gap-3 border-b border-claw-dim/10 pb-3"
      >
        <div className="rounded-full bg-claw-panel p-2 ring-1 ring-claw-dim/20">
          {getIcon(group.id)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold text-white">
            {group.name}
          </h2>
          <p className="truncate text-xs text-claw-dim">{group.description}</p>
        </div>
        
        <div className="hidden sm:block">
           <span className="rounded-full bg-claw-primary/10 px-2 py-0.5 text-[10px] font-bold text-claw-primary">
             {group.trendScore}
           </span>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[800px] p-2 pr-3 custom-scrollbar">
        {group.tokens.map((token) => (
          <TokenCard key={token.id} token={token} solPrice={solPrice} />
        ))}
      </div>
    </div>
  );
};
