import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePushNotifications } from '../hooks/usePushNotifications';


function Profile({ token, BASE_URL }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  
  const { permission, isSubscribed, subscribeToPush } = usePushNotifications();
  const [notifLoading, setNotifLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    await subscribeToPush(token, BASE_URL);
    setNotifLoading(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, BASE_URL]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        // 1. Upload to storage
        const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ image: reader.result, filename: file.name, folder: 'profile' }),
        });

        if (!uploadResponse.ok) throw new Error('Upload failed');
        const uploadData = await uploadResponse.json();
        const newAvatarUrl = uploadData.url;

        // 2. Update profile with new URL
        const profileResponse = await fetch(`${BASE_URL}/api/profile`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ ...profile, avatar_url: newAvatarUrl }),
        });

        if (profileResponse.ok) {
          setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        } else {
          throw new Error('Failed to update profile');
        }
      } catch (error) {
        console.error(error);
        alert('Error updating profile picture: ' + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : (profile.username ? profile.username.charAt(0).toUpperCase() : 'U');

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <button onClick={() => navigate('/profile/edit')} className="edit-icon-btn" title="Edit Profile" aria-label="Edit Profile">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
      </div>
      
      <div className="avatar-section">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />
        <div className="avatar-preview" onClick={handleAvatarClick}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">{initial}</div>
          )}
          <div className="avatar-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-info-item"><span>Name:</span> {profile.name || 'Not set'}</div>
        <div className="profile-info-item"><span>Username:</span> {profile.username}</div>
        <div className="profile-info-item"><span>Age:</span> {profile.age || 'Not set'}</div>
        <div className="profile-info-item"><span>Address:</span> {profile.address || 'Not set'}</div>
        <div className="profile-info-item"><span>Phone:</span> {profile.phone || 'Not set'}</div>
        {profile.role && profile.role !== 'member' && (
          <div className="profile-info-item"><span>Role:</span> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</div>
        )}
      </div>

      <div className="profile-details" style={{ marginTop: '20px' }}>
        <h3>Notification Settings</h3>
        <div className="profile-info-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Push Notifications</span>
            {isSubscribed ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>Enabled & Synced</span>
            ) : (
                <button 
                  onClick={handleEnableNotifications} 
                  disabled={notifLoading}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                    {notifLoading ? 'Enabling...' : (permission === 'granted' ? 'Sync Subscription' : 'Enable')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default Profile;