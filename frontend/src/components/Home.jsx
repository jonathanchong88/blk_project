import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ BASE_URL, token }) {
  const [events, setEvents] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/events`);
        if (response.ok) {
          const data = await response.json();
          // Filter for upcoming events (date >= today)
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Include events from earlier today
          const upcomingEvents = data.filter(event => new Date(event.date) >= now);
          setEvents(upcomingEvents.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [BASE_URL]);

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
      // Revert on error could go here
    }
  };

  if (events.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No upcoming events at the moment.</div>;
  }

  return (
    <div className="home-container">
      <div className="section-header">
        <h2>Upcoming Events</h2>
        <button className="view-all-btn" onClick={() => navigate('/events')}>View All</button>
      </div>
      <div className="horizontal-scroll-container">
        {events.map(event => (
          <div key={event.id} className="horizontal-card" onClick={() => navigate(`/events/${event.id}`)}>
            <div 
              className="card-image" 
              style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}
            ></div>
            <div className="card-content">
              <h3>{event.title}</h3>
              <p>
                {new Date(event.date).toLocaleDateString()} 
                {event.location ? ` • ${event.location}` : ''}
              </p>
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
  );
}

export default Home;