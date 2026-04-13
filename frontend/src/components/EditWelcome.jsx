import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditWelcome({ token, BASE_URL }) {
  const [formData, setFormData] = useState({
    welcome_subtitle: '',
    welcome_title: '',
    welcome_text: '',
    welcome_author: '',
    image_url: ''
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/settings?key=welcome_section`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            welcome_subtitle: data.welcome_subtitle || '',
            welcome_title: data.welcome_title || '',
            welcome_text: data.welcome_text || '',
            welcome_author: data.welcome_author || '',
            image_url: data.image_url || ''
          });
        }
      } catch (err) {
        console.error('Error fetching welcome settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [BASE_URL]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            file: reader.result,
            filename: file.name,
            folder: 'profile', // Utilizing GOOGLE_DRIVE_PROFILE_FOLDER_ID
            newsTitle: 'Welcome Image',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, image_url: data.url }));
        } else {
          alert('Image upload failed');
        }
      } catch (err) {
        console.error(err);
        alert('Image upload failed');
      } finally {
        setImageUploading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          key: 'welcome_section',
          value: formData
        }),
      });

      if (res.ok) {
        alert('Welcome section updated successfully!');
        navigate('/');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error saving welcome settings:', err);
      setError('An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Settings...</div>;

  return (
    <div className="events-container">
      <h2>Edit Welcome Section</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="event-form">
        
        <label style={{ fontWeight: 'bold' }}>Subtitle</label>
        <input
          type="text"
          placeholder="e.g. A Word From Our Senior Pastor"
          value={formData.welcome_subtitle}
          onChange={e => setFormData({ ...formData, welcome_subtitle: e.target.value })}
        />

        <label style={{ fontWeight: 'bold' }}>Title</label>
        <input
          type="text"
          placeholder="e.g. Welcome to Mega Chinese Methodist Church"
          value={formData.welcome_title}
          onChange={e => setFormData({ ...formData, welcome_title: e.target.value })}
          required
        />

        <label style={{ fontWeight: 'bold' }}>Welcome Text</label>
        <textarea
          placeholder="e.g. Our mission is to establish a healthy church..."
          value={formData.welcome_text}
          onChange={e => setFormData({ ...formData, welcome_text: e.target.value })}
          style={{ minHeight: '150px' }}
          required
        />

        <label style={{ fontWeight: 'bold' }}>Author</label>
        <input
          type="text"
          placeholder="e.g. -- Rev. Low Jia Shen"
          value={formData.welcome_author}
          onChange={e => setFormData({ ...formData, welcome_author: e.target.value })}
        />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Welcome Image</label>
        <div style={{ marginBottom: '20px' }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
          {imageUploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Uploading Image...</p>}
          {formData.image_url && !imageUploading && (
            <div style={{ marginTop: '10px' }}>
              <img src={`${BASE_URL}${formData.image_url}`} alt="Preview" style={{ height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'green' }}>Current Image Set.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => navigate('/')} style={{ backgroundColor: '#6c757d' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || imageUploading}>
            {submitting ? 'Saving...' : 'Update Welcome Section'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditWelcome;
