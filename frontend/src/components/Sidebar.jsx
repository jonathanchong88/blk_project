import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ userRole }) {
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 768);
  const canManageUsers = ['developer', 'admin', 'editor'].includes(userRole);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {!isMenuOpen && (
        <button className="sidebar-toggle-btn" onClick={toggleMenu} aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      )}
      <aside className={`sidebar ${!isMenuOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <div>
            <h2 className="sidebar-brand">Power Station</h2>
            <div className="sidebar-subtitle">(LCMS Balakong)</div>
          </div>
          <button className="hamburger-btn" onClick={toggleMenu} aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Events
          </NavLink>
          {canManageUsers && (
            <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Users
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;