import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Default empty language block
const emptyLang = () => ({
  welcome_subtitle: '',
  welcome_title: '',
  welcome_text: '',
  welcome_author: '',
});

function EditWelcome({ token, BASE_URL }) {
  const [formData, setFormData] = useState({
    en: emptyLang(),
    zh: emptyLang(),
    image_url: '',
  });
  const [activeTab, setActiveTab] = useState('en');
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

          // Detect old flat format (no 'en' sub-key) and migrate
          if (data && !data.en) {
            setFormData({
              en: {
                welcome_subtitle: data.welcome_subtitle || '',
                welcome_title: data.welcome_title || '',
                welcome_text: data.welcome_text || '',
                welcome_author: data.welcome_author || '',
              },
              zh: emptyLang(),
              image_url: data.image_url || '',
            });
          } else if (data) {
            setFormData({
              en: {
                welcome_subtitle: data.en?.welcome_subtitle || '',
                welcome_title: data.en?.welcome_title || '',
                welcome_text: data.en?.welcome_text || '',
                welcome_author: data.en?.welcome_author || '',
              },
              zh: {
                welcome_subtitle: data.zh?.welcome_subtitle || '',
                welcome_title: data.zh?.welcome_title || '',
                welcome_text: data.zh?.welcome_text || '',
                welcome_author: data.zh?.welcome_author || '',
              },
              image_url: data.image_url || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching welcome settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [BASE_URL]);

  const handleLangChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value },
    }));
  };

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
            folder: 'profile',
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
          value: formData,
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

  const tabStyles = {
    tab: (active) => ({
      padding: '8px 24px',
      border: 'none',
      borderBottom: active ? '3px solid #007bff' : '3px solid transparent',
      background: 'none',
      fontWeight: active ? '700' : '400',
      color: active ? '#007bff' : '#555',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s',
    }),
    tabBar: {
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid #ddd',
      marginBottom: '24px',
    },
  };

  const lang = formData[activeTab];

  return (
    <div className="events-container">
      <h2>Edit Welcome Section</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Language Tabs */}
      <div style={tabStyles.tabBar}>
        <button
          id="welcome-tab-en"
          type="button"
          style={tabStyles.tab(activeTab === 'en')}
          onClick={() => setActiveTab('en')}
        >
          🇬🇧 English
        </button>
        <button
          id="welcome-tab-zh"
          type="button"
          style={tabStyles.tab(activeTab === 'zh')}
          onClick={() => setActiveTab('zh')}
        >
          🇨🇳 中文
        </button>
      </div>

      <form onSubmit={handleSubmit} className="event-form">

        {/* --- Language-specific fields --- */}
        <label style={{ fontWeight: 'bold' }}>
          Subtitle <span style={{ color: '#888', fontWeight: 400 }}>({activeTab === 'en' ? 'English' : '中文'})</span>
        </label>
        <input
          id={`welcome-subtitle-${activeTab}`}
          type="text"
          placeholder={activeTab === 'en' ? 'e.g. A Word From Our Senior Pastor' : '例：主任牧师的话'}
          value={lang.welcome_subtitle}
          onChange={e => handleLangChange('welcome_subtitle', e.target.value)}
        />

        <label style={{ fontWeight: 'bold' }}>
          Title <span style={{ color: '#888', fontWeight: 400 }}>({activeTab === 'en' ? 'English' : '中文'})</span>
        </label>
        <input
          id={`welcome-title-${activeTab}`}
          type="text"
          placeholder={activeTab === 'en' ? 'e.g. Welcome to Mega Chinese Methodist Church' : '例：欢迎来到美佳卫理公会'}
          value={lang.welcome_title}
          onChange={e => handleLangChange('welcome_title', e.target.value)}
          required={activeTab === 'en'}
        />

        <label style={{ fontWeight: 'bold' }}>
          Welcome Text <span style={{ color: '#888', fontWeight: 400 }}>({activeTab === 'en' ? 'English' : '中文'})</span>
        </label>
        <textarea
          id={`welcome-text-${activeTab}`}
          placeholder={activeTab === 'en' ? 'e.g. Our mission is to establish a healthy church...' : '例：美佳卫理公会的使命…'}
          value={lang.welcome_text}
          onChange={e => handleLangChange('welcome_text', e.target.value)}
          style={{ minHeight: '150px' }}
          required={activeTab === 'en'}
        />

        <label style={{ fontWeight: 'bold' }}>
          Author <span style={{ color: '#888', fontWeight: 400 }}>({activeTab === 'en' ? 'English' : '中文'})</span>
        </label>
        <input
          id={`welcome-author-${activeTab}`}
          type="text"
          placeholder={activeTab === 'en' ? 'e.g. -- Rev. Low Jia Shen' : '例：-- 刘家深牧师'}
          value={lang.welcome_author}
          onChange={e => handleLangChange('welcome_author', e.target.value)}
        />

        {/* --- Shared: Image --- */}
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', marginTop: '8px' }}>
          Welcome Image <span style={{ color: '#888', fontWeight: 400 }}>(shared across languages)</span>
        </label>
        <div style={{ marginBottom: '20px' }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
          {imageUploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Uploading Image...</p>}
          {formData.image_url && !imageUploading && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={`${BASE_URL}${formData.image_url}`}
                alt="Preview"
                style={{ height: '100px', objectFit: 'cover', borderRadius: '4px' }}
              />
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
