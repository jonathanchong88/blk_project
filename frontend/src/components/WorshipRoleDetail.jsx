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
                        {member.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span>📱 {member.phone}</span>
                                <a 
                                    href={`https://wa.me/${member.phone.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                                    title="Chat on WhatsApp"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                </a>
                            </div>
                        )}
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