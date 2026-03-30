import React from 'react';
import { motion } from 'framer-motion';

function SalvationTeaching() {
  return (
    <div className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
        >
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-black tracking-tighter uppercase">What Now?</h2>
            <div className="w-12 h-1 bg-[#B87D00] mx-auto rounded-full mb-8"></div>
            
            <p className="max-w-xl mx-auto text-base md:text-lg text-gray-500 font-medium leading-relaxed mb-8">
                If you need a decision to follow Jesus, we want to know about it. We want to send you some resources to help on your journey.
            </p>
            
            <p className="max-w-2xl mx-auto text-base md:text-xl text-gray-800 italic font-serif leading-relaxed">
                "Salvation is not just a moment; it's the beginning of a relationship. It's a step from death to life."
            </p>
        </motion.div>
        
        {/* Prayer Card */}
        <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl bg-gray-50 rounded-[2.5rem] p-12 md:p-16 text-center border-2 border-black/5 shadow-sm relative overflow-hidden"
        >
            {/* Subtle accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-[#B87D00]"></div>

            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-black italic font-serif">
                A Prayer for Salvation
            </h3>
            
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium mx-auto max-w-2xl">
              "Dear God, I know I'm a sinner, and I ask for your forgiveness. I believe Jesus Christ is Your Son. I believe in my sin and raised Him from the dead. I want to trust and follow Him as Lord, from this day forward. I pray this is in the name of Jesus. <span className="text-[#B87D00] font-bold">Amen.</span>"
            </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationTeaching;