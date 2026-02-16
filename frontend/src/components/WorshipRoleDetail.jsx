import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function WorshipRoleDetail({ token, BASE_URL }) {
  const [role, setRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoleDetails();
    fetchTeamMembers();
  }, [id, BASE_URL]);

  const fetchRoleDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/worship/roles/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRole(data.role);
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/worship/team`);
      if (response.ok) {
        const data = await response.json();
        setAllTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      const response = await fetch(`${BASE_URL}/api/worship/roles/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ member_id: selectedMemberId })
      });

      if (response.ok) {
        setShowAddModal(false);
        setSelectedMemberId('');
        fetchRoleDetails();
      } else {
        alert('Failed to add member to role');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Remove this member from this role?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/worship/roles/${id}?member_id=${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!role) return <div>Role not found</div>;

  // Filter out members who already have this role for the dropdown
  const availableMembers = allTeamMembers.filter(
    tm => !members.some(m => m.id === tm.id)
  );

  return (
    <div className="events-container">
      <div className="events-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => navigate('/worship/band')} className="back-btn" style={{ margin: 0 }}>←</button>
            <h2>{role.name}</h2>
        </div>
        {token && (
          <button className="view-all-btn" onClick={() => setShowAddModal(true)}>+ Add Member</button>
        )}
      </div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Empty {role.name} result, please add one.
        </div>
      ) : (
        <div className="events-grid">
          {members.map(member => (
          <div key={member.id} className="event-card" style={{ cursor: 'default' }}>
            <div className="event-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', background: '#e3f2fd', color: '#1565c0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold',
                    overflow: 'hidden', flexShrink: 0
                }}>
                    {member.avatar_url ? <img src={member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>{member.name}</h3>
                        {token && (
                        <button onClick={() => handleDeleteMember(member.id)} style={{ border: 'none', background: 'none', color: '#ff4757', cursor: 'pointer' }}>Remove</button>
                        )}
                    </div>
                    <div className="event-meta">
                        {member.email}
                        {member.sex && <span> • {member.sex}</span>}
                        {member.age && <span> • {member.age} yo</span>}
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3>Add Member to {role.name}</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                <option value="">Select Team Member...</option>
                {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, backgroundColor: '#6c757d' }}>Cancel</button>
                <button type="submit" style={{ flex: 1 }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorshipRoleDetail;