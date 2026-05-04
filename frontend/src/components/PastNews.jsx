import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function PastNews({ token, BASE_URL }) {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPastNews();
  }, []);

  const fetchPastNews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/news`);
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        // Past: date_to < now (if has date_to), OR date_from < now (if no date_to)
        const past = data.filter(item => {
          const effectiveEnd = item.date_to ? new Date(item.date_to) : new Date(item.date_from);
          return effectiveEnd < now;
        });
        setNews(past);
      }
    } catch (error) {
      console.error('Error fetching past news:', error);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredNews = news
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return sortOrder === 'asc'
        ? new Date(a.date_from) - new Date(b.date_from)
        : new Date(b.date_from) - new Date(a.date_from);
    });

  const formatDateRange = (item) => {
    const from = new Date(item.date_from).toLocaleDateString();
    if (!item.date_to) return from;
    const to = new Date(item.date_to).toLocaleDateString();
    return `${from} — ${to}`;
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>{t('news.past_title')}</h2>
        <button onClick={() => navigate('/news')} className="back-btn">{t('news.back_to_news')}</button>
      </div>

      {/* Search + Sort */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={t('news.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', flex: 1, minWidth: '180px', boxSizing: 'border-box' }}
        />
        <button
          onClick={() => toggleSort('date')}
          style={{
            padding: '8px 12px', borderRadius: '4px', border: `1px solid ${sortBy === 'date' ? '#007bff' : '#ddd'}`,
            backgroundColor: sortBy === 'date' ? '#e7f0ff' : 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', color: 'black', gap: '5px'
          }}
        >
          <span>{t('news.sort_date')}</span>
          {sortBy === 'date' && (sortOrder === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
          ))}
        </button>
        <button
          onClick={() => toggleSort('name')}
          style={{
            padding: '8px 12px', borderRadius: '4px', border: `1px solid ${sortBy === 'name' ? '#007bff' : '#ddd'}`,
            backgroundColor: sortBy === 'name' ? '#e7f0ff' : 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', color: 'black', gap: '5px'
          }}
        >
          <span>{t('news.sort_name')}</span>
          {sortBy === 'name' && (sortOrder === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
          ))}
        </button>
      </div>

      {filteredNews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888', fontSize: '1.2rem' }}>{t('news.past_empty')}</div>
      ) : (
        Object.entries(
          filteredNews.reduce((acc, item) => {
            const date = new Date(item.date_from);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(item);
            return acc;
          }, {})
        ).map(([month, monthNews]) => (
          <div key={month} className="month-group">
            <h3 className="month-header">{month}</h3>
            <div className="events-grid">
              {monthNews.map(item => (
                <div key={item.id} className="event-card" onClick={() => navigate(`/news/${item.id}`)} style={{ cursor: 'pointer' }}>
                  <div
                    className="event-image"
                    style={{ backgroundImage: `url(${item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`) : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1350&q=80'})` }}
                  >
                    <div className="event-date-badge">
                      {new Date(item.date_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>{item.title}</h3>
                    <p className="event-meta">{formatDateRange(item)}</p>
                    <p className="event-desc" style={{ WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PastNews;
