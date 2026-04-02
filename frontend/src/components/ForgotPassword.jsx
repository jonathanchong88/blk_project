import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log(import.meta.env.VITE_FRONTEND_URL);
      if (!import.meta.env.VITE_FRONTEND_URL) {
        throw new Error('VITE_FRONTEND_URL is missing. Please check your environment variables.');
      }
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${import.meta.env.VITE_FRONTEND_URL}/reset-password`,
      // });

      if (error) throw error;

      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>Forgot Password</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>Enter your email address and we'll send you a link to reset your password.</p>
      {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <button onClick={() => navigate('/login')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', width: '100%' }}>Back to Login</button>
    </div>
  );
}

export default ForgotPassword;
