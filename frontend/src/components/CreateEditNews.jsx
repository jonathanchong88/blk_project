import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

const MAX_DOCS = 5;

function CreateEditNews({ token, BASE_URL }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    date_from: '',
    date_to: '',
  });
  const [hasEndDate, setHasEndDate] = useState(false);
  const [imageType, setImageType] = useState('url'); // 'url' | 'upload'
  const [imageUploading, setImageUploading] = useState(false);
  const [documents, setDocuments] = useState([]); // [{localId, driveId, name, url, type, status, file}]
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const docInputRef = useRef();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`${BASE_URL}/api/news/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setFormData({
              title: data.title || '',
              description: data.description || '',
              image_url: data.image_url || '',
              date_from: data.date_from ? data.date_from.slice(0, 16) : '',
              date_to: data.date_to ? data.date_to.slice(0, 16) : '',
            });
            if (data.date_to) setHasEndDate(true);
            if (Array.isArray(data.documents) && data.documents.length > 0) {
              setDocuments(data.documents.map((d, idx) => ({
                localId: `existing-${idx}`,
                driveId: d.driveId || null,
                name: d.name || 'File',
                url: d.url,
                type: d.type || '',
                status: 'done',
              })));
            }
          }
        })
        .catch(err => console.error('Error fetching news:', err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, BASE_URL]);

  // ── Image upload ─────────────────────────────
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
            folder: 'news',
            newsTitle: formData.title || 'Untitled',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, image_url: data.url }));
        } else {
          alert(t('news.form.image_upload_failed'));
        }
      } catch (err) {
        console.error(err);
        alert(t('news.form.image_upload_failed'));
      } finally {
        setImageUploading(false);
      }
    };
  };

  // ── Document: select files → upload immediately ──────────
  const handleDocFilesSelect = async (files) => {
    if (documents.length >= MAX_DOCS) return;
    const slots = MAX_DOCS - documents.length;
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

    setDocuments(prev => [...prev, ...newEntries]);

    // Then: upload each file immediately to Drive
    const newsTitle = formData.title.trim() || 'Untitled';
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
            folder: 'news',
            newsTitle,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return { localId: entry.localId, data };
      })
    );

    // Update each entry's status based on upload result
    setDocuments(prev => {
      const updated = [...prev];
      results.forEach((result, idx) => {
        const localId = newEntries[idx].localId;
        const docIdx = updated.findIndex(d => d.localId === localId);
        if (docIdx === -1) return;
        if (result.status === 'fulfilled') {
          const { data } = result.value;
          updated[docIdx] = {
            ...updated[docIdx],
            driveId: data.driveId,
            url: data.url,
            type: data.contentType || updated[docIdx].type,
            status: 'done',
            file: null,
          };
        } else {
          updated[docIdx] = {
            ...updated[docIdx],
            status: 'error',
            error: result.reason?.message || 'Upload failed',
          };
        }
      });
      return updated;
    });
  };

  // ── Document: upload all pending (still used as fallback on submit) ────
  const uploadPendingDocs = async (docs, title) => {
    const updated = [...docs];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue; // skip already uploaded
      updated[i] = { ...updated[i], status: 'uploading' };
      setDocuments([...updated]);
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
          body: JSON.stringify({ file: base64, filename: updated[i].name, folder: 'news', newsTitle: title }),
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
      setDocuments([...updated]);
    }
    return updated;
  };

  // ── Document: remove ────────────────────────
  const removeDoc = async (localId) => {
    const doc = documents.find(d => d.localId === localId);
    if (!doc) return;
    if (doc.driveId) {
      try {
        await fetch(`${BASE_URL}/api/gallery/${encodeURIComponent(doc.driveId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Drive delete error:', err);
      }
    }
    setDocuments(prev => prev.filter(d => d.localId !== localId));
  };

  // ── Form submit ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert(t('news.form.title_required'));
      return;
    }
    if (!formData.date_from) {
      alert(t('news.form.date_from_required'));
      return;
    }
    setSubmitting(true);
    try {
      const finalDocs = await uploadPendingDocs(documents, formData.title);
      if (finalDocs.some(d => d.status === 'error')) {
        alert(t('news.form.upload_error'));
        setSubmitting(false);
        return;
      }
      const docsSaved = finalDocs
        .filter(d => d.status === 'done')
        .map(d => ({ driveId: d.driveId, name: d.name, url: d.url, type: d.type }));

      const endpoint = isEdit ? `${BASE_URL}/api/news/${id}` : `${BASE_URL}/api/news`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          date_from: new Date(formData.date_from).toISOString(),
          date_to: hasEndDate && formData.date_to ? new Date(formData.date_to).toISOString() : null,
          documents: docsSaved,
        }),
      });

      if (res.ok) {
        navigate('/news');
      } else {
        const err = await res.json();
        alert(err.message || t('news.form.save_failed'));
      }
    } catch (err) {
      console.error('Error saving news:', err);
      alert(t('news.form.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>{t('news.loading')}</div>;

  const uploadingCount = documents.filter(d => d.status === 'uploading').length;
  const isDocUploading = uploadingCount > 0;

  return (
    <div className="events-container">
      <h2>{isEdit ? t('news.edit_title') : t('news.create_title')}</h2>
      <form onSubmit={handleSubmit} className="event-form">

        {/* Title */}
        <input
          type="text"
          placeholder={t('news.form.title')}
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Date From + End Date toggle */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="datetime-local"
            value={formData.date_from}
            onChange={e => setFormData({ ...formData, date_from: e.target.value })}
            required
            style={{ flex: 1 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={e => { setHasEndDate(e.target.checked); if (!e.target.checked) setFormData(prev => ({ ...prev, date_to: '' })); }}
            />
            {t('news.form.has_end_date')}
          </label>
        </div>

        {hasEndDate && (
          <input
            type="datetime-local"
            value={formData.date_to}
            onChange={e => setFormData({ ...formData, date_to: e.target.value })}
            required={hasEndDate}
          />
        )}

        {/* Image */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input type="radio" name="imageType" value="url" checked={imageType === 'url'} onChange={() => setImageType('url')} />
            {' '}{t('news.form.image_url')}
          </label>
          <label>
            <input type="radio" name="imageType" value="upload" checked={imageType === 'upload'} onChange={() => setImageType('upload')} />
            {' '}{t('news.form.image_upload')}
          </label>
        </div>

        {imageType === 'url' && (
          <input
            type="text"
            placeholder={t('news.form.image_url_placeholder')}
            value={formData.image_url}
            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
          />
        )}

        {imageType === 'upload' && (
          <div style={{ marginBottom: '10px' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
            {imageUploading && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{t('news.form.uploading')}</p>}
            {formData.image_url && !imageUploading && (
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'green' }}>{t('news.form.image_uploaded')}</p>
            )}
          </div>
        )}

        {/* Description */}
        <textarea
          placeholder={t('news.form.description')}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          style={{ minHeight: '200px' }}
        />

        {/* Documents */}
        <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            {t('news.form.documents')}
          </label>
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { handleDocFilesSelect(e.target.files); e.target.value = ''; }}
          />
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            disabled={documents.length >= MAX_DOCS}
            style={{
              padding: '8px 16px',
              border: `2px dashed ${documents.length >= MAX_DOCS ? '#ddd' : '#aaa'}`,
              borderRadius: '6px',
              background: 'transparent',
              cursor: documents.length >= MAX_DOCS ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              color: documents.length >= MAX_DOCS ? '#bbb' : '#555',
              width: '100%',
              marginBottom: '6px',
            }}
          >
            {t('news.form.add_documents')}
          </button>
          <div style={{ fontSize: '0.78rem', color: documents.length >= MAX_DOCS ? '#e53e3e' : '#999', marginBottom: '10px' }}>
            {documents.length}/{MAX_DOCS} {t('news.form.files')}{documents.length >= MAX_DOCS ? ` — ${t('news.form.limit_reached')}` : ''}
          </div>

          {documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map(doc => (
                <div
                  key={doc.localId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px',
                    background: doc.status === 'error' ? '#fff5f5' : doc.status === 'done' ? '#f0fff4' : '#fafafa',
                  }}
                >
                  <FileIcon type={doc.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: doc.status === 'error' ? '#e53e3e' : '#888', marginTop: '2px' }}>
                      {doc.status === 'pending' && '⏳ ' + t('news.form.doc_ready')}
                      {doc.status === 'uploading' && '⬆️ ' + t('news.form.doc_uploading')}
                      {doc.status === 'done' && '✅ ' + t('news.form.doc_uploaded')}
                      {doc.status === 'error' && `❌ ${doc.error || t('news.form.doc_failed')}`}
                    </div>
                  </div>

                  {/* Image preview thumbnail */}
                  {doc.preview && doc.type?.startsWith('image/') && (
                    <img
                      src={doc.preview}
                      alt={doc.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', flexShrink: 0 }}
                    />
                  )}
                  {/* Uploaded image preview from Drive URL */}
                  {!doc.preview && doc.status === 'done' && doc.url && doc.type?.startsWith('image/') && (
                    <img
                      src={`${BASE_URL}${doc.url}`}
                      alt={doc.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', flexShrink: 0 }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeDoc(doc.localId)}
                    disabled={doc.status === 'uploading'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '1.2rem', lineHeight: 1, padding: '4px', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => navigate('/news')} style={{ backgroundColor: '#6c757d' }}>
            {t('news.form.cancel')}
          </button>
          <button type="submit" disabled={submitting || imageUploading || isDocUploading}>
            {isDocUploading
              ? `⬆️ ${t('news.form.uploading')} ${uploadingCount} ${t('news.form.file_s')}…`
              : submitting
                ? t('news.form.saving')
                : isEdit ? t('news.form.update') : t('news.form.create')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEditNews;
