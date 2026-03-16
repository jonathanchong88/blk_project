import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, PartyPopper } from 'lucide-react';

function SalvationCommitmentForm({ BASE_URL }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    decision_type: 'I accepted Jesus today'
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch(`${BASE_URL}/api/salvation/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-32 px-6 bg-[#FE5708] text-white text-center flex items-center justify-center min-h-[600px]"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-md">
                <PartyPopper size={64} className="text-white" />
            </div>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter"
          >
            Welcome Home!
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl font-medium opacity-90 leading-relaxed"
          >
            Heaven is rejoicing, and so are we! We are so excited for your decision. One of our team members will be in touch soon with next steps and resources for your journey.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-32 px-6 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-20 rounded-[3rem] shadow-2xl relative"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FE5708] p-5 rounded-3xl shadow-xl text-white">
                <Send size={32} />
            </div>

            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter text-gray-900">I Made a Decision</h2>
                <div className="w-16 h-1.5 bg-[#FE5708] mx-auto rounded-full mb-6"></div>
                <p className="text-gray-500 text-lg font-medium">We would love to hear from you and walk alongside you.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest group-focus-within:text-[#FE5708] transition-colors">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full pb-3 bg-transparent border-b-2 border-gray-100 focus:border-[#FE5708] outline-none transition-all duration-300 text-xl font-bold text-gray-900 placeholder-gray-200"
                    placeholder="e.g. Jane"
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest group-focus-within:text-[#FE5708] transition-colors">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full pb-3 bg-transparent border-b-2 border-gray-100 focus:border-[#FE5708] outline-none transition-all duration-300 text-xl font-bold text-gray-900 placeholder-gray-200"
                    placeholder="e.g. Doe"
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest group-focus-within:text-[#FE5708] transition-colors">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full pb-3 bg-transparent border-b-2 border-gray-100 focus:border-[#FE5708] outline-none transition-all duration-300 text-xl font-bold text-gray-900 placeholder-gray-200"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest group-focus-within:text-[#FE5708] transition-colors">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="w-full pb-3 bg-transparent border-b-2 border-gray-100 focus:border-[#FE5708] outline-none transition-all duration-300 text-xl font-bold text-gray-900 placeholder-gray-200"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="relative group pt-4">
                <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest group-focus-within:text-[#FE5708] transition-colors">My Decision</label>
                <div className="grid grid-cols-1 gap-4">
                    {['I accepted Jesus today', "I'm recommitting my life", 'I want to know more'].map((type) => (
                        <label 
                            key={type}
                            className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${formData.decision_type === type ? 'border-[#FE5708] bg-[#FE5708]/5' : 'border-gray-50 hover:bg-gray-50'}`}
                            onClick={() => setFormData({...formData, decision_type: type})}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${formData.decision_type === type ? 'border-[#FE5708] bg-[#FE5708]' : 'border-gray-200'}`}>
                                {formData.decision_type === type && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className={`text-lg font-bold ${formData.decision_type === type ? 'text-gray-900' : 'text-gray-500'}`}>{type}</span>
                        </label>
                    ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-6 bg-black text-white font-black text-xl uppercase tracking-widest rounded-3xl hover:bg-[#FE5708] transition-all duration-500 transform hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(254,87,8,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {status === 'submitting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Submitting...
                      </span>
                  ) : 'Submit My Decision'}
                </button>
              </div>
              
              <AnimatePresence>
                {status === 'error' && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-center font-bold px-4 pt-4"
                  >
                    Something went wrong. Please check your connection and try again.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationCommitmentForm;