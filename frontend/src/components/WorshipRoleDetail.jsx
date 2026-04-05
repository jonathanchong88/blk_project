import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const ACCENT = '#7C6AFA'; // purple accent matching worship theme

function MemberCard({ member, token, onDelete }) {
  const initials = (member.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e8e8f0',
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'border-color 0.25s, transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 12px rgba(124,106,250,0.06)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,106,250,0.06)'; }}
    >
      {/* Colour bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)` }} />

      <div style={{ padding: '28px 24px' }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT}18, #a78bfa18)`,
            border: `2px solid ${ACCENT}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', fontSize: '1.1rem', fontWeight: 800, color: ACCENT,
          }}>
            {member.avatar_url
              ? <img src={member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {member.name}
            </div>
            {(member.sex || member.age) && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                {member.sex && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(124,106,250,0.85)', background: 'rgba(124,106,250,0.1)', padding: '2px 8px', borderRadius: '99px' }}>
                    {member.sex}
                  </span>
                )}
                {member.age && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '99px' }}>
                    {member.age} yo
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {member.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124,106,250,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(124,106,250,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124,106,250,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(124,106,250,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#555', flex: 1 }}>{member.phone}</span>
              <a
                href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                title="Chat on WhatsApp"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '8px',
                  background: 'rgba(37,211,102,0.1)', color: '#25D366',
                  textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700,
                  border: '1px solid rgba(37,211,102,0.2)',
                  whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
              >
                <WhatsAppIcon /> WA
              </a>
            </div>
          )}
        </div>

        {/* Remove button */}
        {token && (
          <button
            onClick={() => onDelete(member.id)}
            style={{
              width: '100%', padding: '9px', border: '1px solid rgba(255,80,80,0.2)',
              borderRadius: '10px', background: 'rgba(255,80,80,0.06)',
              color: 'rgba(255,100,100,0.7)', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.14)'; e.currentTarget.style.color = '#ff6060'; e.currentTarget.style.borderColor = 'rgba(255,80,80,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.06)'; e.currentTarget.style.color = 'rgba(255,100,100,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,80,80,0.2)'; }}
          >
            Remove from role
          </button>
        )}
      </div>
    </div>
  );
}

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
      if (response.ok) setAllTeamMembers(await response.json());
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ member_id: selectedMemberId }),
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
      Loading...
    </div>
  );
  if (!role) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'rgba(255,255,255,0.3)' }}>
      Role not found
    </div>
  );

  const availableMembers = allTeamMembers.filter(tm => !members.some(m => m.id === tm.id));

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/worship/band')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#1a1a2e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#1a1a2e'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, marginBottom: '4px' }}>
              Worship Role
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.03em' }}>
              {role.name}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Member count badge */}
          <div style={{
            padding: '8px 16px', borderRadius: '99px',
            background: `${ACCENT}18`, border: `1px solid ${ACCENT}33`,
            color: ACCENT, fontSize: '0.82rem', fontWeight: 700,
          }}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </div>
          {token && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px', borderRadius: '12px',
                background: `linear-gradient(135deg, ${ACCENT}, #a78bfa)`,
                border: 'none', color: '#fff',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 20px ${ACCENT}40`,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Member grid */}
      {members.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px',
          color: 'rgba(255,255,255,0.25)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎵</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.4)' }}>No members yet</div>
          <div style={{ fontSize: '0.85rem' }}>Add team members to the {role.name} role to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {members.map(member => (
            <MemberCard key={member.id} member={member} token={token} onDelete={handleDeleteMember} />
          ))}
        </div>
      )}

      {/* Add member modal */}
      {showAddModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '440px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, marginBottom: '4px' }}>Assign</div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Add to {role.name}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                  Team Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: selectedMemberId ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                    appearance: 'auto',
                  }}
                >
                  <option value="">Select a team member...</option>
                  {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {availableMembers.length === 0 && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                    All team members are already assigned to this role.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMemberId}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '12px',
                    background: selectedMemberId ? `linear-gradient(135deg, ${ACCENT}, #a78bfa)` : 'rgba(255,255,255,0.08)',
                    border: 'none', color: selectedMemberId ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.88rem', fontWeight: 700, cursor: selectedMemberId ? 'pointer' : 'not-allowed',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorshipRoleDetail;