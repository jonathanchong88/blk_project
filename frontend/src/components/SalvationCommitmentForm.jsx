import React, { useState } from 'react';

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
      <div className="py-20 px-4 bg-[#FE5708] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-tight">Welcome Home!</h2>
          <p className="text-xl">We are so excited for you. We'll be in touch soon with resources to help you on your journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-extrabold mb-2 text-center uppercase tracking-tighter text-gray-900">I Made a Decision</h2>
        <p className="text-center text-gray-500 mb-10 text-lg">We would love to connect with you.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-[#FE5708] transition-colors">First Name</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE5708] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder-gray-400"
                placeholder="Jane"
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-[#FE5708] transition-colors">Last Name</label>
              <input
                type="text"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE5708] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder-gray-400"
                placeholder="Doe"
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-[#FE5708] transition-colors">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE5708] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder-gray-400"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-[#FE5708] transition-colors">Phone Number (Optional)</label>
            <input
              type="tel"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE5708] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder-gray-400"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-[#FE5708] transition-colors">My Decision</label>
            <select
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE5708] focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
              value={formData.decision_type}
              onChange={e => setFormData({...formData, decision_type: e.target.value})}
            >
              <option>I accepted Jesus today</option>
              <option>I'm recommitting my life</option>
              <option>I want to know more</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-5 bg-[#FE5708] text-white font-bold text-lg uppercase tracking-widest rounded-lg hover:bg-[#e04f07] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Decision'}
          </button>
          
          {status === 'error' && (
            <p className="text-red-500 text-center mt-4 font-medium">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default SalvationCommitmentForm;