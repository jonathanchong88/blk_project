import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserList({ token, BASE_URL }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token, BASE_URL]);

  if (loading) return <div>Loading users...</div>;

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.phone && user.phone.includes(query))
    );

    const age = user.age ? parseInt(user.age) : null;
    let matchesAge = true;

    if (minAge !== '') {
        const min = parseInt(minAge);
        if (age === null || age < min) matchesAge = false;
    }
    if (maxAge !== '') {
        const max = parseInt(maxAge);
        if (age === null || age > max) matchesAge = false;
    }

    return matchesSearch && matchesAge;
  });

  return (
    <div className="user-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>User List</h2>
        <button 
          onClick={() => setIsFilterOpen(true)} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filters
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search by username, name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {isFilterOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
            onClick={() => setIsFilterOpen(false)}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', backgroundColor: 'white', zIndex: 1001,
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>Age Range</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <input
                    type="number"
                    placeholder="Min"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <input
                    type="number"
                    placeholder="Max"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button 
                onClick={() => { setSearchQuery(''); setMinAge(''); setMaxAge(''); }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#333' }}
                >
                Clear
                </button>
                <button 
                onClick={() => setIsFilterOpen(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                >
                Done
                </button>
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredUsers.map(user => (
          <div key={user.id} style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666', fontSize: '1.2rem', flexShrink: 0 }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user.name || user.username || '?').charAt(0).toUpperCase()
                    )}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.username}</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>@{user.username}</div>
              </div>
              <div>
                  <button 
                    className="edit-icon-btn" 
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    title="Edit User"
                    aria-label="Edit User"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', padding: '5px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', color: '#444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>ID:</span>
                <span>{user.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Age:</span>
                <span>{user.age || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888' }}>Phone:</span>
                {user.phone ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{user.phone.length > 4 ? `****${user.phone.slice(-4)}` : user.phone}</span>
                      <a 
                          href={`https://wa.me/${user.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}
                          title="Chat on WhatsApp"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      </a>
                  </div>
                ) : '-'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Address:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{user.address || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;