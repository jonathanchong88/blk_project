import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Events({ token, BASE_URL }) {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUserRole(data.role);
      });
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    if (token) {
      const fetchUserLikes = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/likes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserLikes(new Set(data));
          }
        } catch (error) {
          console.error('Error fetching likes:', error);
        }
      };
      fetchUserLikes();
    } else {
      setUserLikes(new Set());
    }
  }, [token, BASE_URL]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for upcoming events (date >= today)
        const now = new Date();
        setEvents(data.filter(event => new Date(event.date) >= now));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const toggleLike = async (e, eventId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please login to like events");
      return;
    }

    // Optimistic update
    const isLiked = userLikes.has(eventId);
    const newLikes = new Set(userLikes);
    if (isLiked) newLikes.delete(eventId);
    else newLikes.add(eventId);
    setUserLikes(newLikes);

    setEvents(events.map(ev => 
      ev.id === eventId ? { ...ev, likes_count: ev.likes_count + (isLiked ? -1 : 1) } : ev
    ));

    try {
      await fetch(`${BASE_URL}/api/likes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ event_id: eventId })
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredEvents = events
    .filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Upcoming Events</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/events/past')} title="View Past Events" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'black' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </button>
          {token && ['admin', 'editor', 'developer'].includes(userRole) && (
            <button onClick={() => navigate('/events/create')} title="Create Event" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'black' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search events / 搜索活动"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', flex: 1, boxSizing: 'border-box' }}
        />
        <button 
          onClick={toggleSort}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #ddd', 
            backgroundColor: 'white', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'black',
            gap: '5px'
          }}
          title={sortOrder === 'asc' ? "Sort Descending" : "Sort Ascending"}
        >
          <span>Sorting</span>
          {sortOrder === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
          )}
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888', fontSize: '1.2rem' }}>Empty Result</div>
      ) : (Object.entries(filteredEvents.reduce((acc, event) => {
        const date = new Date(event.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(event);
        return acc;
      }, {})).map(([month, monthEvents]) => (
        <div key={month} className="month-group">
          <h3 className="month-header">{month}</h3>
          <div className="events-grid">
            {monthEvents.map(event => (
              <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
                <div className="event-image" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}>
                  <div className="event-date-badge">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-meta">
                    {new Date(event.date).toLocaleDateString([], {month: 'short', day: 'numeric'})}, {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {event.end_date && (
                      <>
                        {' - '}
                        {new Date(event.date).toDateString() !== new Date(event.end_date).toDateString() && <>{new Date(event.end_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}, </>}
                        {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </>
                    )}
                    {' • '}{event.location || 'Online'}
                  </p>
                  <p className="event-desc">{event.description}</p>
                  <div className="card-actions">
                    <button className={`icon-btn like-icon-btn ${userLikes.has(event.id) ? 'liked' : ''}`} onClick={(e) => toggleLike(e, event.id)} title="Like">
                      <svg className="like-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {event.likes_count > 0 && <span style={{marginLeft: '5px', fontSize: '0.9rem'}}>{event.likes_count}</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )))}
    </div>
  );
}

export default Events;