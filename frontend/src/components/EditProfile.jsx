import React, { useState, useEffect } from 'react';

function EditProfile({ token, BASE_URL, onSave, onCancel }) {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    address: '',
    phone: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, BASE_URL]);

  const handleAvatarUpload = async (e) => {
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
          body: JSON.stringify({ image: reader.result, filename: file.name }),
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, avatar_url: data.url }));
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
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        alert('Profile updated successfully!');
        onSave();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Full Name" />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input type="number" value={profile.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} placeholder="Age" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Address" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="Phone Number" />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;