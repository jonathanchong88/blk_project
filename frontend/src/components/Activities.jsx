import React, { useState, useEffect, useRef, useCallback } from 'react';

const PAGE_SIZE = 12;

function Activities({ token, BASE_URL }) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { url, name, index }

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchImages = useCallback(async (pg, sortOrder) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${BASE_URL}/api/gallery?page=${pg}&limit=${PAGE_SIZE}&sort=${sortOrder}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to load');
      setImages(data.images || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchImages(page, sort);
  }, [page, sort, fetchImages]);

  // ── Sort toggle ──────────────────────────────
  const handleSort = (val) => {
    setSort(val);
    setPage(1);
  };

  // ── File selection ───────────────────────────
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    setUploadError('');
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e) => handleFileSelect(e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const resetUpload = () => {
    setUploadPreview(null);
    setUploadFile(null);
    setUploadError('');
    setShowUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Upload submit ────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const res = await fetch(`${BASE_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: uploadPreview, filename: uploadFile.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
      resetUpload();
      // Refresh to page 1 to see the new image (newest first)
      setSort('desc');
      setPage(1);
      fetchImages(1, 'desc');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ───────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const encodedName = encodeURIComponent(deleteTarget.name);
      const res = await fetch(`${BASE_URL}/api/gallery/${encodedName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Delete failed');
      }
      setDeleteTarget(null);
      fetchImages(page, sort);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Lightbox keyboard nav ───────────────────
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight' && lightbox.index < images.length - 1)
        setLightbox({ ...images[lightbox.index + 1], index: lightbox.index + 1 });
      if (e.key === 'ArrowLeft' && lightbox.index > 0)
        setLightbox({ ...images[lightbox.index - 1], index: lightbox.index - 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, images]);

  const formatDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const pageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="activities-page">
      {/* ── Header ── */}
      <div className="activities-header">
        <div>
          <h1 className="activities-title">Activities</h1>
          <p className="activities-subtitle">
            {total} photo{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="activities-header-actions">
          {/* Sort */}
          <div className="sort-toggle">
            <button
              className={`sort-btn ${sort === 'desc' ? 'active' : ''}`}
              onClick={() => handleSort('desc')}
            >
              Newest
            </button>
            <button
              className={`sort-btn ${sort === 'asc' ? 'active' : ''}`}
              onClick={() => handleSort('asc')}
            >
              Oldest
            </button>
          </div>
          {/* Upload – only for logged-in users */}
          {token && (
            <button className="upload-gallery-btn" onClick={() => setShowUpload(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              Upload
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div className="gallery-error">{error}</div>}

      {/* ── Grid ── */}
      {loading ? (
        <div className="gallery-loading">
          <div className="gallery-spinner" />
          Loading photos…
        </div>
      ) : images.length === 0 ? (
        <div className="gallery-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>No photos yet. {token ? 'Upload the first one!' : 'Check back later.'}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div
              key={img.name}
              className="gallery-card"
              onClick={() => setLightbox({ ...img, index: idx })}
            >
              <div className="gallery-card-img-wrap">
                <img src={img.url} alt={img.name} loading="lazy" />
                <div className="gallery-card-overlay">
                  {token && (
                    <button
                      className="gallery-delete-btn"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(img); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                  <svg className="gallery-zoom-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
              {img.createdAt && (
                <div className="gallery-card-date">{formatDate(img.createdAt)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ‹ Prev
          </button>
          {pageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
            ) : (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUpload && (
        <div className="gallery-modal-overlay" onClick={resetUpload}>
          <div className="gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>Upload Photo</h2>
              <button className="gallery-modal-close" onClick={resetUpload}>✕</button>
            </div>

            {!uploadPreview ? (
              <div
                className={`gallery-dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                  <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                <p>Drag &amp; drop or <span className="dropzone-link">browse</span></p>
                <p className="dropzone-hint">JPG, PNG, WEBP, GIF — max 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileInputChange}
                />
              </div>
            ) : (
              <div className="upload-preview-wrap">
                <img src={uploadPreview} alt="Preview" className="upload-preview-img" />
                <p className="upload-preview-name">{uploadFile?.name}</p>
                <button
                  className="change-photo-btn"
                  onClick={() => { setUploadPreview(null); setUploadFile(null); }}
                >
                  Change photo
                </button>
              </div>
            )}

            {uploadError && <p className="upload-error-msg">{uploadError}</p>}

            <div className="gallery-modal-footer">
              <button className="modal-cancel-btn" onClick={resetUpload} disabled={uploading}>
                Cancel
              </button>
              <button
                className="modal-upload-btn"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button
            className="lightbox-close"
            onClick={() => setLightbox(null)}
          >✕</button>
          {lightbox.index > 0 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox({ ...images[lightbox.index - 1], index: lightbox.index - 1 });
              }}
            >‹</button>
          )}
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.index < images.length - 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox({ ...images[lightbox.index + 1], index: lightbox.index + 1 });
              }}
            >›</button>
          )}
          {lightbox.createdAt && (
            <div className="lightbox-caption">{formatDate(lightbox.createdAt)}</div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="gallery-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="gallery-modal gallery-modal--sm" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Delete Photo?</h2>
            <p style={{ color: '#555' }}>This action cannot be undone.</p>
            <div className="gallery-modal-footer">
              <button className="modal-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="modal-delete-btn" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activities;
