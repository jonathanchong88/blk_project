import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Auth({ setToken, BASE_URL }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const auth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLoginView ? `${BASE_URL}/api/login` : `${BASE_URL}/api/signup`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (isLoginView) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          navigate(from, { replace: true });
        } else {
        navigate('/verify-email', { state: { email: email } });
        }
        setUsername('');
        setPassword('');
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          alert(data.message);
        } catch {
          alert('Request failed: ' + response.status + ' ' + response.statusText);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1>{isLoginView ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={auth} className="auth-form">
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
        <div className="password-input-wrapper">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
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
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
        </button>
      </form>
      <button className="link-btn" onClick={() => setIsLoginView(!isLoginView)}>
        {isLoginView ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
    </div>
  );
}

export default Auth;