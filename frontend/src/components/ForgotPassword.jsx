import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useTranslation } from 'react-i18next';

function ForgotPassword() {
  const { t } = useTranslation();
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
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const redirectToUrl = `${frontendUrl}/reset-password`;

      console.log('Sending reset link with redirectTo:', redirectToUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (error) throw error;

      setMessage(t('auth.forgot_password_success'));
    } catch (err) {
      setError(err.message || t('auth.forgot_password_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2>{t('auth.forgot_password_title')}</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>{t('auth.forgot_password_instructions')}</p>
      {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>{t('auth.email_label')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? t('auth.sending') : t('auth.send_reset_link')}
        </button>
      </form>
      <button onClick={() => navigate('/login')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', width: '100%' }}>{t('auth.back_to_login')}</button>
    </div>
  );
}

export default ForgotPassword;
