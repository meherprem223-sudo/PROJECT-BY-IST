import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Compass,
  GraduationCap,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import './style.css';
import './navigation.css';

// In development, Vite forwards /api requests to Flask. When Flask serves the
// built app, the empty base keeps API requests on the same origin. Set
// VITE_API_URL only when hosting the frontend separately.
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_PAGES = ['Explore', 'My events', 'Workshops', 'Recaps', 'Alerts'];
const PAGE_SIZE = 30;

async function readApiResponse(response) {
  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    if (body.trimStart().startsWith('<')) {
      throw new Error(
        'The events API returned an HTML page instead of JSON. Check that VITE_API_URL points to the backend service, then redeploy the frontend.'
      );
    }
    throw new Error('The events API returned an invalid response. Please try again later.');
  }
  return data;
}

const initials = (s = '') =>
  s
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const statusOpen = (e) =>
  ['open', 'published', 'active'].includes((e?.status || '').toLowerCase());

const pageFromHash = () => {
  const page = decodeURIComponent(window.location.hash.slice(1));
  return VALID_PAGES.includes(page) ? page : 'Explore';
};

function App() {
  const [events, setEvents] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All events');
  const [view, setView] = useState(pageFromHash);
  const [userId, setUserId] = useState(() => localStorage.getItem('campus-user-id') || '');
  const [modal, setModal] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attendees, setAttendees] = useState(null);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const toastTimerRef = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const fetchEvents = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true);
      } else {
        if (loadingMore) return;
        setLoadingMore(true);
      }
      setError('');
      try {
        const off = reset ? 0 : offset;
        const r = await fetch(`${API}/api/events?limit=${PAGE_SIZE}&offset=${off}`);
        const j = await readApiResponse(r);
        if (!r.ok) throw new Error(j.error || 'Could not load events');
        const rows = j.data || [];
        setEvents((prev) => {
          if (reset) return rows;
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...rows.filter((item) => !seen.has(item.id))];
        });
        setMore(rows.length === PAGE_SIZE);
        setOffset(off + rows.length);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [loadingMore, offset]
  );

  const fetchMine = useCallback(async () => {
    if (!userId) {
      setMine([]);
      return;
    }
    try {
      const r = await fetch(
        `${API}/api/me/registrations?user_id=${encodeURIComponent(userId)}`
      );
      const j = await readApiResponse(r);
      if (!r.ok) throw new Error(j.error || 'Could not load registrations');
      setMine(j.data || []);
    } catch (e) {
      setError(e.message);
    }
  }, [userId]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchEvents(true), fetchMine()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchEvents, fetchMine]);

  useEffect(() => {
    fetchEvents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  useEffect(() => {
    const syncPage = () => {
      setView(pageFromHash());
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const navigate = (page) => {
    if (!VALID_PAGES.includes(page)) return;
    setMobileOpen(false);
    if (view === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = encodeURIComponent(page);
  };

  const resetToAllEvents = () => {
    setQuery('');
    setCategory('All events');
    navigate('Explore');
  };

  const registered = useMemo(() => new Set(mine.map((x) => x.event_id)), [mine]);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        const q = query.trim().toLowerCase();
        const search = !q || `${e.title || ''} ${e.status || ''}`.toLowerCase().includes(q);
        const c =
          category === 'All events' ||
          (category === 'Open now'
            ? statusOpen(e)
            : category === 'My events'
              ? registered.has(e.id)
              : true);
        const tab =
          view === 'My events'
            ? registered.has(e.id)
            : view === 'Workshops'
              ? /workshop|lab|hands-on/i.test(e.title || '')
              : view === 'Alerts'
                ? statusOpen(e)
                : true;
        return search && c && tab;
      }),
    [events, registered, query, category, view]
  );

  const openId = () => setModal({ type: 'identity', value: userId });

  const saveUser = (e) => {
    if (e) e.preventDefault();
    const v = (modal?.value || '').trim();
    if (v && !UUID_REGEX.test(v)) {
      notify('Enter a valid UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
      return;
    }
    setUserId(v);
    if (v) localStorage.setItem('campus-user-id', v);
    else localStorage.removeItem('campus-user-id');
    setModal(null);
    notify(v ? 'Student ID saved' : 'Student ID cleared');
  };

  const clearUser = () => {
    setUserId('');
    localStorage.removeItem('campus-user-id');
    setModal(null);
    notify('Student ID cleared');
  };

  const register = async (event) => {
    if (!userId) {
      openId();
      return;
    }
    setBusy(event.id);
    try {
      const r = await fetch(`${API}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, event_id: event.id }),
      });
      const j = await readApiResponse(r);
      if (!r.ok) throw new Error(j.error || 'Registration failed');
      notify(`You're registered for ${event.title}`);
      await fetchMine();
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy('');
    }
  };

  const openEventDetails = async (event) => {
    setEventDetail(event);
    setAttendees(null);
    setDetailLoading(true);
    try {
      const r = await fetch(`${API}/api/events/${encodeURIComponent(event.id)}`);
      const j = await readApiResponse(r);
      if (r.ok && j.data) {
        setEventDetail(j.data);
      }
    } catch {
      // Keep the already-loaded summary if detail fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const loadAttendees = async (event) => {
    if (!userId) {
      openId();
      return;
    }
    setAttendeesLoading(true);
    try {
      const r = await fetch(
        `${API}/api/events/${encodeURIComponent(event.id)}/registrations?organizer_id=${encodeURIComponent(userId)}`
      );
      const j = await readApiResponse(r);
      if (!r.ok) throw new Error(j.error || 'Could not load attendees');
      setAttendees(j.data || []);
    } catch (e) {
      notify(e.message);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const nav = [
    ['Explore', Compass],
    ['My events', Bookmark],
    ['Workshops', Sparkles],
    ['Recaps', Clock3],
    ['Alerts', Bell],
  ];
  const cards = filtered;
  const featured = events.find(statusOpen) || events[0];

  return (
    <div className="shell">
      <aside className={`sidebar ${mobileOpen ? 'show' : ''}`}>
        <div className="brand">
          <button
            className="brand-home"
            onClick={() => navigate('Explore')}
            aria-label="Campus Connect home"
          >
            <div className="brand-icon">
              <GraduationCap size={21} />
            </div>
            <div>
              <b>
                Campus<span>Connect</span>
              </b>
              <small>YOUR CAMPUS, TOGETHER</small>
            </div>
          </button>
          <button
            className="icon-btn close-nav"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="nav-caption">DISCOVER</div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              aria-current={view === label ? 'page' : undefined}
              className={`nav-link ${view === label ? 'selected' : ''}`}
              onClick={() => navigate(label)}
            >
              <Icon size={18} />
              {label}
              {label === 'My events' && mine.length > 0 && (
                <span className="nav-count">{mine.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="side-note">
            <div className="note-icon">
              <Sparkles size={16} />
            </div>
            <b>Make campus yours</b>
            <p>Find your people and your next favorite thing.</p>
            <button onClick={() => navigate('Explore')}>
              Explore events <ArrowRight size={14} />
            </button>
          </div>
          <button className="profile" onClick={openId}>
            <div className="avatar">{userId ? initials(userId.slice(0, 5)) : 'S'}</div>
            <div className="profile-text">
              <b>{userId ? 'Student account' : 'Set up student ID'}</b>
              <small>{userId ? `${userId.slice(0, 13)}…` : 'Needed to register'}</small>
            </div>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="crumb">
            Campus <span>/</span> <b>{view}</b>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn"
              title="Refresh events"
              aria-label="Refresh events"
              onClick={refreshAll}
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            </button>
            <button
              className="icon-btn bell"
              title="Campus alerts"
              aria-label="Campus alerts"
              onClick={() => navigate('Alerts')}
            >
              <Bell size={18} />
              <i />
            </button>
            <button className="account" onClick={openId}>
              <div className="avatar">{userId ? 'S' : '?'}</div>
              <span>{userId ? 'Student' : 'Account'}</span>
            </button>
          </div>
        </header>

        <div className="page">
          {view === 'Explore' && (
            <section className="welcome">
              <div className="eyebrow">
                <span className="live-dot" /> THE CAMPUS IS HAPPENING
              </div>
              <h1>
                Find your next
                <br />
                <em>favorite thing.</em>
              </h1>
              <p>Good things happen when you show up. Explore what&apos;s on around campus.</p>
              <div className="welcome-actions">
                <button
                  className="button primary"
                  onClick={() =>
                    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Explore events <ArrowRight size={16} />
                </button>
                <button className="button soft" onClick={() => navigate('My events')}>
                  <CalendarDays size={16} /> My schedule
                </button>
              </div>
              <div className="welcome-art">
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="art-sun" />
                <div className="art-card">
                  <CalendarDays size={18} />
                  <span>
                    GOOD THINGS
                    <br />
                    ARE HAPPENING
                  </span>
                </div>
                <span className="art-spark">✳</span>
                <span className="art-star">✦</span>
              </div>
            </section>
          )}

          <section className="quick-stats">
            <div>
              <span className="stat-icon indigo">
                <CalendarDays size={18} />
              </span>
              <span>
                <b>
                  {events.length}
                  {more ? '+' : ''}
                </b>
                <small>Events to explore</small>
              </span>
            </div>
            <div>
              <span className="stat-icon mint">
                <Bookmark size={18} />
              </span>
              <span>
                <b>{mine.length}</b>
                <small>On your schedule</small>
              </span>
            </div>
            <div>
              <span className="stat-icon peach">
                <Users size={18} />
              </span>
              <span>
                <b>Campus-wide</b>
                <small>Made for everyone</small>
              </span>
            </div>
          </section>

          {featured && view === 'Explore' && (
            <section className="feature">
              <div className="feature-copy">
                <div className="eyebrow light">
                  <Sparkles size={13} /> A GOOD PLACE TO START
                </div>
                <button
                  type="button"
                  className="feature-title-btn"
                  onClick={() => openEventDetails(featured)}
                >
                  <h2>{featured.title}</h2>
                </button>
                <div className="feature-meta">
                  <span>
                    <CalendarDays size={15} /> Event details
                  </span>
                  <span>
                    <Users size={15} /> {featured.capacity ?? 'Open'}{' '}
                    {featured.capacity === 1 ? 'spot' : 'spots'}
                  </span>
                </div>
                <button
                  className="button white"
                  onClick={() => register(featured)}
                  disabled={
                    !statusOpen(featured) ||
                    registered.has(featured.id) ||
                    busy === featured.id
                  }
                >
                  {registered.has(featured.id) ? (
                    <>
                      <Check size={16} /> You&apos;re going
                    </>
                  ) : busy === featured.id ? (
                    'Saving…'
                  ) : (
                    'Save your spot'
                  )}
                  {!registered.has(featured.id) && <ArrowUpRight size={16} />}
                </button>
                <small className="feature-id">
                  EVENT · {featured.id.slice(0, 8).toUpperCase()}
                </small>
              </div>
              <div className="feature-art">
                <div className="feature-circle c1" />
                <div className="feature-circle c2" />
                <div className="feature-squiggle">✳</div>
                <div className="feature-sticker">
                  SHOW
                  <br />
                  UP
                  <br />
                  <span>✦</span>
                </div>
              </div>
            </section>
          )}

          {view === 'Recaps' && (
            <section className="page-message">
              <div className="empty-icon">
                <Clock3 size={23} />
              </div>
              <div>
                <div className="eyebrow">LOOKING BACK</div>
                <h2>Event recaps are coming later.</h2>
                <p>
                  The events API doesn’t provide recap posts yet. In the meantime, see what’s
                  coming up on campus.
                </p>
              </div>
              <button className="button primary" onClick={() => navigate('Explore')}>
                Browse events <ArrowRight size={15} />
              </button>
            </section>
          )}

          {view === 'Alerts' && (
            <div className="notice">
              <Bell size={18} />
              <span>
                These events are currently open for registration. Notification preferences and
                push alerts aren’t available from the API.
              </span>
            </div>
          )}

          {view !== 'Recaps' && (
            <section id="events" className="events-section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">
                    {view === 'Alerts' ? 'CAMPUS ALERTS' : 'YOUR CAMPUS, IN MOTION'}
                  </div>
                  <h2>
                    {view === 'My events'
                      ? 'Your events'
                      : view === 'Workshops'
                        ? 'Hands-on & workshops'
                        : view === 'Alerts'
                          ? 'Open for registration'
                          : 'Find your people'}
                  </h2>
                  <p>
                    {view === 'My events'
                      ? 'Everything you’ve saved, all in one place.'
                      : view === 'Alerts'
                        ? 'Events accepting registrations right now.'
                        : 'A little something for every kind of curious.'}
                  </p>
                </div>
                <button className="text-button" onClick={resetToAllEvents}>
                  See all events <ArrowRight size={15} />
                </button>
              </div>

              <div className="toolbar">
                <div className="searchbox">
                  <Search size={17} />
                  <input
                    placeholder="Search events..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="filters">
                  {['All events', 'Open now', 'My events'].map((c) => (
                    <button
                      key={c}
                      className={`filter ${category === c ? 'active' : ''}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="notice error">
                  <CircleAlert size={18} />
                  <span>
                    {error}
                    {error.includes('configured')
                      ? ' — add the Supabase environment variables to the backend.'
                      : ''}
                  </span>
                  <button onClick={refreshAll}>Retry</button>
                </div>
              )}

              {loading ? (
                <div className="loading">
                  <span className="spinner" />
                  Loading campus events…
                </div>
              ) : cards.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    <CalendarDays size={23} />
                  </div>
                  <h3>
                    {view === 'My events' && !userId
                      ? 'Set your Student ID first'
                      : events.length
                        ? 'Nothing here just yet'
                        : 'Your campus story starts here'}
                  </h3>
                  <p>
                    {view === 'My events' && !userId
                      ? 'Add your student UUID to see events you have registered for.'
                      : events.length
                        ? 'Try a different search or filter.'
                        : 'When events are available, you’ll find them right here.'}
                  </p>
                  {view === 'My events' && !userId ? (
                    <button className="button primary" onClick={openId}>
                      Set student ID
                    </button>
                  ) : (
                    (view !== 'Explore' || query || category !== 'All events') && (
                      <button className="button soft" onClick={resetToAllEvents}>
                        Browse all events
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="event-grid">
                  {cards.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      registered={registered.has(e.id)}
                      onRegister={() => register(e)}
                      onInspect={() => openEventDetails(e)}
                      busy={busy === e.id}
                    />
                  ))}
                </div>
              )}

              {!loading && more && (
                <div className="load-more">
                  <button
                    className="button soft"
                    onClick={() => fetchEvents(false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading more…' : 'Load more events'}{' '}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}

          <footer>
            <span>
              <GraduationCap size={17} /> Campus Connect
            </span>
            <span>Find your people. Find your thing.</span>
            <span>
              Powered by your campus community <span className="footer-spark">✳</span>
            </span>
          </footer>
        </div>
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={16} />
          {toast}
        </div>
      )}

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="id-modal-title">
            <button
              className="icon-btn modal-close"
              onClick={() => setModal(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className="modal-symbol">
              <GraduationCap size={23} />
            </div>
            <div className="eyebrow">A QUICK HELLO</div>
            <h2 id="id-modal-title">Make it yours.</h2>
            <p>
              Enter your student UUID to save events to your schedule. You can find it in your
              campus account.
            </p>
            <form onSubmit={saveUser}>
              <label htmlFor="uuid">Student UUID</label>
              <input
                id="uuid"
                autoFocus
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={modal.value ?? userId}
                onChange={(e) => setModal({ ...modal, value: e.target.value })}
              />
              <div className="modal-actions">
                {userId && (
                  <button type="button" className="button soft" onClick={clearUser}>
                    Clear ID
                  </button>
                )}
                <button
                  type="button"
                  className="button soft"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Save ID <ArrowRight size={15} />
                </button>
              </div>
              <small>
                Registration is supported by the campus API. Sign-in is not enabled on this
                service.
              </small>
            </form>
          </div>
        </div>
      )}

      {eventDetail && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setEventDetail(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <button
              className="icon-btn modal-close"
              onClick={() => setEventDetail(null)}
              aria-label="Close event details"
            >
              <X size={18} />
            </button>
            <div className="modal-symbol">
              <CalendarDays size={23} />
            </div>
            <div className="eyebrow">EVENT DETAILS</div>
            <h2 id="event-modal-title">{eventDetail.title}</h2>
            <div className="modal-detail-meta">
              <div>
                <span>Status</span>
                <b>{eventDetail.status || 'Unknown'}</b>
              </div>
              <div>
                <span>Capacity</span>
                <b>{eventDetail.capacity == null ? 'Unlimited' : `${eventDetail.capacity} spots`}</b>
              </div>
              <div>
                <span>Event ID</span>
                <b>{eventDetail.id}</b>
              </div>
              {eventDetail.organizer_id && (
                <div>
                  <span>Organizer ID</span>
                  <b>{eventDetail.organizer_id}</b>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {userId &&
                eventDetail.organizer_id &&
                userId.toLowerCase() === eventDetail.organizer_id.toLowerCase() && (
                  <button
                    type="button"
                    className="button soft"
                    onClick={() => loadAttendees(eventDetail)}
                    disabled={attendeesLoading}
                  >
                    <Users size={15} />
                    {attendeesLoading ? 'Loading attendees…' : 'View attendees'}
                  </button>
                )}
              <button
                type="button"
                className="button soft"
                onClick={() => setEventDetail(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => register(eventDetail)}
                disabled={
                  detailLoading ||
                  !statusOpen(eventDetail) ||
                  registered.has(eventDetail.id) ||
                  busy === eventDetail.id
                }
              >
                {registered.has(eventDetail.id) ? (
                  <>
                    <Check size={15} /> You&apos;re going
                  </>
                ) : busy === eventDetail.id ? (
                  'Saving…'
                ) : (
                  <>
                    Register <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </div>

            {attendees !== null && (
              <div className="attendee-list">
                <h4>Registered attendees ({attendees.length})</h4>
                {attendees.length === 0 ? (
                  <p>No attendees registered yet.</p>
                ) : (
                  <ul>
                    {attendees.map((row) => (
                      <li key={row.id}>
                        <b>{row.users?.email || row.user_id}</b>
                        <span>{row.users?.role || 'student'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event: e, registered, onRegister, onInspect, busy }) {
  const open = statusOpen(e);
  return (
    <article
      className="event-card"
      onClick={onInspect}
      tabIndex={0}
      onKeyDown={(ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          onInspect();
        }
      }}
    >
      <div
        className={`card-art ${
          ['lavender', 'mint-bg', 'peach-bg', 'blue-bg'][parseInt(e.id.slice(0, 2), 16) % 4]
        }`}
      >
        <div className="art-ring ring-a" />
        <div className="art-ring ring-b" />
        <div className="date-tile">
          <span>EVENT</span>
          <CalendarDays size={17} />
        </div>
        <span className="card-mark">
          {['✳', '✦', '◒', '✷'][parseInt(e.id.slice(2, 4), 16) % 4]}
        </span>
        <span className={`status-pill ${open ? 'is-open' : 'is-closed'}`}>
          <i />
          {e.status || 'Event'}
        </span>
      </div>
      <div className="card-body">
        <div className="card-kicker">
          CAMPUS EVENT <span>·</span>{' '}
          {e.capacity == null ? 'NO CAP' : `${e.capacity} CAPACITY`}
        </div>
        <h3>{e.title}</h3>
        <div className="card-meta">
          <span>
            <MapPin size={14} /> Campus event
          </span>
          <span>
            <Users size={14} /> {e.capacity ?? '∞'} spots
          </span>
        </div>
        <div className="card-bottom">
          <span className="organizer">
            <span className="mini-avatar">CC</span> Campus community
          </span>
          <button
            type="button"
            title={registered ? 'Already on your schedule' : 'Register for this event'}
            aria-label={`Register for ${e.title}`}
            disabled={!open || registered || busy}
            onClick={(ev) => {
              ev.stopPropagation();
              onRegister();
            }}
            className={`join-btn ${registered ? 'joined' : ''}`}
          >
            {registered ? <Check size={16} /> : busy ? '…' : <ArrowUpRight size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
