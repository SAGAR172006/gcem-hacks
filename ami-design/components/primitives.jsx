/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ============================================
// Icon set — minimal, hand-tuned line icons
// ============================================
const Ico = {
  Search: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  Mail: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  Info: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  Play: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>,
  Pause: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>,
  Upload: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>,
  Sparkle: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z" opacity="0.95"/><circle cx="19" cy="18" r="1.6"/><circle cx="5" cy="19" r="1"/></svg>,
  Globe: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  Beaker: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/></svg>,
  Atom: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>,
  Book: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></svg>,
  Brain: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 5a3 3 0 0 0-3 3v.5A3.5 3.5 0 0 0 4 12a3.5 3.5 0 0 0 2 3.2V16a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3"/><path d="M15 5a3 3 0 0 1 3 3v.5A3.5 3.5 0 0 1 20 12a3.5 3.5 0 0 1-2 3.2V16a3 3 0 0 1-3 3 3 3 0 0 1-3-3"/></svg>,
  Leaf: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h6v6c0 5-4 9-9 9z"/><path d="M4 21l8-8"/></svg>,
  Telescope: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m10.5 6 4 1.5-3 5.2L7.5 11z"/><path d="M14.5 7.5 17 3l3 1.5-2.5 4.5z"/><path d="m7.5 11-3 5.2 4 2.3 3-5.2"/><path d="M11 21h6M14 21v-4"/></svg>,
  Heart: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>,
  Users: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Pdf: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>,
  Audio: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="2" y="9" width="2" height="6" rx="1"/><rect x="6" y="6" width="2" height="12" rx="1"/><rect x="10" y="3" width="2" height="18" rx="1"/><rect x="14" y="6" width="2" height="12" rx="1"/><rect x="18" y="9" width="2" height="6" rx="1"/></svg>,
  Mind: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 12 8-6M8 12h8M8 12l8 6"/></svg>,
  Slides: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  ArrowRight: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  ArrowLeft: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  Plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Minus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>,
  Hint: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  Music: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M9 17V5l10-2v12"/><circle cx="6" cy="17" r="3" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="15" r="3" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
  Bike: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l3 4v7M5.5 17.5 12 6h3M9 17.5 13.5 9"/></svg>,
  Soccer: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/></svg>,
  Camera: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Close: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Sun: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Moon: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Lock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Clock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Target: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Calendar: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Trash: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  Image: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  UserCircle: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.7 19.5a6 6 0 0 1 10.6 0"/></svg>,
  Pencil: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  Settings: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  LogOut: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  LogIn: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
};

// ============================================
// Brand mark
// ============================================
function BrandMark({ size = 32 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M4 18 C 6 8, 12 4, 12 4 C 12 4, 18 8, 20 18" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    </span>
  );
}

function Brand({ tag = 'EXPERIMENT' }) {
  return (
    <div className="brand">
      <BrandMark/>
      <span>AMI</span>
      {tag && <span className="brand-tag">{tag}</span>}
    </div>
  );
}

// ============================================
// User avatar menu — replaces mail/info icons
// ============================================
function UserMenu({ persona, onChangePersona, signedIn = true, onSignOut, onSignIn }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const initials = signedIn ? 'AL' : '?';
  const name = signedIn ? 'Alex Liu' : 'Guest';
  const email = signedIn ? '[email protected]' : 'Not signed in';

  return (
    <div className="user-menu" ref={ref}>
      <button
        className={`avatar-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="avatar-circle">{initials}</span>
        {signedIn && <span className="avatar-status" aria-hidden="true"/>}
      </button>

      {open && (
        <div className="user-menu-pop" role="menu">
          <div className="user-menu-head">
            <span className="user-menu-avatar">{initials}</span>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <strong className="user-menu-name">{name}</strong>
              <span className="user-menu-email">{email}</span>
            </div>
          </div>

          {signedIn && (
            <div className="user-menu-meta">
              <span className="user-menu-meta-label">Learning as</span>
              <span className="user-menu-meta-value">
                <span style={{ color: 'var(--peach-500)', display: 'inline-flex' }}>{persona.iconNode}</span>
                {persona.grade} · {persona.interest}
              </span>
            </div>
          )}

          <div className="user-menu-sep"/>

          <button className="user-menu-item" onClick={() => { setOpen(false); onChangePersona(); }}>
            <Ico.Pencil/> <span>Edit my data</span>
          </button>
          <button className="user-menu-item" onClick={() => setOpen(false)}>
            <Ico.Settings/> <span>Account settings</span>
          </button>

          <div className="user-menu-sep"/>

          {signedIn ? (
            <button className="user-menu-item user-menu-item--danger" onClick={() => { setOpen(false); onSignOut && onSignOut(); }}>
              <Ico.LogOut/> <span>Log out</span>
            </button>
          ) : (
            <button className="user-menu-item" onClick={() => { setOpen(false); onSignIn && onSignIn(); }}>
              <Ico.LogIn/> <span>Log in</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        .user-menu { position: relative; }
        .avatar-btn {
          position: relative;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1.5px solid var(--ink-100);
          background: var(--paper);
          padding: 0;
          cursor: pointer;
          display: grid; place-items: center;
          transition: all 0.2s var(--ease-organic);
        }
        .avatar-btn:hover { border-color: var(--peach-300); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
        .avatar-btn.is-open { border-color: var(--peach-500); box-shadow: 0 0 0 4px rgba(244,122,74,0.12); }
        .avatar-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--peach-300), var(--peach-500));
          color: white;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.02em;
          display: grid; place-items: center;
        }
        .avatar-status {
          position: absolute;
          bottom: 1px; right: 1px;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: var(--success, #4ade80);
          border: 2px solid var(--paper);
        }
        .user-menu-pop {
          position: absolute;
          top: calc(100% + 10px); right: 0;
          width: 260px;
          background: var(--paper);
          border: 1px solid var(--ink-100);
          border-radius: 14px;
          box-shadow: var(--shadow-lg);
          padding: 10px;
          z-index: 50;
          animation: user-menu-in 0.18s var(--ease-spring) both;
          transform-origin: top right;
        }
        @keyframes user-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .user-menu-head {
          display: flex; align-items: center; gap: 12px;
          padding: 8px 8px 12px;
        }
        .user-menu-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--peach-300), var(--peach-500));
          color: white;
          font-size: 14px; font-weight: 700;
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .user-menu-name { font-size: 14px; color: var(--ink-900); }
        .user-menu-email {
          font-size: 12px; color: var(--ink-500);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .user-menu-meta {
          display: flex; flex-direction: column; gap: 4px;
          padding: 10px 12px;
          background: var(--cream-deep);
          border-radius: 10px;
          margin: 0 2px 4px;
        }
        .user-menu-meta-label {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--ink-500);
        }
        .user-menu-meta-value {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--ink-900);
        }
        .user-menu-sep {
          height: 1px; background: var(--ink-100);
          margin: 6px 4px;
        }
        .user-menu-item {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font: inherit;
          font-size: 13px; font-weight: 500;
          color: var(--ink-900);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .user-menu-item:hover { background: var(--cream-deep); }
        .user-menu-item svg { color: var(--ink-500); flex-shrink: 0; }
        .user-menu-item--danger { color: var(--peach-600, #c2410c); }
        .user-menu-item--danger svg { color: currentColor; }
      `}</style>
    </div>
  );
}

// ============================================
// Topbar
// ============================================
function TopBar({ persona, onChangePersona, dark, onToggleDark, signedIn = true, onSignOut, onSignIn }) {
  return (
    <div className="topbar">
      <Brand/>
      <div className="topbar-center" onClick={onChangePersona} style={{ cursor: 'pointer' }} title="Change personalization">
        <span style={{ color: 'var(--ink-500)' }}>For:</span>
        <strong>{persona.grade}</strong>
        <span style={{ color: 'var(--ink-300)' }}>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--peach-500)' }}>{persona.iconNode}</span>
          {persona.interest}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="icon-btn" onClick={onToggleDark} title="Toggle theme">
          {dark ? <Ico.Sun/> : <Ico.Moon/>}
        </button>
        <UserMenu
          persona={persona}
          onChangePersona={onChangePersona}
          signedIn={signedIn}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      </div>
    </div>
  );
}

// Export
Object.assign(window, { Ico, BrandMark, Brand, TopBar, UserMenu });
