import React from 'react';
import { ChevronDown } from 'lucide-react';

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
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif' }}>
          Salvation
        </h1>
        <p className="text-2xl md:text-3xl text-white max-w-3xl font-light tracking-wide drop-shadow-md mb-12">
          The beginning of a new life.
        </p>
        
        <div className="absolute bottom-10 animate-bounce">
            <ChevronDown className="text-white w-10 h-10 opacity-80" />
        </div>
      </div>
    </div>
  );
}

export default SalvationHero;