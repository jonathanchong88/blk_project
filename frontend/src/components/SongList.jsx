import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SongList({ token, BASE_URL }) {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, [token]);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/songs`);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const filteredSongs = songs
    .filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.author && song.author.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'latest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'date':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'alphabet':
          return a.title.localeCompare(b.title);
        case 'locale':
          return (a.locale || '').localeCompare(b.locale || '') || a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const isNewSong = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Worship Songs</h2>
        {token && (
          <button onClick={() => navigate('/worship/songs/create')} title="Create Song" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'black' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', flex: 1, boxSizing: 'border-box' }}
        />
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: '8px 30px 8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' }}
        >
          <option value="latest">Latest</option>
          <option value="date">Oldest</option>
          <option value="alphabet">A-Z</option>
          <option value="locale">Language</option>
        </select>
      </div>

      <div className="events-grid">
        {filteredSongs.map(song => (
          <div key={song.id} className="event-card" onClick={() => navigate(`/worship/songs/${song.id}`)} style={{ cursor: 'pointer' }}>
            {song.image_url && <div className="event-image" style={{ backgroundImage: `url(${song.image_url})` }}></div>}
            <div className="event-content">
              <h3>
                {song.title}
                {isNewSong(song.created_at) && (
                  <span style={{ backgroundColor: '#ff4757', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>New</span>
                )}
              </h3>
              <p className="event-meta">{song.author || 'Unknown Author'} • {song.locale === 'zh' ? 'Chinese' : 'English'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongList;