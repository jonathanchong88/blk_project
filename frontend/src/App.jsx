import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Auth from './components/Auth';
import Home from './components/Home';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import UserList from './components/UserList';
import CreateEvent from './components/CreateEvent';
import EditEvent from './components/EditEvent';
import PastEvents from './components/PastEvents';
import ProtectedRoute from './components/ProtectedRoute';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import CreateEditSong from './components/CreateEditSong';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/todos`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

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
    navigate('/');
  };

  return (
    <div className="App">
      <Sidebar userRole={userRole} />
      <div className="app-body">
        <TopBar token={token} logout={logout} />
        <Hero />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home BASE_URL={BASE_URL} token={token} />} />
            <Route path="/login" element={<Auth setToken={setToken} BASE_URL={BASE_URL} />} />
            <Route path="/events" element={<Events token={token} BASE_URL={BASE_URL} />} />
            <Route path="/events/past" element={<PastEvents token={token} BASE_URL={BASE_URL} />} />
            <Route path="/events/:id" element={<EventDetail token={token} BASE_URL={BASE_URL} />} />
            
            <Route path="/events/create" element={
              <ProtectedRoute token={token}><CreateEvent token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/events/:id/edit" element={
              <ProtectedRoute token={token}><EditEvent token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute token={token}><Profile token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute token={token}><EditProfile token={token} BASE_URL={BASE_URL} currentUserRole={userRole} /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute token={token}><UserList token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/users/:id/edit" element={
              <ProtectedRoute token={token}><EditProfile token={token} BASE_URL={BASE_URL} currentUserRole={userRole} /></ProtectedRoute>
            } />
            
            {/* Song Routes */}
            <Route path="/worship/songs" element={<SongList token={token} BASE_URL={BASE_URL} />} />
            <Route path="/worship/songs/create" element={
              <ProtectedRoute token={token}><CreateEditSong token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/worship/songs/:id" element={<SongDetail token={token} BASE_URL={BASE_URL} />} />
            <Route path="/worship/songs/:id/edit" element={
              <ProtectedRoute token={token}><CreateEditSong token={token} BASE_URL={BASE_URL} /></ProtectedRoute>
            } />
            <Route path="/worship/band" element={<div>Band Page (Coming Soon)</div>} />
            <Route path="/worship/schedule" element={<div>Schedule Page (Coming Soon)</div>} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;