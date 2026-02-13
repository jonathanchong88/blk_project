import React from 'react';

function Navbar({ view, setView, logout }) {
  return (
    <nav className="navbar">
      <h1 className="navbar-brand">Todo App</h1>
      <div className="navbar-menu">
        <button 
          className={`nav-item ${view === 'todos' ? 'active' : ''}`} 
          onClick={() => setView('todos')}
        >
          Todos
        </button>
        <button 
          className={`nav-item ${view === 'upload' ? 'active' : ''}`} 
          onClick={() => setView('upload')}
        >
          Upload
        </button>
        <button 
          className={`nav-item ${view === 'events' ? 'active' : ''}`} 
          onClick={() => setView('events')}
        >
          Events
        </button>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;