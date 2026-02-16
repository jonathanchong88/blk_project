// frontend/src/components/WorshipServicePlanner.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function WorshipServicePlanner({ token, BASE_URL }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [event, setEvent] = useState(null);
  const [details, setDetails] = useState({ rehearsal_date: '', worship_leader_id: '' });
  const [setlist, setSetlist] = useState([]);
  const [team, setTeam] = useState([]); // Assigned team
  
  // Selection Pools
  const [allSongs, setAllSongs] = useState([]);
  const [teamPool, setTeamPool] = useState([]); // All available worship members
  const [roles, setRoles] = useState([]);

  // UI States
  const [showSongModal, setShowSongModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [newAssignment, setNewAssignment] = useState({ role_id: '', member_id: '' });

  useEffect(() => {
    fetchData();
  }, [id, BASE_URL]);

  const fetchData = async () => {
    try {
      const [eventRes, detailsRes, setlistRes, scheduleRes, songsRes, teamPoolRes, rolesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/events/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/worship/events/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/events/setlist?event_id=${id}`),
        fetch(`${BASE_URL}/api/worship/schedule`),
        fetch(`${BASE_URL}/api/songs`),
        fetch(`${BASE_URL}/api/worship/team`),
        fetch(`${BASE_URL}/api/worship/roles`)
      ]);

      if (eventRes.ok) setEvent(await eventRes.json());
      if (detailsRes.ok) {
        const data = await detailsRes.json();
        setDetails({
            rehearsal_date: data.rehearsal_date ? new Date(data.rehearsal_date).toISOString().slice(0, 16) : '',
            worship_leader_id: data.worship_leader_id || ''
        });
      }
      if (setlistRes.ok) setSetlist(await setlistRes.json());
      if (scheduleRes.ok) {
        const allSchedule = await scheduleRes.json();
        setTeam(allSchedule.filter(s => s.event_id === parseInt(id)));
      }
      if (songsRes.ok) setAllSongs(await songsRes.json());
      if (teamPoolRes.ok) setTeamPool(await teamPoolRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());

    } catch (error) {
      console.error("Error loading planner data", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/worship/events/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            rehearsal_date: details.rehearsal_date || null,
            worship_leader_id: details.worship_leader_id || null
        })
      });
      if (response.ok) alert('Details saved!');
    } catch (error) {
      console.error(error);
    }
  };

  const addSong = async (songId) => {
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

  const removeSong = async (entryId) => {
    if (!window.confirm('Remove song?')) return;
    try {
      await fetch(`${BASE_URL}/api/events/setlist?id=${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSetlist(setlist.filter(s => s.id !== entryId));
    } catch (error) { console.error(error); }
  };

  const addTeamMember = async (e) => {
    e.preventDefault();
    if (!newAssignment.role_id || !newAssignment.member_id) return;
    
    // Check duplicate
    if (team.some(t => t.member.id == newAssignment.member_id)) {
        alert('Member already assigned');
        return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/worship/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ event_id: id, ...newAssignment })
      });
      if (response.ok) {
        const newEntry = await response.json();
        setTeam([...team, newEntry]);
        setShowTeamModal(false);
        setNewAssignment({ role_id: '', member_id: '' });
      }
    } catch (error) { console.error(error); }
  };

  const removeTeamMember = async (entryId) => {
    if (!window.confirm('Remove member?')) return;
    try {
      await fetch(`${BASE_URL}/api/worship/schedule?id=${entryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTeam(team.filter(t => t.id !== entryId));
    } catch (error) { console.error(error); }
  };

  if (loading) return <div>Loading Planner...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <div>
            <button onClick={() => navigate('/worship/schedule')} className="back-btn" style={{marginBottom: '10px'}}>← Back to Schedule</button>
            <h2>Worship Planner: {event.title}</h2>
            <p style={{color: '#666'}}>{new Date(event.date).toLocaleDateString()} @ {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </div>

      <div className="event-info-card" style={{marginBottom: '20px'}}>
        <h3>Service Details</h3>
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            <div style={{flex: 1, minWidth: '250px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Rehearsal Time (Optional)</label>
                <input 
                    type="datetime-local" 
                    value={details.rehearsal_date} 
                    onChange={e => setDetails({...details, rehearsal_date: e.target.value})}
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
            </div>
            <div style={{flex: 1, minWidth: '250px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Worship Leader</label>
                <select 
                    value={details.worship_leader_id} 
                    onChange={e => setDetails({...details, worship_leader_id: e.target.value})}
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                >
                    <option value="">-- Select Leader --</option>
                    {team.map(t => (
                        <option key={t.member.id} value={t.member.id}>{t.member.name} ({t.role.name})</option>
                    ))}
                </select>
                <small style={{color: '#666'}}>* Select from assigned team members</small>
            </div>
        </div>
        <button onClick={saveDetails} style={{marginTop: '15px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Save Details</button>
      </div>

      <div className="event-info-card" style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <h3>Songs ({setlist.length})</h3>
            <button onClick={() => setShowSongModal(true)} className="view-all-btn">+ Add Song</button>
        </div>
        {setlist.length === 0 ? <p style={{color: '#888'}}>No songs added.</p> : (
            <ul style={{listStyle: 'none', padding: 0}}>
                {setlist.map((s, idx) => (
                    <li key={s.id} style={{padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>{idx + 1}. <strong>{s.song.title}</strong> ({s.song.author}) {s.key_note && <span style={{background: '#eef', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem'}}>Key: {s.key_note}</span>}</span>
                        <button onClick={() => removeSong(s.id)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>×</button>
                    </li>
                ))}
            </ul>
        )}
      </div>

      <div className="event-info-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <h3>Worship Team ({team.length})</h3>
            <button onClick={() => setShowTeamModal(true)} className="view-all-btn">+ Add Member</button>
        </div>
        {team.length === 0 ? <p style={{color: '#888'}}>No team members assigned.</p> : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
                {team.map(t => (
                    <div key={t.id} style={{padding: '10px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px', background: details.worship_leader_id == t.member.id ? '#fff3cd' : 'white'}}>
                        <div style={{width: '30px', height: '30px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {t.member.name.charAt(0)}
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: 'bold'}}>{t.member.name}</div>
                            <div style={{fontSize: '0.8rem', color: '#666'}}>{t.role.name}</div>
                        </div>
                        <button onClick={() => removeTeamMember(t.id)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>×</button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Add Song Modal */}
      {showSongModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
                <h3>Add Song</h3>
                <input type="text" placeholder="Search songs..." value={songSearch} onChange={e => setSongSearch(e.target.value)} style={{padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px'}} />
                <div style={{overflowY: 'auto', flex: 1}}>
                    {allSongs.filter(s => s.title.toLowerCase().includes(songSearch.toLowerCase())).map(s => (
                        <div key={s.id} onClick={() => addSong(s.id)} style={{padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer'}}>
                            {s.title} - <small>{s.author}</small>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowSongModal(false)} style={{marginTop: '10px'}}>Close</button>
            </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showTeamModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px'}}>
                <h3>Add Team Member</h3>
                <form onSubmit={addTeamMember}>
                    <div style={{marginBottom: '10px'}}>
                        <label style={{display: 'block', marginBottom: '5px'}}>Role</label>
                        <select value={newAssignment.role_id} onChange={e => setNewAssignment({...newAssignment, role_id: e.target.value})} required style={{width: '100%', padding: '8px'}}>
                            <option value="">Select Role...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div style={{marginBottom: '15px'}}>
                        <label style={{display: 'block', marginBottom: '5px'}}>Member</label>
                        <select value={newAssignment.member_id} onChange={e => setNewAssignment({...newAssignment, member_id: e.target.value})} required style={{width: '100%', padding: '8px'}}>
                            <option value="">Select Member...</option>
                            {teamPool.map(m => (
                                <option key={m.id} value={m.id} disabled={team.some(t => t.member.id === m.id)}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button type="button" onClick={() => setShowTeamModal(false)} style={{flex: 1, background: '#6c757d'}}>Cancel</button>
                        <button type="submit" style={{flex: 1}}>Add</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default WorshipServicePlanner;
