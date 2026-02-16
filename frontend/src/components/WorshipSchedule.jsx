// frontend/src/components/WorshipSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WorshipSchedule({ token, BASE_URL }) {
  const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [roles, setRoles] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the "Add Assignment" modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newAssignment, setNewAssignment] = useState({ role_id: '', member_id: '' });
  const [showAllMembers, setShowAllMembers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [BASE_URL]);

  const fetchData = async () => {
    try {
      const [eventsRes, scheduleRes, rolesRes, teamRes] = await Promise.all([
        fetch(`${BASE_URL}/api/events`),
        fetch(`${BASE_URL}/api/worship/schedule`),
        fetch(`${BASE_URL}/api/worship/roles`),
        fetch(`${BASE_URL}/api/worship/team`)
      ]);

      if (eventsRes.ok && scheduleRes.ok && rolesRes.ok && teamRes.ok) {
        const eventsData = await eventsRes.json();
        const scheduleData = await scheduleRes.json();
        const rolesData = await rolesRes.json();
        const teamData = await teamRes.json();

        // Filter for upcoming events only
        const upcomingEvents = eventsData
          .filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(upcomingEvents);
        setSchedule(scheduleData);
        setRoles(rolesData);
        setTeam(teamData);
      } else {
        console.error('Failed to fetch schedule data', {
            events: eventsRes.status,
            schedule: scheduleRes.status,
            roles: rolesRes.status,
            team: teamRes.status
        });
      }
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newAssignment.role_id || !newAssignment.member_id) return;

    // Check for duplicates
    const isDuplicate = schedule.some(s => s.event_id === selectedEvent.id && s.member.id == newAssignment.member_id);
    if (isDuplicate) {
      alert('This member is already assigned to this event.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/worship/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          ...newAssignment
        })
      });

      if (response.ok) {
        const newEntry = await response.json();
        setSchedule([...schedule, newEntry]);
        setNewAssignment({ role_id: '', member_id: '' });
        // Keep modal open to add more people
      } else {
        alert('Failed to assign member');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/worship/schedule?id=${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSchedule(schedule.filter(s => s.id !== entryId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading schedule...</div>;

  // Helper to filter members based on selected role
  const getFilteredMembers = () => {
    if (!newAssignment.role_id || showAllMembers) return team;
    
    const selectedRoleObj = roles.find(r => r.id == newAssignment.role_id);
    if (!selectedRoleObj) return team;

    // Filter members who have this role name in their roles array
    return team.filter(m => m.roles && m.roles.includes(selectedRoleObj.name));
  };

  // Group events by month
  const groupedEvents = events.reduce((groups, event) => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(event);
    return groups;
  }, {});

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Worship Schedule</h2>
        {token && (
          <button 
            className="view-all-btn"
            onClick={() => navigate('/events/create', { state: { from: 'worship' } })}
          >
            + Create Event
          </button>
        )}
      </div>
      
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No upcoming events found.</p>
          <p style={{ fontSize: '0.9rem' }}>Create an event first to schedule a team.</p>
          {token && (
            <button 
              onClick={() => navigate('/events/create', { state: { from: 'worship' } })}
              style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Plan New Service
            </button>
          )}
        </div>
      ) : (
        Object.entries(groupedEvents).map(([month, monthEvents]) => (
          <div key={month} style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              borderBottom: '2px solid #eee', 
              paddingBottom: '10px', 
              color: '#555', 
              marginBottom: '20px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {month}
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {monthEvents.map(event => {
                const eventSchedule = schedule.filter(s => s.event_id === event.id);
                
                return (
                  <div key={event.id} className="event-card" style={{ 
                    cursor: 'default', 
                    display: 'block', 
                    borderLeft: '4px solid #007bff',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3rem' }}>{event.title}</h3>
                        <div style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {token && (
                        <button 
                          onClick={() => navigate(`/worship/planner/${event.id}`)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            backgroundColor: '#f0f7ff',
                            color: '#007bff',
                            border: '1px solid #cce5ff',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}
                        >
                          Plan Service
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                      {eventSchedule.length === 0 && <div style={{ color: '#999', fontStyle: 'italic', padding: '10px 0' }}>No team assigned yet</div>}
                      {eventSchedule.map(entry => (
                        <div key={entry.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          background: 'white', 
                          border: '1px solid #eee',
                          padding: '10px 12px', 
                          borderRadius: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', background: '#e3f2fd', color: '#1565c0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {entry.role.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{entry.role.name}</div>
                              <div style={{ fontWeight: '500', color: '#333', fontSize: '0.95rem' }}>{entry.member.name}</div>
                            </div>
                          </div>
                          {token && (
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              style={{ 
                                border: 'none', 
                                background: 'none', 
                                color: '#ff4757', 
                                cursor: 'pointer', 
                                padding: '6px',
                                opacity: 0.6,
                                transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = 1}
                              onMouseLeave={(e) => e.target.style.opacity = 0.6}
                              title="Remove assignment"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            width: '90%', 
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              Manage Team: <span style={{ color: '#007bff' }}>{selectedEvent.title}</span>
            </h3>
            <form onSubmit={handleAssign} className="event-form">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Role</label>
              <select 
                value={newAssignment.role_id} 
                onChange={e => setNewAssignment({...newAssignment, role_id: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">Select Role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <div style={{ marginBottom: '5px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: '500' }}>Member</label>
                <label style={{ cursor: 'pointer', color: '#007bff' }}>
                  <input 
                    type="checkbox" 
                    checked={showAllMembers} 
                    onChange={e => setShowAllMembers(e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  Show all
                </label>
              </div>
              <select 
                value={newAssignment.member_id} 
                onChange={e => setNewAssignment({...newAssignment, member_id: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">Select Member...</option>
                {getFilteredMembers().map(m => {
                  const isAssigned = schedule.some(s => s.event_id === selectedEvent.id && s.member.id === m.id);
                  return (
                    <option key={m.id} value={m.id} disabled={isAssigned}>
                      {m.name} {isAssigned ? '(Already Assigned)' : ''}
                    </option>
                  );
                })}
              </select>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedEvent(null)} style={{ backgroundColor: '#f1f3f5', color: '#495057', border: 'none', flex: 1, padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Done</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', backgroundColor: '#007bff', color: 'white', border: 'none' }}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorshipSchedule;
