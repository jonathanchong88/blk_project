import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function CreateEditSong({ token, BASE_URL }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    locale: 'en',
    lyrics: '',
    image_url: '',
    video_url: '',
    music_sheet_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      const fetchSong = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${BASE_URL}/api/songs/${id}`);
          if (response.ok) {
            const data = await response.json();
            setFormData(data);
          }
        } catch (error) {
          console.error('Error fetching song:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSong();
    }
  }, [id, isEdit, BASE_URL]);

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            image: reader.result, 
            filename: file.name,
            bucketName: 'blk_bucket',
            folderPath: 'songs'
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, [fieldName]: data.url }));
        } else {
          alert('Upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Upload error');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isEdit ? `${BASE_URL}/api/songs/${id}` : `${BASE_URL}/api/songs`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        navigate('/worship/songs');
      } else {
        alert('Failed to save song');
      }
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="events-container">
      <h2>{isEdit ? 'Edit Song' : 'Create Song'}</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <input 
          type="text" 
          placeholder="Song Title" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="Author / Artist" 
          value={formData.author} 
          onChange={e => setFormData({...formData, author: e.target.value})} 
        />
        <select 
          value={formData.locale} 
          onChange={e => setFormData({...formData, locale: e.target.value})}
          style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>
        <input 
          type="text" 
          placeholder="Image URL (Optional)" 
          value={formData.image_url} 
          onChange={e => setFormData({...formData, image_url: e.target.value})} 
        />
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Or Upload Image:</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} disabled={uploading} />
        </div>

        <input 
          type="text" 
          placeholder="YouTube Video URL (Optional)" 
          value={formData.video_url} 
          onChange={e => setFormData({...formData, video_url: e.target.value})} 
        />
        
        <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Music Score/Sheet (Image or PDF/Doc)</label>
          <input 
            type="text" 
            placeholder="Music Sheet URL (Optional)" 
            value={formData.music_sheet_url || ''} 
            onChange={e => setFormData({...formData, music_sheet_url: e.target.value})} 
            style={{ marginBottom: '10px' }}
          />
          <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileUpload(e, 'music_sheet_url')} disabled={uploading} />
          {formData.music_sheet_url && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '5px' }}>File uploaded/set</p>}
        </div>

        <textarea 
          placeholder="Lyrics" 
          value={formData.lyrics} 
          onChange={e => setFormData({...formData, lyrics: e.target.value})} 
          style={{ minHeight: '200px' }}
        />
        <button type="submit">{isEdit ? 'Update Song' : 'Create Song'}</button>
      </form>
    </div>
  );
}

export default CreateEditSong;