import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Helper: get file type icon based on MIME type
function FileIcon({ type }) {
  if (!type) return <span>📎</span>;
  if (type.startsWith('image/')) return <span>🖼️</span>;
  if (type === 'application/pdf') return <span>📄</span>;
  if (type.includes('word') || type.includes('document')) return <span>📝</span>;
  if (type.includes('presentation') || type.includes('powerpoint')) return <span>📊</span>;
  if (type.includes('sheet') || type.includes('excel')) return <span>📋</span>;
  return <span>📎</span>;
}

const MAX_SHEETS = 5;

function CreateEditSong({ token, BASE_URL }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    locale: 'en',
    lyrics: '',
    image_url: '',
    video_url: '',
    music_sheet_url: '',
  });
  // Each sheet: { localId, driveId, name, url, type, status: 'pending'|'uploading'|'done'|'error', file?, preview? }
  const [musicSheets, setMusicSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const sheetInputRef = useRef();
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
            // Populate musicSheets from the saved array
            if (Array.isArray(data.music_sheet_files) && data.music_sheet_files.length > 0) {
              setMusicSheets(
                data.music_sheet_files.map((f, idx) => ({
                  localId: `existing-${idx}`,
                  driveId: f.driveId || null,
                  name: f.name || 'File',
                  url: f.url,
                  type: f.type || '',
                  status: 'done',
                }))
              );
            }
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

  // ── Image upload (single) ────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ file: reader.result, filename: file.name, folder: 'song', songTitle: formData.title }),
        });
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, image_url: data.url }));
        } else {
          alert('Image upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Image upload error');
      } finally {
        setImageUploading(false);
      }
    };
  };

  // ── Music sheet: select files ────────────────
  // ── Music sheet: select files → upload immediately ──────────
  const handleSheetFilesSelect = async (files) => {
    if (musicSheets.length >= MAX_SHEETS) return;
    const slots = MAX_SHEETS - musicSheets.length;
    const filesToAdd = Array.from(files).slice(0, slots);
    if (filesToAdd.length === 0) return;

    // First: add all files to the list immediately with 'uploading' status
    const newEntries = filesToAdd.map(file => ({
      localId: Math.random().toString(36).substr(2, 9),
      driveId: null,
      name: file.name,
      url: null,
      type: file.type,
      status: 'uploading',
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setMusicSheets(prev => [...prev, ...newEntries]);

    // Then: upload each file immediately to Drive
    const currentTitle = formData.title.trim() || 'Untitled';
    const results = await Promise.allSettled(
      newEntries.map(async (entry) => {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(entry.file);
        });
        const res = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            file: base64,
            filename: entry.name,
            folder: 'song',
            songTitle: currentTitle,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return { localId: entry.localId, data };
      })
    );

    // Update each entry's status based on upload result
    setMusicSheets(prev => {
      const updated = [...prev];
      results.forEach((result, idx) => {
        const localId = newEntries[idx].localId;
        const sheetIdx = updated.findIndex(s => s.localId === localId);
        if (sheetIdx === -1) return;
        if (result.status === 'fulfilled') {
          const { data } = result.value;
          updated[sheetIdx] = {
            ...updated[sheetIdx],
            driveId: data.driveId,
            url: data.url,
            type: data.contentType || updated[sheetIdx].type,
            status: 'done',
            file: null,
          };
        } else {
          updated[sheetIdx] = {
            ...updated[sheetIdx],
            status: 'error',
            error: result.reason?.message || 'Upload failed',
          };
        }
      });
      return updated;
    });
  };

  // ── Music sheet: upload all pending ─────────
  const uploadPendingSheets = async (sheets, title) => {
    const updated = [...sheets];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;
      updated[i] = { ...updated[i], status: 'uploading' };
      setMusicSheets([...updated]);

      try {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(updated[i].file);
        });
        const res = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            file: base64,
            filename: updated[i].name,
            folder: 'song',
            songTitle: title,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        updated[i] = {
          ...updated[i],
          driveId: data.driveId,
          url: data.url,
          type: data.contentType || updated[i].type,
          status: 'done',
          file: null,
        };
      } catch (err) {
        updated[i] = { ...updated[i], status: 'error', error: err.message };
      }
      setMusicSheets([...updated]);
    }
    return updated;
  };

  // ── Music sheet: remove (+ Drive delete if uploaded) ──
  const removeSheet = async (localId) => {
    const sheet = musicSheets.find(s => s.localId === localId);
    if (!sheet) return;

    // If already uploaded to Drive, delete it
    if (sheet.driveId) {
      try {
        await fetch(`${BASE_URL}/api/gallery/${encodeURIComponent(sheet.driveId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Drive delete error:', err);
      }
    }
    setMusicSheets(prev => prev.filter(s => s.localId !== localId));
  };

  // ── Form submit ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Song title is required');
      return;
    }
    setUploading(true);
    try {
      // 1. Upload any pending sheets first
      const finalSheets = await uploadPendingSheets(musicSheets, formData.title);
      const hasErrors = finalSheets.some(s => s.status === 'error');
      if (hasErrors) {
        alert('Some files failed to upload. Please remove them or retry.');
        setUploading(false);
        return;
      }

      // 2. Build the files array for storage (only done ones)
      const music_sheet_files = finalSheets
        .filter(s => s.status === 'done')
        .map(s => ({ driveId: s.driveId, name: s.name, url: s.url, type: s.type }));

      const endpoint = isEdit ? `${BASE_URL}/api/songs/${id}` : `${BASE_URL}/api/songs`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, music_sheet_files }),
      });

      if (response.ok) {
        navigate(isEdit ? `/worship/songs/${id}` : '/worship/songs');
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to save song');
      }
    } catch (error) {
      console.error('Error saving song:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const uploadingCount = musicSheets.filter(s => s.status === 'uploading').length;
  const isDocUploading = uploadingCount > 0;

  return (
    <div className="events-container">
      <h2>{isEdit ? 'Edit Song' : 'Create Song'}</h2>
      <form onSubmit={handleSubmit} className="event-form">

        {/* Title */}
        <input
          type="text"
          placeholder="Song Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Author */}
        <input
          type="text"
          placeholder="Author / Artist"
          value={formData.author}
          onChange={e => setFormData({ ...formData, author: e.target.value })}
        />

        {/* Locale */}
        <select
          value={formData.locale}
          onChange={e => setFormData({ ...formData, locale: e.target.value })}
          style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>

        {/* Image URL */}
        <input
          type="text"
          placeholder="Image URL (Optional)"
          value={formData.image_url}
          onChange={e => setFormData({ ...formData, image_url: e.target.value })}
        />
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Or Upload Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={imageUploading}
          />
          {imageUploading && <span style={{ fontSize: '0.8rem', color: '#888' }}> Uploading…</span>}
        </div>

        {/* YouTube URL */}
        <input
          type="text"
          placeholder="YouTube Video URL (Optional)"
          value={formData.video_url}
          onChange={e => setFormData({ ...formData, video_url: e.target.value })}
        />

        {/* ── Music Sheets ── */}
        <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Music Sheets / Scores
          </label>

          {/* File picker */}
          <input
            ref={sheetInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { handleSheetFilesSelect(e.target.files); e.target.value = ''; }}
          />
          <button
            type="button"
            onClick={() => sheetInputRef.current?.click()}
            disabled={musicSheets.length >= MAX_SHEETS}
            style={{
              padding: '8px 16px',
              border: `2px dashed ${musicSheets.length >= MAX_SHEETS ? '#ddd' : '#aaa'}`,
              borderRadius: '6px',
              background: 'transparent',
              cursor: musicSheets.length >= MAX_SHEETS ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              color: musicSheets.length >= MAX_SHEETS ? '#bbb' : '#555',
              width: '100%',
              marginBottom: '6px',
            }}
          >
            + Add Files (PDF, DOC, PPT, Image…)
          </button>
          <div style={{ fontSize: '0.78rem', color: musicSheets.length >= MAX_SHEETS ? '#e53e3e' : '#999', marginBottom: '10px' }}>
            {musicSheets.length}/{MAX_SHEETS} files{musicSheets.length >= MAX_SHEETS ? ' — limit reached' : ''}
          </div>

          {/* Sheet list */}
          {musicSheets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {musicSheets.map(sheet => (
                <div
                  key={sheet.localId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: sheet.status === 'error' ? '#fff5f5' : sheet.status === 'done' ? '#f0fff4' : '#fafafa',
                  }}
                >
                  <FileIcon type={sheet.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sheet.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: sheet.status === 'error' ? '#e53e3e' : '#888', marginTop: '2px' }}>
                      {sheet.status === 'pending' && '⏳ Ready to upload'}
                      {sheet.status === 'uploading' && '⬆️ Uploading…'}
                      {sheet.status === 'done' && '✅ Uploaded'}
                      {sheet.status === 'error' && `❌ ${sheet.error || 'Upload failed'}`}
                    </div>
                  </div>

                  {/* Preview for images */}
                  {sheet.preview && sheet.type?.startsWith('image/') && (
                    <img
                      src={sheet.preview}
                      alt={sheet.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  )}
                  {/* Uploaded image preview from Drive URL (for existing or just uploaded) */}
                  {!sheet.preview && sheet.status === 'done' && sheet.url && sheet.type?.startsWith('image/') && (
                    <img
                      src={`${BASE_URL}${sheet.url}`}
                      alt={sheet.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeSheet(sheet.localId)}
                    title="Remove"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e53e3e',
                      fontSize: '1.2rem',
                      lineHeight: 1,
                      padding: '4px',
                      flexShrink: 0,
                    }}
                    disabled={sheet.status === 'uploading'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lyrics */}
        <textarea
          placeholder="Lyrics"
          value={formData.lyrics}
          onChange={e => setFormData({ ...formData, lyrics: e.target.value })}
          style={{ minHeight: '200px' }}
        />

        <button type="submit" disabled={uploading || imageUploading || isDocUploading}>
          {isDocUploading
            ? `Uploading ${uploadingCount} file(s)…`
            : uploading
              ? 'Saving…'
              : isEdit ? 'Update Song' : 'Create Song'}
        </button>
      </form>
    </div>
  );
}

export default CreateEditSong;