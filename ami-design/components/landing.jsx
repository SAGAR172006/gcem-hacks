/* global React */
const { useState: useStateLanding, useEffect: useEffectLanding } = React;

// ============================================
// Animated peach waves — organic SVG blobs
// ============================================
function PeachWaves({ intensity = 1, dark = false }) {
  // We use SVG with smooth bezier blobs. Drift is via CSS keyframes on each blob.
  // intensity 0..2 scales opacity.
  const op = (base) => Math.min(0.95, base * intensity);

  return (
    <div className="peach-waves" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="peachA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFCBA4"/>
            <stop offset="1" stopColor="#FFB085"/>
          </linearGradient>
          <linearGradient id="peachB" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE0CC"/>
            <stop offset="1" stopColor="#FFCBA4"/>
          </linearGradient>
          <radialGradient id="peachC" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFB085"/>
            <stop offset="1" stopColor="#FFB085" stopOpacity="0"/>
          </radialGradient>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g"/>
            <feBlend in="SourceGraphic" in2="g"/>
          </filter>
        </defs>

        <g style={{ transformOrigin: '30% 30%', animation: 'wave-drift-1 28s ease-in-out infinite' }}>
          <path
            d="M -100 80 Q 200 -40 500 60 T 1100 100 Q 1300 180 1500 80 L 1700 -100 L -200 -100 Z"
            fill="url(#peachA)" opacity={op(0.95)}
          />
          <path
            d="M -100 380 Q 200 240 500 320 Q 800 420 1100 320 Q 1400 220 1700 360 L 1700 100 Q 1400 0 1100 80 Q 800 180 500 80 Q 200 -20 -100 120 Z"
            fill="url(#peachB)" opacity={op(0.85)}
          />
        </g>

        <g style={{ transformOrigin: '70% 60%', animation: 'wave-drift-2 36s ease-in-out infinite' }}>
          <path
            d="M 1700 600 Q 1400 720 1100 640 Q 800 560 600 660 Q 400 740 100 660 Q -100 600 -100 720 L -100 940 L 1700 940 Z"
            fill="url(#peachA)" opacity={op(0.92)}
          />
        </g>

        <g style={{ transformOrigin: '50% 50%', animation: 'wave-drift-3 22s ease-in-out infinite' }}>
          <ellipse cx="350" cy="500" rx="300" ry="160" fill="url(#peachC)" opacity={op(0.55)}/>
          <ellipse cx="1250" cy="280" rx="240" ry="140" fill="url(#peachC)" opacity={op(0.4)}/>
        </g>
      </svg>
      <style>{`
        .peach-waves { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      `}</style>
    </div>
  );
}

// ============================================
// Visualizer card — concept morphing into formats
// ============================================
function VisualizerCard() {
  const [phase, setPhase] = useStateLanding(0);
  useEffectLanding(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 4), 2400);
    return () => clearInterval(t);
  }, []);

  const formats = [
    { label: 'Source PDF', icon: <Ico.Pdf/>, color: 'var(--ink-700)' },
    { label: 'Immersive Text', icon: <Ico.Book/>, color: 'var(--peach-500)' },
    { label: 'Slides', icon: <Ico.Slides/>, color: 'var(--lav-500)' },
    { label: 'Audio', icon: <Ico.Audio/>, color: 'var(--success)' },
  ];

  return (
    <div className="vis-card">
      <div className="vis-source">
        <div className="vis-particle"/>
        <div className="vis-source-text">
          <div className="vis-source-line" style={{ width: '90%' }}/>
          <div className="vis-source-line" style={{ width: '70%' }}/>
          <div className="vis-source-line" style={{ width: '85%' }}/>
          <div className="vis-source-line" style={{ width: '60%' }}/>
        </div>
      </div>

      <div className="vis-arrow">
        <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
          <path d="M 5 40 Q 20 10 35 40 Q 20 70 5 40" stroke="var(--lav-300)" strokeWidth="1.5" strokeDasharray="3 3" fill="none"/>
          <circle cx="20" cy="40" r="4" fill="var(--lav-500)" style={{ animation: 'pulse-glow 1.6s ease-in-out infinite' }}/>
        </svg>
      </div>

      <div className="vis-formats">
        {formats.map((f, i) => (
          <div key={f.label} className={`vis-format ${phase === i ? 'active' : ''}`}>
            <span className="vis-format-icon" style={{ color: f.color }}>{f.icon}</span>
            <span>{f.label}</span>
            {phase === i && <span className="vis-format-dot"/>}
          </div>
        ))}
      </div>

      <style>{`
        .vis-card {
          position: relative;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 28px;
          padding: 28px;
          box-shadow: var(--shadow-lg);
          width: min(380px, 92vw);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 18px;
          align-items: center;
        }
        [data-theme="dark"] .vis-card { background: rgba(31, 27, 22, 0.85); border-color: rgba(255,255,255,0.06); }
        .vis-source {
          background: var(--cream-deep);
          border-radius: 14px;
          padding: 16px 14px;
          height: 160px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .vis-source-line {
          height: 6px;
          background: var(--ink-200);
          border-radius: 3px;
          animation: fade-in 0.6s ease both;
        }
        .vis-source-line:nth-child(2) { animation-delay: 0.1s; }
        .vis-source-line:nth-child(3) { animation-delay: 0.2s; }
        .vis-source-line:nth-child(4) { animation-delay: 0.3s; }
        .vis-particle {
          position: absolute;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--lav-500);
          top: 50%; right: -10px;
          box-shadow: 0 0 8px var(--lav-300);
          animation: vis-fly 2.4s ease-in-out infinite;
        }
        @keyframes vis-fly {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translate(80px, 0) scale(1); opacity: 1; }
          100% { transform: translate(120px, 0) scale(0.4); opacity: 0; }
        }
        .vis-formats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .vis-format {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--cream-deep);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-500);
          transition: all 0.5s var(--ease-organic);
          opacity: 0.6;
          position: relative;
        }
        .vis-format.active {
          opacity: 1;
          background: var(--peach-50);
          color: var(--ink-900);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(244, 122, 74, 0.15);
        }
        [data-theme="dark"] .vis-format.active { background: var(--peach-100); }
        .vis-format-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--peach-500);
          margin-left: auto;
          box-shadow: 0 0 0 4px rgba(244,122,74,0.2);
        }
      `}</style>
    </div>
  );
}

// ============================================
// Hero search bar — primary entry point
// ============================================
function HeroSearch({ onSubmit }) {
  const [q, setQ] = useStateLanding('');
  const [focused, setFocused] = useStateLanding(false);
  const [chipIdx, setChipIdx] = useStateLanding(0);

  const suggestions = [
    'Photosynthesis',
    'The French Revolution',
    'How neural networks learn',
    'Plate tectonics',
    'Supply and demand',
  ];

  // Rotating placeholder when empty + unfocused
  useEffectLanding(() => {
    if (focused || q) return;
    const t = setInterval(() => setChipIdx(i => (i + 1) % suggestions.length), 2600);
    return () => clearInterval(t);
  }, [focused, q]);

  const submit = (val) => {
    const topic = (val ?? q).trim();
    if (!topic) return;
    onSubmit(topic);
  };

  return (
    <div className="hero-search-wrap">
      <form
        className={`hero-search ${focused ? 'is-focused' : ''}`}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <span className="hero-search-icon"><Ico.Sparkle/></span>
        <input
          type="text"
          className="hero-search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Try “${suggestions[chipIdx]}”`}
          aria-label="What do you want to learn today?"
        />
        <button type="submit" className="hero-search-submit" aria-label="Start learning">
          <Ico.ArrowRight/>
        </button>
      </form>

      <div className="hero-chips">
        <span className="hero-chips-label">Or try</span>
        {suggestions.slice(0, 3).map(s => (
          <button
            key={s}
            type="button"
            className="hero-chip"
            onClick={() => { setQ(s); submit(s); }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Landing page
// ============================================
function LandingPage({ onStart, onUpload, intensity = 1 }) {
  return (
    <div className="landing">
      <PeachWaves intensity={intensity}/>

      <div className="landing-topbar">
        <Brand/>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14, color: 'var(--ink-700)' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>How it works</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>For educators</a>
          <button className="pill pill-ghost" style={{ padding: '10px 18px', fontSize: 14 }} onClick={onStart}>Sign in</button>
        </div>
      </div>

      <div className="landing-grid">
        <div className="landing-copy stagger">
          <span className="eyebrow">A new kind of textbook</span>
          <h1 className="h1">Re-imagining<br/>textbooks for<br/>every learner.</h1>
          <p className="body" style={{ maxWidth: 480, fontSize: 18 }}>
            AMI transforms any topic — or your own PDF — into immersive text, narrated slides, audio lessons, and interactive mindmaps. Tailored to how <em>you</em> learn.
          </p>
          <HeroSearch onSubmit={(topic) => onStart(topic)}/>
        </div>

        <div className="landing-vis">
          <VisualizerCard/>
        </div>
      </div>

      <div className="landing-footer">
        <span className="muted" style={{ fontSize: 13 }}>Trusted by curious minds at</span>
        <div className="logo-row">
          <span>Stanford</span><span>·</span><span>Khan Academy</span><span>·</span><span>OpenStax</span><span>·</span><span>MIT OCW</span>
        </div>
      </div>

      <style>{`
        .landing {
          min-height: 100vh;
          position: relative;
          background: var(--cream);
          padding: 0;
          overflow: hidden;
        }
        .landing-topbar {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 56px;
        }
        .landing-grid {
          position: relative;
          z-index: 4;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: center;
          gap: 60px;
          padding: 40px 56px 80px;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 220px);
        }
        .landing-copy { display: flex; flex-direction: column; gap: 20px; }
        .hero-search-wrap {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          max-width: 540px;
        }
        .hero-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--paper);
          border: 1.5px solid transparent;
          border-radius: 999px;
          padding: 8px 8px 8px 22px;
          box-shadow: 0 8px 24px rgba(80, 40, 20, 0.08), 0 1px 0 rgba(255,255,255,0.6) inset;
          transition: all 0.25s var(--ease-organic);
        }
        .hero-search.is-focused {
          border-color: var(--peach-300);
          box-shadow: 0 12px 32px rgba(244, 122, 74, 0.18), 0 0 0 4px rgba(244, 122, 74, 0.08);
          transform: translateY(-1px);
        }
        .hero-search-icon {
          color: var(--peach-500);
          display: inline-flex;
          flex-shrink: 0;
        }
        .hero-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font: inherit;
          font-size: 16px;
          font-weight: 500;
          color: var(--ink-900);
          padding: 14px 4px;
          outline: none;
          min-width: 0;
        }
        .hero-search-input::placeholder { color: var(--ink-300); font-weight: 400; }
        .hero-search-submit {
          flex-shrink: 0;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--peach-500);
          color: white;
          border: none;
          cursor: pointer;
          display: grid; place-items: center;
          transition: all 0.2s var(--ease-spring);
          box-shadow: 0 4px 12px rgba(244, 122, 74, 0.3);
        }
        .hero-search-submit:hover { background: var(--peach-600); transform: scale(1.06); }
        .hero-search-submit:active { transform: scale(0.96); }
        .hero-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-left: 4px;
        }
        .hero-chips-label {
          font-size: 13px;
          color: var(--ink-500);
          font-weight: 500;
          margin-right: 2px;
        }
        .hero-chip {
          font: inherit;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-700);
          background: rgba(255,255,255,0.6);
          border: 1px solid var(--ink-100);
          border-radius: 999px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .hero-chip:hover {
          background: var(--paper);
          border-color: var(--peach-300);
          color: var(--peach-600);
          transform: translateY(-1px);
        }
        .landing-footer {
          position: relative; z-index: 4;
          display: flex; gap: 24px; align-items: center;
          padding: 0 56px 32px;
          flex-wrap: wrap;
        }
        .logo-row {
          display: flex; gap: 14px; flex-wrap: wrap;
          font-size: 13px; font-weight: 600; color: var(--ink-500);
          letter-spacing: -0.01em;
        }
        .logo-row span:nth-child(even) { color: var(--ink-200); }
        @media (max-width: 920px) {
          .landing-grid { grid-template-columns: 1fr; padding: 24px; }
          .landing-topbar { padding: 20px 24px; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { LandingPage, PeachWaves, VisualizerCard, HeroSearch });
