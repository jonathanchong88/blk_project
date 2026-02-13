import React, { useState, useEffect } from 'react';

function EventDetail({ token, BASE_URL, eventId, onBack }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userRole, setUserRole] = useState(null);

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

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                onBack();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="event-detail-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={onBack} className="back-btn">← Back to Events</button>
                {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                    <button onClick={() => setShowDeleteDialog(true)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Event</button>
                )}
            </div>
            <div className="event-detail-header" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}>
                <div className="event-detail-title">
                    <h1>{event.title}</h1>
                    <span className="event-date">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {event.end_date && (
                            <>
                                {' - '}
                                {new Date(event.date).toDateString() !== new Date(event.end_date).toDateString() && (
                                    <>
                                        {new Date(event.end_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{' at '}
                                    </>
                                )}
                                {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </>
                        )}
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
            {showDeleteDialog && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this event?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setShowDeleteDialog(false)} style={{ backgroundColor: '#ccc', color: 'black' }}>Cancel</button>
                            <button onClick={confirmDelete} style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetail;