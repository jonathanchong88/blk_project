import React from 'react';
import { NavLink } from 'react-router-dom';

function TopBar({ token, logout }) {
  return (
    <div className="topbar">
      <div className="topbar-menu">
        {token ? (
          <>
            <NavLink to="/profile" className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>
              Profile
            </NavLink>
            <button onClick={logout} className="topbar-link logout-btn">
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="topbar-link">Login</NavLink>
        )}
      </div>
    </div>
  );
}

export default TopBar;