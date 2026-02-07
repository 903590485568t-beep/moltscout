import { motion } from 'framer-motion';
import { Search, Menu, Grab, Activity, AlertTriangle, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
    stats?: {
        totalProcessed: number;
    };
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const Header = ({ stats, searchTerm, setSearchTerm }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [rowCount, setRowCount] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
        try {
            const { data, error } = await supabase.from('official_token').select('id');
            if (error) {
                console.error("DB Check Error:", error);
                setDbStatus('error');
            } else {
                setDbStatus('connected');
                setRowCount(data.length);
            }
        } catch (e) {
            setDbStatus('error');
        }
    };
    checkConnection();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-claw-primary/20 bg-[#050505]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
      {/* SYSTEM STATUS BANNER (DEBUG) */}
      {(dbStatus === 'error' || (dbStatus === 'connected' && rowCount === 0)) && (
          <div className={`w-full py-1 text-[10px] font-mono text-center font-bold flex items-center justify-center gap-2 ${
              dbStatus === 'error' ? 'bg-red-900/80 text-white' : 'bg-yellow-900/80 text-yellow-200'
          }`}>
              {dbStatus === 'error' ? (
                  <>
                    <AlertTriangle size={12} />
                    SYSTEM ALERT: DATABASE DISCONNECTED. CHECK VERCEL ENVIRONMENT VARIABLES.
                  </>
              ) : (
                  <>
                    <Database size={12} />
                    SYSTEM: CONNECTED. DATABASE EMPTY. WAITING FOR HUNTER BOT...
                  </>
              )}
          </div>
      )}
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
            className="text-claw-primary relative"
          >
            <div className="absolute inset-0 blur-sm bg-claw-primary/50 animate-pulse" />
            <Grab size={32} className="relative z-10" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black tracking-wider text-white leading-none drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                $MOLT<span className="text-claw-primary">SCOUT</span>
            </span>
            <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-claw-accent animate-pulse" />
                <span className="text-[10px] text-claw-dim tracking-[0.2em] uppercase">Target Locked</span>
            </div>
          </div>
        </div>

        {/* Stats Counter */}
        {stats && (
            <div className="hidden lg:flex items-center gap-3 bg-black/40 px-6 py-2 rounded-sm border-l-2 border-r-2 border-claw-primary/30">
                <Activity size={16} className="text-claw-primary animate-pulse" />
                <span className="text-xs text-claw-dim font-mono uppercase tracking-widest">Scanned_Targets:</span>
                <span className="font-mono font-bold text-white text-lg tabular-nums shadow-red-glow">{stats.totalProcessed.toLocaleString()}</span>
            </div>
        )}

        {/* Nav / Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="SEARCH_DB..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-sm bg-black/50 py-2 pl-10 pr-4 text-sm text-claw-primary font-mono placeholder-claw-dim/50 border border-claw-dim/20 focus:border-claw-primary/50 focus:bg-black/80 transition-all outline-none uppercase tracking-wide"
            />
            <Search className="absolute left-3 top-2.5 text-claw-dim group-focus-within:text-claw-primary" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
            <a 
                href="https://x.com/MoltScout" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-sm bg-black/50 text-white hover:bg-claw-primary hover:text-black transition-colors border border-claw-dim/20"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <button className="rounded-sm p-2 text-white hover:bg-claw-dim/20 border border-transparent hover:border-claw-dim/20">
                <Menu />
            </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
            <a 
                href="https://x.com/MoltScout" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-sm bg-black/50 text-white hover:bg-claw-primary hover:text-black transition-all border border-claw-dim/20 group relative overflow-hidden"
                aria-label="Follow us on X"
            >
                <div className="absolute inset-0 bg-claw-primary/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <button className="rounded-sm bg-claw-primary px-6 py-2 font-bold font-mono text-black uppercase tracking-wider transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] clip-path-button">
                Connect_Wallet
            </button>
        </div>
      </div>
    </header>
  );
};
