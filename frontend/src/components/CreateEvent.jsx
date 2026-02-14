import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateEvent({ token, BASE_URL }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    end_date: '',
    description: '',
    location: '',
    image_url: ''
  });
  const [imageType, setImageType] = useState('url');
  const [uploading, setUploading] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (imageType === 'storage') {
      const fetchStorageImages = async () => {
        setLoadingImages(true);
        try {
          const response = await fetch(`${BASE_URL}/api/upload`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setStorageImages(data);
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        } finally {
          setLoadingImages(false);
        }
      };
      fetchStorageImages();
    }
  }, [imageType, token, BASE_URL]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: reader.result,
            filename: file.name
          }),
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid response');
        }

        if (response.ok) {
          setFormData(prev => ({ ...prev, image_url: data.url }));
        } else {
          alert(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Upload error: ' + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };

      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        navigate('/events');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="events-container">
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <input type="text" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required style={{ flex: 1 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={hasEndDate} onChange={e => { setHasEndDate(e.target.checked); if (!e.target.checked) setFormData(prev => ({...prev, end_date: ''})); }} /> End Date?
          </label>
        </div>
        
        {hasEndDate && (
          <input type="datetime-local" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required={hasEndDate} />
        )}
        
        <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}><input type="radio" name="imageType" value="url" checked={imageType === 'url'} onChange={() => setImageType('url')} /> Image URL</label>
          <label style={{ marginRight: '10px' }}><input type="radio" name="imageType" value="upload" checked={imageType === 'upload'} onChange={() => setImageType('upload')} /> Upload Image</label>
          <label><input type="radio" name="imageType" value="storage" checked={imageType === 'storage'} onChange={() => setImageType('storage')} /> Select from Storage</label>
        </div>

        {imageType === 'url' && (
          <input type="text" placeholder="Image URL (Optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
        )}

        {imageType === 'upload' && (
          <div style={{ marginBottom: '10px' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Uploading...</p>}
            {formData.image_url && !uploading && <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'green' }}>Image uploaded!</p>}
          </div>
        )}

        {imageType === 'storage' && (
          <div style={{ marginBottom: '10px' }}>
            {loadingImages ? <p>Loading images...</p> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                {storageImages.length === 0 && <p>No images found in storage.</p>}
                {storageImages.map(img => (
                  <img key={img.name} src={img.url} alt={img.name} title={img.name} style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', border: formData.image_url === img.url ? '3px solid #007bff' : '1px solid #ddd', borderRadius: '4px' }} onClick={() => setFormData({ ...formData, image_url: img.url })} />
                ))}
              </div>
            )}
            {formData.image_url && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Selected: {formData.image_url.split('/').pop()}</p>}
          </div>
        )}

        <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => navigate('/events')} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
          <button type="submit">Create Event</button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;