import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function SalvationTeaching() {
  return (
    <div className="py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
        >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900 uppercase tracking-tighter">What Now?</h2>
            <div className="w-24 h-2 bg-[#FE5708] mx-auto rounded-full mb-10"></div>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
                If you made a decision to follow Jesus, we want to know about it. Salvation is not just a moment; it’s the beginning of a beautiful relationship.
            </p>
        </motion.div>
        
        {/* Prayer Card - Premium Version */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-1 rounded-3xl bg-gradient-to-br from-[#FE5708] to-[#ff8c52] shadow-2xl my-24 overflow-hidden"
        >
          <div className="bg-white rounded-[calc(1.5rem-1px)] p-12 md:p-16 relative overflow-hidden">
            {/* Subtle watermark or pattern icon could go here */}
            <div className="absolute -right-20 -top-20 text-[#FE5708] opacity-5 pointer-events-none">
                <Heart size={400} />
            </div>
            
            <h3 className="text-2xl font-bold mb-8 text-[#FE5708] uppercase tracking-widest">A Prayer for Salvation</h3>
            <p className="text-2xl md:text-3xl italic text-gray-800 leading-snug font-serif relative z-10">
              "Dear God, I know I’m a sinner, and I ask for your forgiveness. I believe Jesus Christ is Your Son. I believe that He died for my sin and that you raised Him to life. I want to trust Him as my Savior and follow Him as Lord, from this day forward. Guide my life and help me to do your will. I pray this in the name of Jesus. <span className="text-[#FE5708] font-bold not-italic">Amen.</span>"
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 mt-28">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group flex flex-col items-center text-center p-10 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100"
          >
            <div className="bg-[#FE5708] p-5 rounded-2xl text-white mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Heart size={36} fill="white" />
            </div>
            <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter text-gray-900">Believe</h3>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Trusting that Jesus is who He says He is. It's moving from self-reliance to God-reliance.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group flex flex-col items-center text-center p-10 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100"
          >
            <div className="bg-black p-5 rounded-2xl text-white mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <MessageCircle size={36} fill="white" />
            </div>
            <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter text-gray-900">Confess</h3>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Agreeing with God about your need for Him. It's speaking out the truth of your new identity in Christ.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SalvationTeaching;