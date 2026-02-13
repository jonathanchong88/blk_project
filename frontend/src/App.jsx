import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TodoList from './components/TodoList';
import ImageUpload from './components/ImageUpload';
import Events from './components/Events';
import EventDetail from './components/EventDetail';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/todos`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('todos'); // 'todos' or 'upload'
  const [selectedEventId, setSelectedEventId] = useState(null);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setView('todos');
  };

  if (!token) {
    return <Auth setToken={setToken} BASE_URL={BASE_URL} />;
  }

  return (
    <div className="App">
      <Navbar view={view} setView={setView} logout={logout} />
      <Hero />
      <div className="main-content">
        {view === 'todos' ? (
          <TodoList token={token} API_URL={API_URL} />
        ) : view === 'upload' ? (
          <ImageUpload token={token} BASE_URL={BASE_URL} />
        ) : view === 'events' ? (
          <Events token={token} BASE_URL={BASE_URL} onEventClick={(id) => { setSelectedEventId(id); setView('event-detail'); }} />
        ) : (
          <EventDetail token={token} BASE_URL={BASE_URL} eventId={selectedEventId} onBack={() => setView('events')} />
        )}
      </div>
    </div>
  );
}

export default App;