import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar({ logout, token, userRole }) {
  const canManageUsers = ['developer', 'admin', 'editor'].includes(userRole);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">Power Station (Balakong LCMS)</NavLink>
      <div className="navbar-menu">
        <NavLink 
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink 
          to="/events"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          Events
        </NavLink>
        {canManageUsers && (
          <NavLink 
            to="/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Users
          </NavLink>
        )}
        {token ? (
          <>
            <NavLink 
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              Profile
            </NavLink>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <NavLink to="/login" className="nav-item">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;