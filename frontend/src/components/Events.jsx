import React, { useState, useEffect } from 'react';

function Events({ token, BASE_URL, onEventClick }) {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    end_date: '',
    description: '',
    location: '',
    image_url: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [imageType, setImageType] = useState('url');
  const [uploading, setUploading] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (imageType === 'storage' && showForm) {
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
  }, [imageType, showForm, token, BASE_URL]);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUserRole(data.role);
      });
    }
  }, [token, BASE_URL]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

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
      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchEvents();
        setFormData({ title: '', date: '', end_date: '', description: '', location: '', image_url: '' });
        setShowForm(false);
        setImageType('url');
        setHasEndDate(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Upcoming Events</h2>
        {token && ['admin', 'editor', 'developer'].includes(userRole) && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="event-form">
          <input
            type="text"
            placeholder="Event Title"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
              style={{ flex: 1 }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <input 
                type="checkbox" 
                checked={hasEndDate} 
                onChange={e => {
                  setHasEndDate(e.target.checked);
                  if (!e.target.checked) setFormData(prev => ({...prev, end_date: ''}));
                }} 
              /> 
              End Date?
            </label>
          </div>
          {hasEndDate && (
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={e => setFormData({...formData, end_date: e.target.value})}
              required={hasEndDate}
            />
          )}
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>
              <input 
                type="radio" 
                name="imageType" 
                value="url" 
                checked={imageType === 'url'} 
                onChange={() => setImageType('url')} 
              /> Image URL
            </label>
            <label style={{ marginRight: '10px' }}>
              <input 
                type="radio" 
                name="imageType" 
                value="upload" 
                checked={imageType === 'upload'} 
                onChange={() => setImageType('upload')} 
              /> Upload Image
            </label>
            <label>
              <input 
                type="radio" 
                name="imageType" 
                value="storage" 
                checked={imageType === 'storage'} 
                onChange={() => setImageType('storage')} 
              /> Select from Storage
            </label>
          </div>

          {imageType === 'url' && (
            <input
              type="text"
              placeholder="Image URL (Optional)"
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
          )}

          {imageType === 'upload' && (
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Uploading...</p>}
              {formData.image_url && !uploading && (
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'green' }}>Image uploaded!</p>
              )}
            </div>
          )}

          {imageType === 'storage' && (
            <div style={{ marginBottom: '10px' }}>
              {loadingImages ? <p>Loading images...</p> : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                  {storageImages.length === 0 && <p>No images found in storage.</p>}
                  {storageImages.map(img => (
                    <img 
                      key={img.name} 
                      src={img.url} 
                      alt={img.name} 
                      title={img.name}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        cursor: 'pointer', 
                        border: formData.image_url === img.url ? '3px solid #007bff' : '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onClick={() => setFormData({ ...formData, image_url: img.url })}
                    />
                  ))}
                </div>
              )}
              {formData.image_url && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Selected: {formData.image_url.split('/').pop()}</p>}
            </div>
          )}

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <button type="submit">Save Event</button>
        </form>
      )}

      {Object.entries(events.reduce((acc, event) => {
        const date = new Date(event.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(event);
        return acc;
      }, {})).map(([month, monthEvents]) => (
        <div key={month} className="month-group">
          <h3 className="month-header">{month}</h3>
          <div className="events-grid">
            {monthEvents.map(event => (
              <div key={event.id} className="event-card" onClick={() => onEventClick(event.id)} style={{ cursor: 'pointer' }}>
                <div className="event-image" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}>
                  <div className="event-date-badge">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-meta">
                    {new Date(event.date).toLocaleDateString([], {month: 'short', day: 'numeric'})}, {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {event.end_date && (
                      <>
                        {' - '}
                        {new Date(event.date).toDateString() !== new Date(event.end_date).toDateString() && <>{new Date(event.end_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}, </>}
                        {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </>
                    )}
                    {' • '}{event.location || 'Online'}
                  </p>
                  <p className="event-desc">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Events;