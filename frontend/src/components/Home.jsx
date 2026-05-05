import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../hooks/usePushNotifications';


function Home({ BASE_URL, token, userRole }) {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [songs, setSongs] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [mySchedule, setMySchedule] = useState([]);
  const [salvationCount, setSalvationCount] = useState(0);
  const [welcomeEntries, setWelcomeEntries] = useState([]);
  const navigate = useNavigate();
  const { permission, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    if (token && permission === 'default') {
      // Small delay so it doesn't pop up INSTANTLY upon rendering
      const timer = setTimeout(() => {
        subscribeToPush(token, BASE_URL);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, permission, subscribeToPush]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {

        const response = await fetch(`${BASE_URL}/api/events`);
        if (response.ok) {
          const data = await response.json();
          // Filter for upcoming events (date >= today)
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Include events from earlier today
          const upcomingEvents = data.filter(event => new Date(event.date) >= now);
          setEvents(upcomingEvents.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/songs`);
        if (response.ok) {
          const data = await response.json();
          setSongs(data.reverse().slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchSongs();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/news`);
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const upcoming = data.filter(item => {
            const effectiveEnd = item.date_to ? new Date(item.date_to) : new Date(item.date_from);
            return effectiveEnd >= now;
          });
          setNews(upcoming.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, [BASE_URL]);

  useEffect(() => {
    if (token) {
      const fetchUserLikes = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/likes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserLikes(new Set(data));
          }
        } catch (error) {
          console.error('Error fetching likes:', error);
        }
      };
      fetchUserLikes();
    } else {
      setUserLikes(new Set());
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    const fetchWelcomeEntries = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/welcome-entries`);
        if (response.ok) {
          const data = await response.json();
          setWelcomeEntries(data);
        }
      } catch (error) {
        console.error('Error fetching welcome entries:', error);
      }
    };
    fetchWelcomeEntries();
  }, [BASE_URL]);

  // Fetch User Profile and Personal Schedule
  useEffect(() => {
    if (token) {
      const fetchPersonalData = async () => {
        try {
          // 1. Get Profile
          const profileRes = await fetch(`${BASE_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            setCurrentUser(profile);

            // 2. Get Schedule and Filter
            const scheduleRes = await fetch(`${BASE_URL}/api/worship/schedule`);
            const eventsRes = await fetch(`${BASE_URL}/api/events`);

            if (scheduleRes.ok && eventsRes.ok) {
              const scheduleData = await scheduleRes.json();
              const eventsData = await eventsRes.json();

              // Map events to schedule entries
              const myAssignments = scheduleData
                .filter(entry => entry.member.email === profile.email) // Match by email
                .map(entry => {
                  const event = eventsData.find(e => e.id === entry.event_id);
                  return { ...entry, event };
                })
                .filter(item => item.event && new Date(item.event.date) >= new Date()) // Only upcoming
                .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

              setMySchedule(myAssignments);
            }

            // 3. Get Salvation Stats (if admin)
            if (['admin', 'developer', 'editor'].includes(profile.role)) {
              const salvationRes = await fetch(`${BASE_URL}/api/salvation/commitments`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (salvationRes.ok) {
                const data = await salvationRes.json();
                setSalvationCount(data.length);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching personal data:', error);
        }
      };
      fetchPersonalData();
    }
  }, [token, BASE_URL]);

  const toggleLike = async (e, eventId) => {
    e.stopPropagation();
    if (!token) {
      alert(t('home.alert.login_to_like'));
      return;
    }

    // Optimistic update
    const isLiked = userLikes.has(eventId);
    const newLikes = new Set(userLikes);
    if (isLiked) newLikes.delete(eventId);
    else newLikes.add(eventId);
    setUserLikes(newLikes);

    setEvents(events.map(ev =>
      ev.id === eventId ? { ...ev, likes_count: ev.likes_count + (isLiked ? -1 : 1) } : ev
    ));

    try {
      await fetch(`${BASE_URL}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: eventId })
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error could go here
    }
  };

  const isNewSong = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="home-container">
      {/* Dashboard Widgets */}
      {token && currentUser && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {/* My Schedule Widget */}
          <div className="event-card" style={{ cursor: 'default', padding: '20px', borderLeft: '4px solid #007bff' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {t('home.my_schedule')}
            </h3>
            {mySchedule.length === 0 ? (
              <p style={{ color: '#666' }}>{t('home.no_upcoming_assignments')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mySchedule.slice(0, 3).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.event.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(item.event.date).toLocaleDateString()}</div>
                    </div>
                    <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
                      {item.role.name}
                    </span>
                  </div>
                ))}
                {mySchedule.length > 3 && <button onClick={() => navigate('/worship/schedule')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{t('home.view_all_count')} ({mySchedule.length})</button>}
              </div>
            )}
          </div>

          {/* Admin Stats Widget */}
          {['admin', 'developer', 'editor'].includes(currentUser.role) && (
            <div className="event-card" style={{ cursor: 'pointer', padding: '20px', borderLeft: '4px solid #FE5708', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onClick={() => navigate('/salvation/admin')}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#FE5708' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                {t('home.salvation_decisions')}
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#333' }}>
                {salvationCount}
              </div>
              <p style={{ margin: 0, color: '#666' }}>{t('home.total_commitments')}</p>
            </div>
          )}
        </div>
      )}

      <div className="section-header">
        <h2>{t('home.upcoming_events')}</h2>
        <button className="view-all-btn" onClick={() => navigate('/events')}>{t('home.view_all')}</button>
      </div>
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>{t('home.no_upcoming_events')}</div>
      ) : (
        <div className="horizontal-scroll-container">
          {events.map(event => (
            <div key={event.id} className="horizontal-card" onClick={() => navigate(`/events/${event.id}`)}>
              <div
                className="card-image"
                style={{ backgroundImage: `url(${event.image_url ? (event.image_url.startsWith('http') ? event.image_url : `${BASE_URL}${event.image_url}`) : 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}
              ></div>
              <div className="card-content">
                <h3>{event.title}</h3>
                <p>
                  {new Date(event.date).toLocaleDateString()}
                  {event.location ? ` • ${event.location}` : ''}
                </p>
                <div className="card-actions">
                  <button className={`icon-btn like-icon-btn ${userLikes.has(event.id) ? 'liked' : ''}`} onClick={(e) => toggleLike(e, event.id)} title="Like">
                    <svg className="like-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    {event.likes_count > 0 && <span style={{ marginLeft: '5px', fontSize: '0.9rem' }}>{event.likes_count}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-header" style={{ marginTop: '30px' }}>
        <h2>{t('home.latest_news')}</h2>
        <button className="view-all-btn" onClick={() => navigate('/news')}>{t('home.view_all')}</button>
      </div>
      {news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>{t('home.no_news')}</div>
      ) : (
        <div className="horizontal-scroll-container">
          {news.map(item => (
            <div key={item.id} className="horizontal-card" onClick={() => navigate(`/news/${item.id}`)}
              style={{ cursor: 'pointer' }}>
              <div
                className="card-image"
                style={{ backgroundImage: `url(${item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`) : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1350&q=80'})` }}
              />
              <div className="card-content">
                <h3>{item.title}</h3>
                <p>{new Date(item.date_from).toLocaleDateString()}{item.date_to ? ` — ${new Date(item.date_to).toLocaleDateString()}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-header" style={{ marginTop: '30px' }}>
        <h2>{t('home.new_songs')}</h2>
        <button className="view-all-btn" onClick={() => navigate('/worship/songs')}>{t('home.view_all')}</button>
      </div>
      {songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>{t('home.no_songs')}</div>
      ) : (
        <div className="horizontal-scroll-container">
          {songs.map(song => (
            <div key={song.id} className="horizontal-card" onClick={() => navigate(`/worship/songs/${song.id}`)}>
              <div
                className="card-image"
                style={{ backgroundImage: `url(${song.image_url ? (song.image_url.startsWith('http') ? song.image_url : `${BASE_URL}${song.image_url}`) : 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'})` }}
              ></div>
              <div className="card-content">
                <h3>
                  {song.title}
                  {isNewSong(song.created_at) && (
                    <span style={{ backgroundColor: '#ff4757', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>{t('home.new_badge')}</span>
                  )}
                </h3>
                <p>{song.author || t('home.unknown_author')} • {song.locale === 'zh' ? t('home.language_chinese') : t('home.language_english')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Section — Testimonial Card Grid */}
      <div className="welcome-section-v2">
        {/* Section Header */}
        <div className="welcome-section-header">
          <h2 className="welcome-section-title">{t('home.welcome_title')}</h2>
          <div className="welcome-section-divider" />
          <p className="welcome-section-subtitle">{t('home.welcome_subtitle')}</p>
          {['admin', 'developer'].includes(userRole) && (
            <button
              onClick={() => navigate('/admin/welcome-section')}
              style={{ marginTop: '12px', marginBottom: '12px', backgroundColor: '#f0a500', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              ✏️ Manage Welcome Section
            </button>
          )}
        </div>

        {/* Cards */}
        {welcomeEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            {t('home.no_welcome_entries')}
          </div>
        ) : (
          <div className="welcome-cards-grid">
            {welcomeEntries.map((entry, i) => {
              const lang = i18n.language || 'en';
              const text = (lang === 'zh' && entry.zh_text) ? entry.zh_text : entry.en_text;
              const title = (lang === 'zh' && entry.zh_title) ? entry.zh_title : entry.en_title;
              const author = (lang === 'zh' && entry.zh_author) ? entry.zh_author : entry.en_author;
              const sub = (lang === 'zh' && entry.zh_subtitle) ? entry.zh_subtitle : entry.en_subtitle;
              // Center card when there are 3+ entries
              const isCenter = welcomeEntries.length >= 3 && i === Math.floor(welcomeEntries.length / 2);
              return (
                <div key={entry.id} className={`welcome-card${isCenter ? ' center' : ''}`}>
                  {/* Circular avatar sits on top of card */}
                  <div className="welcome-card-avatar-wrap">
                    {entry.image_url ? (
                      <img
                        src={entry.image_url.startsWith('http') ? entry.image_url : `${BASE_URL}${entry.image_url}`}
                        alt={author || title}
                        className="welcome-card-avatar"
                      />
                    ) : (
                      <div className="welcome-card-avatar welcome-card-avatar-placeholder">👤</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="welcome-card-body">
                    <span className="welcome-card-quote-open">❝❝</span>
                    <p className="welcome-card-text">{text}</p>
                    <span className="welcome-card-quote-close">❞❞</span>
                    <div className="welcome-card-footer">
                      <span className="welcome-card-author">{author || title}</span>
                      {sub && <span className="welcome-card-role"> {sub}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Home;