import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

function SalvationHero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://elevationchurch.org/wp-content/uploads/2020/06/Salvation-Header-Background-1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-2xl leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Salvation
            </h1>
            <div className="w-24 h-2 bg-[#FE5708] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl md:text-3xl text-gray-100 max-w-2xl font-medium tracking-tight drop-shadow-md mb-8 mx-auto">
              Your journey from death to life begins here. A new chapter of hope, grace, and purpose.
            </p>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
        >
            <span className="text-white text-xs font-bold uppercase tracking-widest opacity-60">Begin your journey</span>
            <ChevronDown className="text-white w-8 h-8 animate-bounce opacity-80" />
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationHero;