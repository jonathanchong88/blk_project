// frontend/src/components/WorshipBand.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLE_IMAGES = {
  'Worship Leader': 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800&q=80',
  'Vocalist': 'data:image/jpeg;base64,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',
  'Acoustic Guitar': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
  'Electric Guitar': 'data:image/jpeg;base64,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',
  'Bass': 'https://images.unsplash.com/photo-1460039230329-eb070fc6c77c?auto=format&fit=crop&w=800&q=80',
  'Drums': 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80',
  'Keyboard': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80',
  'PA System': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
  'Projection/Lyrics': 'data:image/jpeg;base64,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',
  'default': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
};

function WorshipBand({ token, BASE_URL }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', sex: '', age: '', avatar_url: '', roles: [] });
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('roles'); // 'roles' or 'members'
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeam();
    fetchRoles();
    if (token) fetchUsers();
  }, [BASE_URL, token]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/worship/team`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/worship/roles`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name) {
      alert('Please select a member from the list.');
      return;
    }
    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...newMember, id: editingId } : newMember;
      const response = await fetch(`${BASE_URL}/api/worship/team`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowModal(false);
        setNewMember({ name: '', email: '', phone: '', roles: [] });
        setEditingId(null);
        fetchTeam(); // Refresh list
      } else {
        alert(`Failed to ${editingId ? 'update' : 'add'} member`);
      }
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (member) => {
    // Map role names back to IDs
    const memberRoleIds = member.roles.map(roleName => {
      const roleObj = availableRoles.find(r => r.name === roleName);
      return roleObj ? roleObj.id : null;
    }).filter(id => id !== null);

    setNewMember({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      sex: member.sex || '',
      age: member.age || '',
      avatar_url: member.avatar_url || '',
      roles: memberRoleIds
    });
    setEditingId(member.id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setNewMember({ name: '', email: '', phone: '', sex: '', age: '', avatar_url: '', roles: [] });
    setEditingId(null);
    setShowModal(true);
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id == userId);
    if (user) {
      setNewMember(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        age: user.age || prev.age,
        avatar_url: user.avatar_url || prev.avatar_url
      }));
      setShowUserDropdown(false);
    }
  };

  // Get unique roles from the team data for the filter dropdown
  const allRoles = [...new Set(team.flatMap(member => member.roles))].sort();

  const filteredTeam = filterRole
    ? team.filter(member => member.roles.includes(filterRole))
    : team;

  if (loading) return <div style={{ padding: '20px' }}>Loading team...</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Worship Team</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setViewMode('roles')}
                style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'roles' ? '#007bff' : '#eee', color: viewMode === 'roles' ? 'white' : '#333' }}
            >
                Roles
            </button>
            <button 
                onClick={() => setViewMode('members')}
                style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'members' ? '#007bff' : '#eee', color: viewMode === 'members' ? 'white' : '#333' }}
            >
                All Members
            </button>
        </div>
        {token && (
          <button 
            className="view-all-btn"
            onClick={openAddModal}
          >
            + Add Member
          </button>
        )}
      </div>

      {viewMode === 'roles' ? (
        <div className="events-grid">
            {availableRoles.map(role => (
                <div key={role.id} className="event-card" onClick={() => navigate(`/worship/roles/${role.id}`)} style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '150px', 
                    backgroundImage: `url(${ROLE_IMAGES[role.name] || ROLE_IMAGES.default})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1
                    }}></div>
                    <h3 style={{ margin: 0, color: 'white', zIndex: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: '1.5rem', textAlign: 'center', padding: '10px', overflowWrap: 'break-word' }}>{role.name.length > 11 ? `${role.name.substring(0, 11)}...` : role.name}</h3>
                </div>
            ))}
        </div>
      ) : (
        <>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>Filter by Role:</span>
                <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                <option value="">All Roles</option>
                {allRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
                </select>
            </div>

            <div className="events-grid">
                {filteredTeam.map(member => (
                <div key={member.id} className="event-card" style={{ cursor: 'default' }}>
                    <div className="event-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <h3 style={{ marginTop: 0, marginRight: '10px' }}>{member.name}</h3>
                        {token && (
                        <button 
                            onClick={() => handleEditClick(member)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', padding: '0' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '10px 0' }}>
                        {member.roles.map(role => (
                        <span 
                            key={role} 
                            style={{ 
                            backgroundColor: '#e3f2fd', 
                            color: '#1565c0', 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            border: '1px solid #bbdefb'
                            }}
                        >
                            {role}
                        </span>
                        ))}
                    </div>

                    <div className="event-meta" style={{ marginTop: 'auto' }}>
                        {member.email && <div style={{ marginBottom: '4px' }}>📧 {member.email}</div>}
                        {member.phone && <div>📱 {member.phone}</div>}
                    </div>
                    </div>
                </div>
                ))}
            </div>
            
            {filteredTeam.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No team members found matching this filter.
                </div>
            )}
        </>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h3>
            <form onSubmit={handleAddMember} className="event-form">
              {users.length > 0 ? (
                <div style={{ marginBottom: '15px', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Member:</label>
                  
                  <div 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd', 
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: newMember.name ? 'black' : '#888' }}>
                      {newMember.name ? newMember.name : '-- Select User --'}
                    </span>
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
                          placeholder="Search member..." 
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #eee',
                            borderRadius: '4px',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                          autoFocus
                        />
                      </div>
                      {users.filter(u => (u.name || u.username).toLowerCase().includes(userSearchQuery.toLowerCase())).map(user => (
                        <div 
                          key={user.id} 
                          onClick={() => handleUserSelect(user.id)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                            fontSize: '0.8rem',
                            color: '#666',
                            fontWeight: 'bold'
                          }}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              (user.name || user.username).charAt(0).toUpperCase()
                            )}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                          </div>
                        </div>
                      ))}
                      {users.filter(u => (u.name || u.username).toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No users found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '10px', color: '#666' }}>No members available to select.</div>
              )}

              {newMember.name && (
                <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee' }}>
                    <div style={{ marginBottom: '5px' }}><span style={{ fontWeight: '600', color: '#555' }}>Email:</span> {newMember.email || '-'}</div>
                    <div style={{ marginBottom: '10px' }}><span style={{ fontWeight: '600', color: '#555' }}>Phone:</span> {newMember.phone || '-'}</div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Sex</label>
                            <select 
                                value={newMember.sex || ''} 
                                onChange={e => setNewMember({...newMember, sex: e.target.value})}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Age</label>
                            <input 
                                type="number" 
                                value={newMember.age || ''} 
                                onChange={e => setNewMember({...newMember, age: e.target.value})}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
              )}
              
              <div style={{ margin: '15px 0' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Roles / Skills:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {availableRoles.map(role => (
                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f5f5f5', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={newMember.roles.includes(role.id)}
                        onChange={(e) => {
                          const roles = e.target.checked 
                            ? [...newMember.roles, role.id]
                            : newMember.roles.filter(id => id !== role.id);
                          setNewMember({...newMember, roles});
                        }}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: '#6c757d', flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Saving...' : (editingId ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorshipBand;
