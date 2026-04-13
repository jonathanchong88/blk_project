import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Linkify helper: convert URLs in plain text to clickable <a> tags
function Linkify({ text }) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', wordBreak: 'break-all' }}>
            {part}
          </a>
        ) : (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
        )
      )}
    </>
  );
}

// File type icon
function FileIcon({ type }) {
  if (!type) return <span>📎</span>;
  if (type.startsWith('image/')) return <span>🖼️</span>;
  if (type === 'application/pdf') return <span>📄</span>;
  if (type.includes('word') || type.includes('document')) return <span>📝</span>;
  if (type.includes('presentation') || type.includes('powerpoint')) return <span>📊</span>;
  if (type.includes('sheet') || type.includes('excel')) return <span>📋</span>;
  return <span>📎</span>;
}

function NewsDetail({ token, BASE_URL, userRole }) {
  const { t } = useTranslation();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  const canManageNews = ['admin', 'editor', 'developer'].includes(userRole);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/news/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNewsItem(data);
        } else {
          navigate('/news');
        }
      } catch (err) {
        console.error('Error fetching news detail:', err);
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id, BASE_URL, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(t('news.confirm_delete'))) return;
    try {
      const res = await fetch(`${BASE_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        navigate('/news');
      } else {
        alert(t('news.alert.delete_failed'));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = (doc) => {
    // Build a download link. The URL already contains the /api/image?id=...&download=1 pattern.
    const a = document.createElement('a');
    a.href = `${BASE_URL}${doc.url}`;
    a.download = doc.name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDateRange = (item) => {
    const from = new Date(item.date_from).toLocaleDateString();
    if (!item.date_to) return from;
    const to = new Date(item.date_to).toLocaleDateString();
    return `${from} — ${to}`;
  };

  if (loading) return <div style={{ padding: '2rem' }}>{t('news.loading')}</div>;
  if (!newsItem) return <div style={{ padding: '2rem' }}>{t('news.not_found')}</div>;

  const documents = Array.isArray(newsItem.documents) ? newsItem.documents : [];

  return (
    <div className="event-detail-container" style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px 40px' }}>
      {/* Cover Image */}
      {newsItem.image_url && (
        <div
          style={{
            width: '100%', height: '320px', backgroundImage: `url(${newsItem.image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px',
            marginBottom: '24px',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', lineHeight: 1.3 }}>{newsItem.title}</h1>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: '0.95rem' }}>
            📅 {formatDateRange(newsItem)}
          </p>
        </div>
        {canManageNews && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/news/${id}/edit`)}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #007bff', background: 'transparent', color: '#007bff', cursor: 'pointer', fontWeight: 500 }}
            >
              ✏️ {t('news.edit')}
            </button>
            <button
              onClick={handleDelete}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dc3545', background: 'transparent', color: '#dc3545', cursor: 'pointer', fontWeight: 500 }}
            >
              🗑️ {t('news.delete')}
            </button>
          </div>
        )}
      </div>

      {/* Back link */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/news')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', padding: 0, fontSize: '0.9rem' }}
        >
          ← {t('news.back_to_news')}
        </button>
      </div>

      <hr style={{ borderColor: '#eee', marginBottom: '24px' }} />

      {/* Description with linkify */}
      {newsItem.description && (
        <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#333', marginBottom: '32px' }}>
          <Linkify text={newsItem.description} />
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: '#444' }}>
            📁 {t('news.documents_section')} ({documents.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {documents.map((doc, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px',
                  background: '#fafafa',
                }}
              >
                <FileIcon type={doc.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>{doc.type || t('news.unknown_type')}</div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: '1px solid #28a745',
                    background: 'transparent', color: '#28a745', cursor: 'pointer', fontWeight: 500,
                    fontSize: '0.85rem', flexShrink: 0,
                  }}
                >
                  ⬇️ {t('news.download')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsDetail;
