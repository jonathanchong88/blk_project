import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyForm = () => ({
  order_index: 0,
  image_url: '',
  en_subtitle: '', en_title: '', en_text: '', en_author: '',
  zh_subtitle: '', zh_title: '', zh_text: '', zh_author: '',
  is_active: true,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function LangFields({ form, lang, onChange }) {
  const isZh = lang === 'zh';
  const prefix = lang;
  const ph = isZh
    ? { subtitle: '例：主任牧师的话', title: '例：欢迎来到美佳卫理公会', text: '例：美佳卫理公会的使命…', author: '例：-- 刘家深牧师' }
    : { subtitle: 'e.g. A Word From Our Senior Pastor', title: 'e.g. Welcome to Mega Chinese Methodist Church', text: 'e.g. Our mission is to establish a healthy church...', author: 'e.g. -- Rev. Low Jia Shen' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>
          Subtitle <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder={ph.subtitle}
          value={form[`${prefix}_subtitle`]}
          onChange={e => onChange(`${prefix}_subtitle`, e.target.value)}
        />
      </div>
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>
          Title {!isZh && <span style={{ color: '#dc3545' }}>*</span>}
        </label>
        <input
          type="text"
          placeholder={ph.title}
          value={form[`${prefix}_title`]}
          onChange={e => onChange(`${prefix}_title`, e.target.value)}
          required={!isZh}
        />
      </div>
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>
          Welcome Text {!isZh && <span style={{ color: '#dc3545' }}>*</span>}
        </label>
        <textarea
          placeholder={ph.text}
          value={form[`${prefix}_text`]}
          onChange={e => onChange(`${prefix}_text`, e.target.value)}
          style={{ minHeight: '120px' }}
          required={!isZh}
        />
      </div>
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>
          Author <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder={ph.author}
          value={form[`${prefix}_author`]}
          onChange={e => onChange(`${prefix}_author`, e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function WelcomeManager({ token, BASE_URL }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [activeTab, setActiveTab] = useState('en');
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ── Fetch all entries (admin view: no is_active filter) ──────────────────
  const fetchEntries = useCallback(async () => {
    try {
      // Use the public endpoint; admin sees all via the list
      const res = await fetch(`${BASE_URL}/api/welcome-entries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Fetch all including inactive by not filtering client-side
        setEntries(data);
      }
    } catch (err) {
      console.error('Error fetching welcome entries:', err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // ── Form helpers ─────────────────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setActiveTab('en');
    setError(null);
    setShowForm(true);
  };

  const openEdit = (entry) => {
    setForm({
      order_index: entry.order_index ?? 0,
      image_url: entry.image_url || '',
      en_subtitle: entry.en_subtitle || '',
      en_title: entry.en_title || '',
      en_text: entry.en_text || '',
      en_author: entry.en_author || '',
      zh_subtitle: entry.zh_subtitle || '',
      zh_title: entry.zh_title || '',
      zh_text: entry.zh_text || '',
      zh_author: entry.zh_author || '',
      is_active: entry.is_active !== false,
    });
    setEditingId(entry.id);
    setActiveTab('en');
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  // ── Image upload ─────────────────────────────────────────────────────────
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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ file: reader.result, filename: file.name, folder: 'profile', newsTitle: 'Welcome Image' }),
        });
        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({ ...prev, image_url: data.url }));
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

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.en_title.trim() || !form.en_text.trim()) {
      setError('English title and text are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const url = editingId
        ? `${BASE_URL}/api/welcome-entries/${editingId}`
        : `${BASE_URL}/api/welcome-entries`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchEntries();
        closeForm();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to save entry.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this welcome entry?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/welcome-entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEntries(prev => prev.filter(e => e.id !== id));
      } else {
        alert('Failed to delete entry.');
      }
    } catch (err) {
      alert('Error deleting entry.');
    }
  };

  // ── Reorder (move up / down) ──────────────────────────────────────────────
  const handleReorder = async (entry, direction) => {
    const sorted = [...entries].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex(e => e.id === entry.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapEntry = sorted[swapIdx];
    const newOrderA = swapEntry.order_index;
    const newOrderB = entry.order_index;

    // Optimistic UI
    setEntries(prev => prev.map(e => {
      if (e.id === entry.id) return { ...e, order_index: newOrderA };
      if (e.id === swapEntry.id) return { ...e, order_index: newOrderB };
      return e;
    }));

    try {
      await Promise.all([
        fetch(`${BASE_URL}/api/welcome-entries/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...entry, order_index: newOrderA }),
        }),
        fetch(`${BASE_URL}/api/welcome-entries/${swapEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...swapEntry, order_index: newOrderB }),
        }),
      ]);
    } catch (err) {
      console.error('Reorder failed:', err);
      fetchEntries(); // revert
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (entry) => {
    const updated = { ...entry, is_active: !entry.is_active };
    setEntries(prev => prev.map(e => e.id === entry.id ? updated : e));
    try {
      await fetch(`${BASE_URL}/api/welcome-entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Toggle active failed:', err);
      fetchEntries();
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    tabBtn: (active) => ({
      padding: '8px 24px',
      border: 'none',
      borderBottom: active ? '3px solid #f0a500' : '3px solid transparent',
      background: 'none',
      fontWeight: active ? '700' : '400',
      color: active ? '#f0a500' : '#555',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s',
    }),
    card: {
      background: '#fff',
      border: '1px solid #e9ecef',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    badge: (active) => ({
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: active ? '#d4edda' : '#f8d7da',
      color: active ? '#155724' : '#721c24',
    }),
  };

  const sortedEntries = [...entries].sort((a, b) => a.order_index - b.order_index);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="events-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Welcome Section Manager</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => navigate('/')} style={{ backgroundColor: '#6c757d' }}>
            ← Back to Home
          </button>
          <button type="button" onClick={openCreate} style={{ backgroundColor: '#f0a500' }}>
            + Add Entry
          </button>
        </div>
      </div>

      {/* Entry List */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading entries...</p>
      ) : sortedEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', border: '2px dashed #ddd', borderRadius: '10px' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>No welcome entries yet.</p>
          <button type="button" onClick={openCreate} style={{ backgroundColor: '#f0a500' }}>+ Create First Entry</button>
        </div>
      ) : (
        <div>
          {sortedEntries.map((entry, i) => (
            <div key={entry.id} style={S.card}>
              {/* Avatar */}
              <div style={{ flexShrink: 0 }}>
                {entry.image_url ? (
                  <img
                    src={`${BASE_URL}${entry.image_url}`}
                    alt="Avatar"
                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0a500' }}
                  />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#ccc' }}>👤</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem' }}>{entry.en_title}</strong>
                  <span style={S.badge(entry.is_active)}>{entry.is_active ? 'Active' : 'Hidden'}</span>
                  <span style={{ fontSize: '0.78rem', color: '#aaa' }}>Order: {entry.order_index}</span>
                </div>
                {entry.en_author && <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>{entry.en_author}</p>}
                {entry.zh_title && <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa' }}>中文: {entry.zh_title}</p>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleReorder(entry, 'up')}
                    disabled={i === 0}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#e9ecef', color: '#333', border: 'none', borderRadius: '4px', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.4 : 1 }}
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => handleReorder(entry, 'down')}
                    disabled={i === sortedEntries.length - 1}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#e9ecef', color: '#333', border: 'none', borderRadius: '4px', cursor: i === sortedEntries.length - 1 ? 'not-allowed' : 'pointer', opacity: i === sortedEntries.length - 1 ? 0.4 : 1 }}
                  >↓</button>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleActive(entry)}
                  style={{ padding: '4px 10px', fontSize: '0.8rem', background: entry.is_active ? '#fff3cd' : '#d4edda', color: entry.is_active ? '#856404' : '#155724', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {entry.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(entry)}
                  style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#cce5ff', color: '#004085', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >Edit</button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '40px 16px', overflowY: 'auto',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '680px',
            padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: 'modal-in 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'Edit Entry' : 'New Welcome Entry'}</h3>
              <button
                type="button"
                onClick={closeForm}
                style={{ background: '#f1f3f5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem' }}
              >✕</button>
            </div>

            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

            {/* Language Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '20px' }}>
              <button type="button" style={S.tabBtn(activeTab === 'en')} onClick={() => setActiveTab('en')}>🇬🇧 English</button>
              <button type="button" style={S.tabBtn(activeTab === 'zh')} onClick={() => setActiveTab('zh')}>🇨🇳 中文</button>
            </div>

            <form onSubmit={handleSubmit} className="event-form" style={{ gap: '0' }}>
              {/* Language-specific fields */}
              <LangFields form={form} lang={activeTab} onChange={handleFieldChange} />

              {/* Shared fields (shown below tabs) */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                  Pastor Photo <span style={{ color: '#999', fontWeight: 400 }}>(shared across languages)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {form.image_url && (
                    <img
                      src={`${BASE_URL}${form.image_url}`}
                      alt="Preview"
                      style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0a500' }}
                    />
                  )}
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
                    {imageUploading && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>Uploading...</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>Display Order</label>
                    <input
                      type="number"
                      value={form.order_index}
                      onChange={e => handleFieldChange('order_index', Number(e.target.value))}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                    <input
                      type="checkbox"
                      id="is-active-check"
                      checked={form.is_active}
                      onChange={e => handleFieldChange('is_active', e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="is-active-check" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                      Active (visible on home page)
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeForm} style={{ backgroundColor: '#6c757d' }}>Cancel</button>
                <button type="submit" disabled={submitting || imageUploading} style={{ backgroundColor: '#f0a500' }}>
                  {submitting ? 'Saving...' : editingId ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeManager;
