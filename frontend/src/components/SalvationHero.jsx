import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

function SalvationHero() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-900">
      {/* Background Image / Placeholder for hand */}
      <motion.div 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(24,24,27,0.3), rgba(24,24,27,0.9)), url("https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=2071&auto=format&fit=crop")' }}
      ></motion.div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center"
        >
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Salvation
            </h1>
            <div className="w-16 h-1 bg-[#B87D00] mx-auto mb-8 rounded-full"></div>
            <p className="text-lg md:text-2xl text-gray-300 max-w-2xl font-medium tracking-tight">
              The beginning of a new life.
            </p>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
        >
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Discover More</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="text-[#B87D00] w-6 h-6 opacity-80" />
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationHero;