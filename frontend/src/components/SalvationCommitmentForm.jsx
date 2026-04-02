import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, CheckCircle2 } from 'lucide-react';

function SalvationCommitmentForm({ BASE_URL }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    decision_type: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.decision_type) {
      alert("Please select a decision.");
      return;
    }
    setStatus('submitting');

    try {
      const response = await fetch(`${BASE_URL}/api/salvation/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, decision_type: formData.decision_type || 'I accepted Jesus today' })
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
      <div className="py-32 px-6 bg-zinc-50 flex items-center justify-center min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white p-12 md:p-20 rounded-[2.5rem] shadow-sm max-w-2xl w-full text-center border border-zinc-200/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3, duration: 0.8 }}
            className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 size={36} className="text-orange-500" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-zinc-900 tracking-tighter uppercase">Thank You</h2>
          <p className="text-zinc-600 font-medium text-lg leading-relaxed">We have received your decision and someone from our team will reach out to you shortly to walk this journey with you.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 bg-zinc-50 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white border-2 border-black/5 p-8 md:p-12 rounded-[3rem] shadow-xl">
          <h3 className="text-3xl font-black text-center mb-10">I Made a Decision</h3>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400">First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400">My Decision</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={formData.decision_type}
                  onChange={e => setFormData({ ...formData, decision_type: e.target.value })}
                >
                  <option value="" disabled>Select a decision...</option>
                  <option value="I followed Jesus today">I followed Jesus today</option>
                  <option value="I want to learn more">I want to learn more</option>
                  <option value="I need prayer">I need prayer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 bg-[#B87D00] text-white font-bold rounded-xl hover:bg-[#966600] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'submitting' ? (
                "SUBMITTING..."
              ) : (
                <>SUBMIT DECISION <Send size={18} /></>
              )}
            </button>

            <AnimatePresence>
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-center text-sm font-medium"
                >
                  Something went wrong. Please try again.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SalvationCommitmentForm;