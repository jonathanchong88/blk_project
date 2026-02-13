import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import UserList from './components/UserList';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/todos`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('home'); // Default to home
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUserRole(data.role);
      })
      .catch(err => console.error('Error fetching user role:', err));
    } else {
      setUserRole(null);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUserRole(null);
    setView('home');
  };

  return (
    <div className="App">
      <Navbar view={view} setView={setView} logout={logout} token={token} userRole={userRole} />
      <Hero />
      <div className="main-content">
        {view === 'home' ? (
          <Home BASE_URL={BASE_URL} onEventClick={(id) => { setSelectedEventId(id); setView('event-detail'); }} />
        ) : view === 'login' ? (
          <Auth setToken={(t) => {
            setToken(t);
            localStorage.setItem('token', t);
            setView('events');
          }} BASE_URL={BASE_URL} />
        ) : view === 'events' ? (
          <Events token={token} BASE_URL={BASE_URL} onEventClick={(id) => { setSelectedEventId(id); setView('event-detail'); }} />
        ) : view === 'event-detail' ? (
          <EventDetail token={token} BASE_URL={BASE_URL} eventId={selectedEventId} onBack={() => setView('events')} />
        ) : view === 'profile' ? ( // Display profile
          token ? <Profile token={token} BASE_URL={BASE_URL} onEditClick={() => setView('edit-profile')} /> : <div style={{textAlign: 'center'}}>Please login to view Profile</div>
        ) : view === 'edit-profile' ? ( // Edit profile
          token ? <EditProfile token={token} BASE_URL={BASE_URL} onSave={() => setView('profile')} onCancel={() => setView('profile')} currentUserRole={userRole} /> : <div style={{textAlign: 'center'}}>Please login to edit Profile</div>
        ) : view === 'users' ? (
          token ? <UserList token={token} BASE_URL={BASE_URL} onEditUser={(id) => { setSelectedUserId(id); setView('edit-user'); }} /> : <div style={{textAlign: 'center'}}>Please login to view Users</div>
        ) : view === 'edit-user' ? (
          token ? <EditProfile token={token} BASE_URL={BASE_URL} userId={selectedUserId} onSave={() => setView('users')} onCancel={() => setView('users')} currentUserRole={userRole} /> : <div style={{textAlign: 'center'}}>Please login to edit User</div>
        ) : ( // Fallback to home
          <Home BASE_URL={BASE_URL} onEventClick={(id) => { setSelectedEventId(id); setView('event-detail'); }} />
        )}
      </div>
    </div>
  );
}

export default App;