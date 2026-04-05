import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useTranslation } from 'react-i18next';

function Auth({ setToken, BASE_URL }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const checkEmailExists = async (emailToCheck) => {
    if (isLoginView || !emailToCheck) return;
    
    // Simple email regex for quick validation before API call
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) return;

    setCheckingEmail(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });
      if (response.ok) {
        const data = await response.json();
        setEmailExists(data.exists);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailExists) setEmailExists(false); // Reset exists status when typing
  };

  const auth = async (e) => {
    e.preventDefault();
    if (!isLoginView && emailExists) {
        alert(t('auth.email_exists_alert'));
        return;
    }
    setLoading(true);
    
    try {
      if (isLoginView) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          const tempToken = data.session.access_token;
          
          // Before proceeding, check if the account is approved
          try {
            const profileRes = await fetch(`${BASE_URL}/api/profile`, {
              headers: { 'Authorization': `Bearer ${tempToken}` }
            });
            
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData.is_active === false) {
                // Not approved - sign out and block
                await supabase.auth.signOut();
                alert(t('auth.account_under_review'));
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.error('Error checking account status:', err);
          }

          setToken(tempToken);
          localStorage.setItem('token', tempToken);
          navigate(from, { replace: true });
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert(t('auth.invalid_email'));
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        
        if (error) throw error;
        
        alert(t('auth.signup_success'));
        setIsLoginView(true);
        setPassword('');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1>{isLoginView ? t('auth.login') : t('auth.signup')}</h1>
      <form onSubmit={auth} className="auth-form">
        {!isLoginView && (
          <input 
            type="text" 
            placeholder={t('auth.username_placeholder')} 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required={!isLoginView}
          />
        )}
        <input 
          type="email" 
          placeholder={t('auth.email_placeholder')} 
          value={email} 
          onChange={handleEmailChange} 
          onBlur={e => checkEmailExists(e.target.value)}
          required
        />
        {!isLoginView && emailExists && (
          <p style={{ color: '#ff4d4d', fontSize: '0.85rem', margin: '0 0 1rem 0', textAlign: 'left', width: '100%' }}>
            {t('auth.email_exists_alert')}
          </p>
        )}
        <div className="password-input-wrapper">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder={t('auth.password_placeholder')} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
          />
          <button 
            type="button" 
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        </div>
        <button type="submit" disabled={loading || checkingEmail || (!isLoginView && emailExists)}>
          {loading ? t('auth.processing') : (isLoginView ? t('auth.login') : t('auth.signup'))}
        </button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {isLoginView && (
          <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>
            {t('auth.forgot_password')}
          </button>
        )}
        <button className="link-btn" onClick={() => setIsLoginView(!isLoginView)}>
          {isLoginView ? t('auth.need_account_signup') : t('auth.have_account_login')}
        </button>
      </div>
    </div>
  );
}

export default Auth;