import React from 'react';

function Navbar({ view, setView, logout, token }) {
  return (
    <nav className="navbar">
      <h1 className="navbar-brand">Todo App</h1>
      <div className="navbar-menu">
        <button 
          className={`nav-item ${view === 'home' ? 'active' : ''}`} 
          onClick={() => setView('home')}
        >
          Home
        </button>
        <button 
          className={`nav-item ${view === 'events' ? 'active' : ''}`} 
          onClick={() => setView('events')}
        >
          Events
        </button>
        {token ? (
          <>
            <button 
              className={`nav-item ${view === 'profile' ? 'active' : ''}`} 
              onClick={() => setView('profile')}
            >
              Profile
            </button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <button onClick={() => setView('login')} className="nav-item">Login</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;