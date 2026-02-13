import React, { useState } from 'react';

function Auth({ setToken, BASE_URL }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);

  const auth = async (e) => {
    e.preventDefault();
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
        } else {
          alert('Signup successful! Please login.');
          setIsLoginView(true);
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
    }
  };

  return (
    <div className="App login-page">
      <h1>{isLoginView ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={auth} className="auth-form">
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit">{isLoginView ? 'Login' : 'Sign Up'}</button>
      </form>
      <button className="link-btn" onClick={() => setIsLoginView(!isLoginView)}>
        {isLoginView ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
    </div>
  );
}

export default Auth;