import { motion } from 'framer-motion';
import { Search, Menu, Grab, Activity } from 'lucide-react';

interface HeaderProps {
    stats?: {
        totalProcessed: number;
    };
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const Header = ({ stats, searchTerm, setSearchTerm }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-claw-dim/10 bg-claw-bg/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-claw-primary"
          >
            <Grab size={32} />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black tracking-wider text-white leading-none">
                $CLAW<span className="text-claw-primary">SEEK</span>
            </span>
            <span className="text-[10px] text-claw-dim tracking-widest uppercase">Solana Trend Hunter</span>
          </div>
        </div>

        {/* Stats Counter */}
        {stats && (
            <div className="hidden lg:flex items-center gap-2 bg-claw-panel px-4 py-2 rounded-full border border-claw-dim/20">
                <Activity size={16} className="text-green-400 animate-pulse" />
                <span className="text-xs text-claw-dim">SCANNED:</span>
                <span className="font-mono font-bold text-white">{stats.totalProcessed.toLocaleString()}</span>
            </div>
        )}

        {/* Nav / Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search tokens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-full bg-claw-panel py-2 pl-10 pr-4 text-sm text-white placeholder-claw-dim ring-1 ring-transparent transition-all focus:ring-claw-primary/50"
            />
            <Search className="absolute left-3 top-2.5 text-claw-dim group-focus-within:text-claw-primary" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
            <a 
                href="https://x.com/ClawSeek_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-claw-panel text-white hover:bg-claw-dim/20 transition-colors border border-claw-dim/20"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <button className="rounded-lg p-2 text-white hover:bg-claw-panel">
                <Menu />
            </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
            <a 
                href="https://x.com/ClawSeek_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-claw-panel text-white hover:bg-claw-dim/20 transition-colors border border-claw-dim/20"
                aria-label="Follow us on X"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <button className="rounded-full bg-claw-primary px-6 py-2 font-bold text-white transition-transform hover:scale-105 hover:shadow-lg hover:shadow-claw-primary/25">
                Connect Wallet
            </button>
        </div>
      </div>
    </header>
  );
};
