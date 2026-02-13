import React, { useState, useEffect } from 'react';

function Events({ token, BASE_URL, onEventClick }) {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    location: '',
    image_url: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [imageType, setImageType] = useState('url');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

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
        setFormData({ title: '', date: '', description: '', location: '', image_url: '' });
        setShowForm(false);
        setImageType('url');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Upcoming Events</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
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
          <input
            type="datetime-local"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            required
          />
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
            <label>
              <input 
                type="radio" 
                name="imageType" 
                value="upload" 
                checked={imageType === 'upload'} 
                onChange={() => setImageType('upload')} 
              /> Upload Image
            </label>
          </div>

          {imageType === 'url' ? (
            <input
              type="text"
              placeholder="Image URL (Optional)"
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
          ) : (
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Uploading...</p>}
              {formData.image_url && imageType === 'upload' && !uploading && (
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'green' }}>Image uploaded!</p>
              )}
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

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card" onClick={() => onEventClick(event.id)} style={{ cursor: 'pointer' }}>
            <div className="event-image" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}>
              <div className="event-date-badge">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="event-content">
              <h3>{event.title}</h3>
              <p className="event-meta">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {event.location || 'Online'}</p>
              <p className="event-desc">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;