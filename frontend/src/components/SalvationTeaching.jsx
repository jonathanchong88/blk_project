import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

function SalvationTeaching() {
  return (
    <div className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold mb-6 text-gray-900 uppercase tracking-tighter">What Now?</h2>
            <div className="w-24 h-1 bg-[#FE5708] mx-auto"></div>
        </div>
        
        <div className="prose max-w-none text-xl text-gray-600 mb-16 leading-relaxed text-center">
          <p className="mb-6">
            If you made a decision to follow Jesus, we want to know about it. We want to send you some resources to help you on your journey.
          </p>
          <p>
            Salvation is not just a moment; it’s the beginning of a relationship. It’s a step from death to life.
          </p>
        </div>

        {/* Prayer Card */}
        <div className="bg-gray-50 p-10 rounded-xl border-l-8 border-[#FE5708] my-16 shadow-lg relative overflow-hidden">
          <h3 className="text-3xl font-bold mb-6 text-gray-900 relative z-10">A Prayer for Salvation</h3>
          <p className="text-2xl italic text-gray-700 leading-relaxed font-serif relative z-10">
            "Dear God, I know I’m a sinner, and I ask for your forgiveness. I believe Jesus Christ is Your Son. I believe that He died for my sin and that you raised Him to life. I want to trust Him as my Savior and follow Him as Lord, from this day forward. Guide my life and help me to do your will. I pray this in the name of Jesus. Amen."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-[#FE5708] p-4 rounded-full text-white mb-6 shadow-md">
                <Heart size={32} />
            </div>
            <h3 className="text-3xl font-bold mb-4 uppercase tracking-tight text-gray-900">Believe</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Believing in Jesus is the first step. It's trusting that He is who He says He is and that He did what He said He did.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300">
            <div className="bg-[#FE5708] p-4 rounded-full text-white mb-6 shadow-md">
                <MessageCircle size={32} />
            </div>
            <h3 className="text-3xl font-bold mb-4 uppercase tracking-tight text-gray-900">Confess</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Confessing is simply agreeing with God about your sin and your need for a Savior. It's speaking out the truth of your belief.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalvationTeaching;