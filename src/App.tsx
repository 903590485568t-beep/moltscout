import { useState } from 'react';
import { Header } from './components/Header';
import { TrendSection } from './components/TrendSection';
import { FeatureCard } from './components/FeatureCard';
import { usePumpPortal } from './hooks/usePumpPortal';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { groups, isConnected, connectionError, stats, solPrice, clawToken } = usePumpPortal(searchTerm);

  return (
    <div className="min-h-screen bg-claw-bg text-claw-text selection:bg-claw-primary selection:text-white relative overflow-hidden">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top Violet Gradient */}
        <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-claw-primary/20 via-claw-primary/5 to-transparent opacity-60" />
        
        {/* Bottom Turquoise Fire Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-claw-accent/15 via-claw-accent/5 to-transparent opacity-80" />
        
        {/* Dynamic Flickering Layer (Bottom) */}
        <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-claw-accent/10 via-transparent to-transparent"
            animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scaleY: [1, 1.1, 1],
            }}
            transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
            style={{ originY: 1 }}
        />

        {/* Floating Bubbles (Smoother) */}
        {[...Array(15)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute rounded-full bg-white/5 blur-[1px]"
             style={{
               width: Math.random() * 100 + 20, // Larger, softer bubbles
               height: Math.random() * 100 + 20,
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100 + 100}%`, // Start well below view
             }}
             animate={{
               y: [0, -2500], // Float WAY up (off screen)
               opacity: [0, 0.3, 0.3, 0], // Stay visible longer, fade only at very end
               scale: [0.8, 1.2, 0.8] 
             }}
             transition={{
               duration: Math.random() * 40 + 30, // Even slower
               repeat: Infinity,
               ease: "linear",
               delay: Math.random() * 20 
             }}
           />
        ))}
      </div>

      <Header stats={stats} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="text-center lg:text-left flex-1">
                <h1 className="mb-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl md:text-7xl text-glow">
                <span className="claw-gradient-text">Hunt</span> The Next<br />
                <span className="text-white">Trend on Solana</span>
                </h1>
                <p className="mx-auto lg:mx-0 max-w-2xl text-lg text-claw-dim text-glow-sm">
                Real-time Pump.fun analysis. We find the alpha before anyone else.
                Follow the claws.
                </p>
            </div>

            {/* Feature Card for $ClawSeek */}
            <div className="flex-shrink-0">
                <FeatureCard token={clawToken} solPrice={solPrice} />
            </div>
          </motion.div>
        </section>

        {/* Dashboard Grid */}
        <div className="mb-6 flex items-center justify-end gap-2 text-xs font-mono">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="font-bold">
              {isConnected ? 'LIVE FEED ACTIVE' : (connectionError || 'CONNECTING...')}
            </span>
          </div>
        </div>

        {groups.every(g => g.tokens.length === 0) && isConnected && (
            <div className="flex flex-col items-center justify-center py-20 text-claw-dim animate-pulse">
                <p className="text-xl">Waiting for new mints...</p>
                <p className="text-sm">Scanning the blockchain for fresh alpha</p>
            </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
           {groups.map((group) => (
             <TrendSection key={group.id} group={group} solPrice={solPrice} />
           ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-claw-dim/10 py-8 text-center text-sm text-claw-dim">
          <p>© 2024 $ClawSeek. Data provided by Pump.fun.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
