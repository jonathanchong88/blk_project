import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Sidebar({ userRole }) {
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const canManageUsers = ['developer', 'admin', 'editor'].includes(userRole);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [location, isMobile]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {!isMenuOpen && (
        <button className="sidebar-toggle-btn" onClick={toggleMenu} aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      )}
      <aside 
        className={`sidebar ${!isMenuOpen ? 'closed' : ''}`}
        style={isMobile ? { position: 'fixed', top: 0, left: 0, height: '100%', width: isMenuOpen ? '50%' : undefined, zIndex: 1000 } : { position: 'relative', zIndex: 1000 }}
      >
        <div className="sidebar-header">
          <div>
            <h2 className="sidebar-brand">Power Station</h2>
            <div className="sidebar-subtitle">(LCMS Balakong)</div>
          </div>
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

          <div className="sidebar-section-header">Worship</div>
          <NavLink to="/worship/songs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Song
          </NavLink>
          <NavLink to="/worship/band" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Band
          </NavLink>
          <NavLink to="/worship/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            Schedule
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;