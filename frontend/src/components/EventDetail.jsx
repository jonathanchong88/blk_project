import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EventDetail({ token, BASE_URL }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [isAttending, setIsAttending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/events/${id}`, {
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

        if (id) {
            fetchEvent();
        }
    }, [id, token, BASE_URL]);

    // Fetch attendees
    useEffect(() => {
        if (id) {
            const fetchAttendees = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/attendees?event_id=${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setAttendees(data);
                    }
                } catch (error) {
                    console.error('Error fetching attendees:', error);
                }
            };
            fetchAttendees();
        }
    }, [id, BASE_URL]);

    useEffect(() => {
        if (token) {
            fetch(`${BASE_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setUserRole(data.role);
                    setCurrentUserId(data.id);
                }
            });
        }
    }, [token, BASE_URL]);

    useEffect(() => {
        if (token && id) {
            const fetchLikeStatus = async () => {
                 try {
                    const response = await fetch(`${BASE_URL}/api/likes`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsLiked(data.includes(parseInt(id)));
                    }
                } catch (error) {
                    console.error('Error fetching like status:', error);
                }
            };
            fetchLikeStatus();
        }
    }, [token, BASE_URL, id]);

    useEffect(() => {
        if (currentUserId && attendees.length > 0) {
            setIsAttending(attendees.some(u => u.id === currentUserId));
        } else {
            setIsAttending(false);
        }
    }, [currentUserId, attendees]);

    const handleAttend = async () => {
        if (!token) {
            alert("Please login to join events");
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/attendees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ event_id: id })
            });
            if (response.ok) {
                // Refresh attendees list
                const attendeesRes = await fetch(`${BASE_URL}/api/attendees?event_id=${id}`);
                const attendeesData = await attendeesRes.json();
                setAttendees(attendeesData);
            }
        } catch (e) { console.error(e); }
    };

    const toggleLike = async () => {
        if (!token) {
            alert("Please login to like events");
            return;
        }

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setEvent(prev => ({
            ...prev,
            likes_count: (prev.likes_count || 0) + (newIsLiked ? 1 : -1)
        }));

        try {
            await fetch(`${BASE_URL}/api/likes`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ event_id: id })
            });
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                navigate('/events');
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="event-detail-container">
            <div className="event-detail-actions">
                <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                <div className="action-buttons">
                    <button onClick={toggleLike} className={`icon-btn like-icon-btn ${isLiked ? 'liked' : ''}`} title="Like">
                        <svg className="like-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {event.likes_count > 0 && <span style={{marginLeft: '5px', fontSize: '0.9rem'}}>{event.likes_count}</span>}
                    </button>
                    <button onClick={handleShare} className="icon-btn share-icon-btn" title="Share">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                    {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                        <button onClick={() => navigate(`/events/${id}/edit`)} className="icon-btn" title="Edit Event" style={{ color: '#007bff' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    )}
                    {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                        <button onClick={() => setShowDeleteDialog(true)} className="icon-btn delete-icon-btn" title="Delete Event">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    )}
                </div>
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
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleAttend} className={`attend-btn ${isAttending ? 'attending' : ''}`}>{isAttending ? 'I am going ✓' : 'I am going'}</button>
                </div>
            </div>
            {showDeleteDialog && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this event?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setShowDeleteDialog(false)} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
                            <button onClick={confirmDelete} className="delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="attendees-section">
                <h3>Who join ({attendees.length})</h3>
                <div className="attendees-list">
                    {attendees.length === 0 ? <p style={{ color: '#666' }}>Be the first to join!</p> : attendees.map(user => (
                        <div key={user.id} className="attendee-item" title={user.name || user.username}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="attendee-avatar" />
                            ) : (
                                <div className="attendee-avatar placeholder">
                                    {(user.name || user.username).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default EventDetail;