import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SongDetail({ token, BASE_URL }) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/songs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSong(data);
        }
      } catch (error) {
        console.error('Error fetching song:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id, BASE_URL]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) navigate('/worship/songs');
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Extract the MIME type embedded in our proxy URL (?type=...)
  const getMimeFromUrl = (url) => {
    try {
      const params = new URLSearchParams(url.split('?')[1] || '');
      return decodeURIComponent(params.get('type') || '');
    } catch { return ''; }
  };

  const isImage = (url) => {
    if (!url) return false;
    const mime = getMimeFromUrl(url);
    if (mime) return mime.startsWith('image/');
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url) && !url.includes('download=1');
  };

  const isPdf = (url) => {
    if (!url) return false;
    const mime = getMimeFromUrl(url);
    if (mime) return mime === 'application/pdf';
    return /\.pdf$/i.test(url);
  };

  const isOfficeDoc = (url) => {
    if (!url) return false;
    const mime = getMimeFromUrl(url);
    if (mime) return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(mime);
    return /\.(doc|docx|ppt|pptx|xls|xlsx)$/i.test(url);
  };

  // Strip download flag so the proxy serves inline, not as an attachment
  const getInlineUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url.replace('&download=1', '').replace('?download=1&', '?').replace('?download=1', '')}`;
  };

  const renderMusicSheetPreview = (url) => {
    const fullInlineUrl = getInlineUrl(url);
    if (isImage(url)) {
      return (
        <img
          src={fullInlineUrl}
          alt="Music Sheet"
          style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      );
    }
    if (isPdf(url)) {
      return (
        <iframe
          src={fullInlineUrl}
          title="PDF Preview"
          style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      );
    }
    if (isOfficeDoc(url)) {
      // Google Docs Viewer supports DOC, DOCX, PPT, PPTX, XLS, XLSX
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullInlineUrl)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          title="Document Preview"
          style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      );
    }
    // Unknown type — show a download prompt
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '4px', color: '#666' }}>
        Preview not supported for this file type.
      </div>
    );
  };

  const handleDownload = async (e, sheetUrl, sheetName) => {
    e.preventDefault();
    const targetUrl = sheetUrl || song.music_sheet_url;
    if (!targetUrl) return;

    // Build the absolute URL for fetching
    const fetchUrl = targetUrl.startsWith('http') ? targetUrl : `${BASE_URL}${targetUrl}`;

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();

      let filename = sheetName || targetUrl.split('/').pop().split('?')[0];
      try { filename = decodeURIComponent(filename); } catch (_) { /* ignore */ }

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({ suggestedName: filename });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(fetchUrl, '_blank');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!song) return <div>Song not found</div>;

  return (
    <div className="event-detail-container">
      <div className="event-detail-actions">
        <button onClick={() => navigate('/worship/songs')} className="back-btn">← Back</button>
        <div className="action-buttons">
          <button onClick={handleShare} className="icon-btn share-icon-btn" title="Share">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
          {token && (
            <>
              <button onClick={() => navigate(`/worship/songs/${id}/edit`)} className="icon-btn" title="Edit" style={{ color: '#007bff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button onClick={handleDelete} className="icon-btn delete-icon-btn" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {song.image_url && (
        <div className="event-detail-header" style={{ backgroundImage: `url(${song.image_url.startsWith('http') ? song.image_url : `${BASE_URL}${song.image_url}`})`, height: '200px' }}></div>
      )}

      <div className="event-detail-content">
        <h1>{song.title}</h1>
        <p className="event-meta">By {song.author || 'Unknown'} • {song.locale === 'zh' ? 'Chinese' : 'English'}</p>

        {song.video_url && getYoutubeEmbedUrl(song.video_url) && (
          <div style={{ margin: '20px 0', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe src={getYoutubeEmbedUrl(song.video_url)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} frameBorder="0" allowFullScreen title="Song Video"></iframe>
          </div>
        )}

        {/* Music Sheets — new multi-file format */}
        {(() => {
          // Support both new array format and legacy single URL
          const sheets = Array.isArray(song.music_sheet_files) && song.music_sheet_files.length > 0
            ? song.music_sheet_files
            : song.music_sheet_url
              ? [{ name: 'Music Sheet', url: song.music_sheet_url, type: '' }]
              : [];

          if (sheets.length === 0) return null;

          return (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '12px' }}>Music Sheets</h3>
              {sheets.map((sheet, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '20px',
                    padding: '20px',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                      {sheet.name || `Sheet ${idx + 1}`}
                    </h4>
                    <a
                      href={sheet.url.startsWith('http') ? sheet.url : `${BASE_URL}${sheet.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      title="Download"
                      style={{
                        display: 'inline-flex',
                        textDecoration: 'none',
                        color: '#333',
                        width: 'auto',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ddd',
                        alignItems: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={e => { e.preventDefault(); handleDownload(e, sheet.url, sheet.name); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span style={{ marginLeft: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Download</span>
                    </a>
                  </div>
                  {renderMusicSheetPreview(sheet.url)}
                </div>
              ))}
            </div>
          );
        })()}

        {song.lyrics && (
          <div className="event-description" style={{ whiteSpace: 'pre-wrap', marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>{song.lyrics}</div>
        )}
      </div>
    </div>
  );
}

export default SongDetail;