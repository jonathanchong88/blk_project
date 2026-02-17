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
    const [setlist, setSetlist] = useState([]);
    const [showSongModal, setShowSongModal] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const [songSearchQuery, setSongSearchQuery] = useState('');
    const [scheduledTeam, setScheduledTeam] = useState([]);
    const [checkInList, setCheckInList] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
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

    // Fetch Setlist
    useEffect(() => {
        if (id) {
            const fetchSetlist = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/events/setlist?event_id=${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSetlist(data);
                    }
                } catch (error) { console.error(error); }
            };
            fetchSetlist();
        }
    }, [id, BASE_URL]);

    // Fetch Scheduled Team
    useEffect(() => {
        if (id) {
            const fetchTeam = async () => {
                try {
                    // Fetching all and filtering client-side since backend filter might not be ready
                    const response = await fetch(`${BASE_URL}/api/worship/schedule`);
                    if (response.ok) {
                        const data = await response.json();
                        setScheduledTeam(data.filter(entry => entry.event_id === parseInt(id)));
                    }
                } catch (error) { console.error(error); }
            };
            fetchTeam();
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

    // Fetch Check-in List (for admins)
    useEffect(() => {
        if (id && token && ['admin', 'editor', 'developer'].includes(userRole)) {
            const fetchCheckInList = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/events/checkin?event_id=${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setCheckInList(data);
                    }
                } catch (error) {
                    console.error('Error fetching check-in list:', error);
                }
            };
            fetchCheckInList();
        }
    }, [id, token, userRole, BASE_URL, attendees]);

    // Fetch All Users (for admin check-in selection)
    useEffect(() => {
        if (token && ['admin', 'editor', 'developer'].includes(userRole)) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAllUsers(data);
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        }
    }, [token, userRole, BASE_URL]);

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

    const fetchAllSongs = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/songs`);
            if (response.ok) {
                const data = await response.json();
                setAllSongs(data);
            }
        } catch (error) { console.error(error); }
    };

    const handleAddSong = async (songId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/events/setlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ event_id: id, song_id: songId, key_note: '' })
            });
            if (response.ok) {
                const newEntry = await response.json();
                setSetlist([...setlist, newEntry]);
                setShowSongModal(false);
            }
        } catch (error) { console.error(error); }
    };

    const handleRemoveSong = async (entryId) => {
        if (!window.confirm('Remove this song from setlist?')) return;
        try {
            const response = await fetch(`${BASE_URL}/api/events/setlist?id=${entryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) setSetlist(setlist.filter(s => s.id !== entryId));
        } catch (error) { console.error(error); }
    };

    const handleUpdateKey = async (entryId, currentKey) => {
        const newKey = prompt("Enter Key (e.g., G, D, Bb):", currentKey || '');
        if (newKey === null) return;

        try {
            const response = await fetch(`${BASE_URL}/api/events/setlist`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: entryId, key_note: newKey })
            });

            if (response.ok) {
                const updatedEntry = await response.json();
                setSetlist(setlist.map(s => s.id === entryId ? updatedEntry : s));
            }
        } catch (error) { console.error(error); }
    };

    const handleReorder = async (index, direction) => {
        if (index + direction < 0 || index + direction >= setlist.length) return;

        const currentItem = setlist[index];
        const swapItem = setlist[index + direction];

        // Optimistic update
        const newSetlist = [...setlist];
        newSetlist[index] = swapItem;
        newSetlist[index + direction] = currentItem;
        setSetlist(newSetlist);

        try {
            await Promise.all([
                fetch(`${BASE_URL}/api/events/setlist`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: currentItem.id, sequence_number: swapItem.sequence_number })
                }),
                fetch(`${BASE_URL}/api/events/setlist`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: swapItem.id, sequence_number: currentItem.sequence_number })
                })
            ]);
        } catch (error) { console.error("Failed to reorder", error); }
    };

    const handleCheckInToggle = async (userId, currentStatus) => {
        try {
            const response = await fetch(`${BASE_URL}/api/events/checkin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ event_id: id, user_id: userId, checked_in: !currentStatus })
            });
            
            if (response.ok) {
                setCheckInList(prev => prev.map(u => 
                    u.id === userId ? { ...u, checked_in: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Error toggling check-in:', error);
        }
    };

    const handleAddCheckIn = async (userId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/events/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ event_id: id, user_id: userId, checked_in: true })
            });
            
            if (response.ok) {
                // Refresh check-in list
                const checkInRes = await fetch(`${BASE_URL}/api/events/checkin?event_id=${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (checkInRes.ok) {
                    setCheckInList(await checkInRes.json());
                }
                setShowUserDropdown(false);
                setUserSearchQuery('');
            }
        } catch (error) {
            console.error('Error adding check-in:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    const isPastEvent = new Date(event.date) < new Date();
    
    const isEventDay = (() => {
        const t = new Date();
        const s = new Date(event.date);
        const e = event.end_date ? new Date(event.end_date) : new Date(event.date);
        
        const tDate = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        const sDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const eDate = new Date(e.getFullYear(), e.getMonth(), e.getDate());
        
        return tDate >= sDate && tDate <= eDate;
    })();

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
                    <button onClick={handleAttend} className={`attend-btn ${isAttending ? 'attending' : ''}`} disabled={isPastEvent} style={isPastEvent ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>{isAttending ? 'RSVP\'d ✓' : 'RSVP'}</button>
                </div>
            </div>

            {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                <div className="event-info-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>Check-in Management</h3>
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <div 
                            onClick={() => isEventDay && setShowUserDropdown(!showUserDropdown)}
                            style={{ 
                                padding: '10px', 
                                borderRadius: '4px', 
                                border: '1px solid #ddd', 
                                cursor: isEventDay ? 'pointer' : 'not-allowed',
                                backgroundColor: isEventDay ? 'white' : '#f9f9f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: isEventDay ? 1 : 0.6
                            }}
                            title={!isEventDay ? "Check-in is only available on the event day" : ""}
                        >
                            <span style={{ color: '#888' }}>+ Add / Check-in User</span>
                            <span style={{ fontSize: '0.8rem' }}>▼</span>
                        </div>

                        {showUserDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                marginTop: '5px'
                            }}>
                                <div style={{ padding: '8px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: 'white' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search user..." 
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #eee', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}
                                        autoFocus
                                    />
                                </div>
                                {allUsers.filter(u => (u.name || u.username).toLowerCase().includes(userSearchQuery.toLowerCase())).map(user => {
                                    const isCheckedIn = checkInList.some(c => c.id === user.id && c.checked_in);
                                    return (
                                        <div 
                                            key={user.id} 
                                            onClick={() => isEventDay && !isCheckedIn && handleAddCheckIn(user.id)}
                                            style={{
                                                padding: '10px',
                                                cursor: (isCheckedIn || !isEventDay) ? 'default' : 'pointer',
                                                borderBottom: '1px solid #f5f5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                opacity: isCheckedIn ? 0.5 : 1,
                                                backgroundColor: isCheckedIn ? '#f9f9f9' : 'white'
                                            }}
                                            onMouseEnter={(e) => !isCheckedIn && (e.currentTarget.style.backgroundColor = '#f0f7ff')}
                                            onMouseLeave={(e) => !isCheckedIn && (e.currentTarget.style.backgroundColor = 'white')}
                                        >
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>
                                                {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name || user.username).charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '500' }}>{user.name || user.username}</div>
                                            </div>
                                            {isCheckedIn && <span style={{ fontSize: '0.8rem', color: 'green' }}>Checked In</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {checkInList.length === 0 ? <p style={{ color: '#666' }}>No attendees yet.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                            {checkInList.map(user => (
                                <div 
                                    key={user.id} 
                                    onClick={() => isEventDay && handleCheckInToggle(user.id, user.checked_in)}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        cursor: isEventDay ? 'pointer' : 'not-allowed',
                                        opacity: isEventDay ? 1 : 0.6
                                    }}
                                    title={user.name || user.username}
                                >
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '50%', 
                                        overflow: 'hidden', 
                                        backgroundColor: '#eee', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontWeight: 'bold', 
                                        color: '#666', 
                                        fontSize: '1.2rem',
                                        marginBottom: '4px',
                                        border: user.checked_in ? '3px solid #4caf50' : '3px solid transparent',
                                        boxSizing: 'border-box'
                                    }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            (user.name || user.username || '?').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: user.checked_in ? '#4caf50' : 'inherit', fontWeight: user.checked_in ? 'bold' : 'normal' }}>
                                        {user.name || user.username}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            )}

            <div className="event-info-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>Worship Setlist</h3>
                    {token && ['admin', 'editor', 'developer'].includes(userRole) && !isPastEvent && (
                        <button 
                            onClick={() => { setShowSongModal(true); fetchAllSongs(); }}
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.85rem', 
                                cursor: 'pointer', 
                                backgroundColor: '#e3f2fd', 
                                color: '#1565c0', 
                                border: 'none', 
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}
                        >
                            + Add Song
                        </button>
                    )}
                </div>
                {setlist.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No songs added yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {setlist.map((entry, index) => (
                            <div key={entry.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '12px 20px', 
                                backgroundColor: 'white', 
                                borderBottom: '1px solid #f0f0f0',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                        <button onClick={() => handleReorder(index, -1)} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: index === 0 ? '#eee' : '#888', lineHeight: 1 }}>▲</button>
                                        <button onClick={() => handleReorder(index, 1)} disabled={index === setlist.length - 1} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: index === setlist.length - 1 ? '#eee' : '#888', lineHeight: 1 }}>▼</button>
                                    </div>
                                )}
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    color: '#555', 
                                    marginRight: '20px', 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#eee', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.8rem'
                                }}>{index + 1}</div>
                                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/worship/songs/${entry.song.id}`)}>
                                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>{entry.song.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                                        {entry.song.author} 
                                        <span 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (token && ['admin', 'editor', 'developer'].includes(userRole)) {
                                                    handleUpdateKey(entry.id, entry.key_note);
                                                }
                                            }}
                                            title="Click to edit key"
                                            style={{ 
                                                cursor: token && ['admin', 'editor', 'developer'].includes(userRole) ? 'pointer' : 'default', 
                                                marginLeft: '8px', 
                                                color: entry.key_note ? '#fff' : '#999',
                                                backgroundColor: entry.key_note ? '#007bff' : '#f0f0f0',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {entry.key_note ? `Key: ${entry.key_note}` : '+ Add Key'}
                                        </span>
                                    </div>
                                </div>
                                {token && ['admin', 'editor', 'developer'].includes(userRole) && (
                                    <button onClick={() => handleRemoveSong(entry.id)} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px', opacity: 0.6 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.6}>×</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {scheduledTeam.length > 0 && (
                <div className="event-info-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>Worship Team</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
                        {scheduledTeam.map(entry => (
                            <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#e3f2fd', 
                                    color: '#1565c0', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '8px',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    overflow: 'hidden'
                                }}>
                                     {entry.member.avatar_url ? <img src={entry.member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : entry.member.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#007bff', backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '10px' }}>{entry.role.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                <h3>RSVPs ({attendees.length})</h3>
                {attendees.length === 0 ? (
                    <p style={{ color: '#666' }}>Be the first to RSVP!</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                        {attendees.map(user => (
                            <div key={user.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '50%', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#eee', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: 'bold', 
                                    color: '#666', 
                                    fontSize: '1.2rem',
                                    marginBottom: '4px'
                                }}>
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (user.name || user.username).charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.name || user.username}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showSongModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <h3>Add Song to Setlist</h3>
                        <input 
                            type="text" 
                            placeholder="Search songs..." 
                            value={songSearchQuery}
                            onChange={e => setSongSearchQuery(e.target.value)}
                            style={{ padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {allSongs.filter(s => s.title.toLowerCase().includes(songSearchQuery.toLowerCase())).map(song => (
                                <div key={song.id} onClick={() => handleAddSong(song.id)} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{song.title}</span>
                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>{song.author}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowSongModal(false)} style={{ marginTop: '10px', backgroundColor: '#6c757d' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetail;