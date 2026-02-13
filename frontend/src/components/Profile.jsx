import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile({ token, BASE_URL }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        <div className="avatar-preview">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">{initial}</div>
          )}
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
    </div>
  );
}

export default Profile;