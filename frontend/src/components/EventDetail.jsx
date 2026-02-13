import React, { useState, useEffect } from 'react';

function EventDetail({ token, BASE_URL, eventId, onBack }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEvent(data);
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId, token, BASE_URL]);

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="event-detail-container">
            <button onClick={onBack} className="back-btn">← Back to Events</button>
            <div className="event-detail-header" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}>
                <div className="event-detail-title">
                    <h1>{event.title}</h1>
                    <span className="event-date">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            </div>
            <div className="event-detail-content">
                <div className="event-info-card">
                    <h3>Details</h3>
                    <p><strong>Location:</strong> {event.location || 'Online'}</p>
                    <p className="event-description">{event.description}</p>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;