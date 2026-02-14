import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PastEvents({ token, BASE_URL }) {
  const [events, setEvents] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for past events
        const now = new Date();
        const pastEvents = data.filter(event => new Date(event.date) < now);
        setEvents(pastEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filteredEvents = events
    .filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Default sort descending for past events

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Past Events</h2>
        <button onClick={() => navigate('/events')} className="back-btn">Back to Upcoming</button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search past events / 搜索过往活动"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888', fontSize: '1.2rem' }}>No past events found</div>
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
                    <button className={`icon-btn like-icon-btn ${userLikes.has(event.id) ? 'liked' : ''}`} title="Like" disabled>
                       {/* Likes are read-only or disabled here for simplicity, or could be enabled if passed down */}
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

export default PastEvents;