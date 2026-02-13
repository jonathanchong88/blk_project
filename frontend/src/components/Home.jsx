import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ BASE_URL }) {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/events`);
        if (response.ok) {
          const data = await response.json();
          // Take the first 10 events
          setEvents(data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [BASE_URL]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  if (events.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No featured events at the moment.</div>;
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="home-container">
      <h2>Featured Events</h2>
      <div className="carousel">
        <button className="carousel-btn prev" onClick={prevSlide}>&#10094;</button>
        <div className="carousel-content" onClick={() => navigate(`/events/${currentEvent.id}`)}>
          <div 
            className="carousel-image" 
            style={{ backgroundImage: `url(${currentEvent.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}
          >
            <div className="carousel-overlay">
              <h3>{currentEvent.title}</h3>
              <p>
                {new Date(currentEvent.date).toLocaleDateString()} 
                {currentEvent.location ? ` • ${currentEvent.location}` : ''}
              </p>
            </div>
          </div>
        </div>
        <button className="carousel-btn next" onClick={nextSlide}>&#10095;</button>
      </div>
      <div className="carousel-indicators">
        {events.map((_, index) => (
          <span 
            key={index} 
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default Home;