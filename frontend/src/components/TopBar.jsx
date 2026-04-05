import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function TopBar({ token, logout }) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="topbar">
      <div className="topbar-menu">
        <select 
          value={i18n.language || 'en'} 
          onChange={handleLanguageChange}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        >
          <option value="en">English</option>
          <option value="zh">简体中文</option>
        </select>
        
        {token ? (
          <>
            <NavLink to="/profile" className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>
              {t('topbar.profile')}
            </NavLink>
            <button onClick={logout} className="topbar-link logout-btn">
              {t('topbar.logout')}
            </button>
          </>
        ) : (
          <NavLink to="/login" className="topbar-link">{t('topbar.login')}</NavLink>
        )}
      </div>
    </div>
  );
}

export default TopBar;