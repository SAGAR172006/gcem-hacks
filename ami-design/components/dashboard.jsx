/* global React */
const { useState: useStateDash, useRef: useRefDash, useEffect: useEffectDash } = React;

// ============================================
// Mock learning history data
// ============================================
const SUBJECTS = {
  Economics:    { color: '#5B8FB9', icon: 'Globe' },
  History:      { color: '#C97064', icon: 'Book' },
  Sociology:    { color: '#9B7CB6', icon: 'Users' },
  Biology:      { color: '#7AAB7E', icon: 'Leaf' },
  ELA:          { color: '#C99A4F', icon: 'Book' },
  Chemistry:    { color: '#A45A52', icon: 'Beaker' },
  Astronomy:    { color: '#4A6A9C', icon: 'Telescope' },
  Health:       { color: '#D17B7B', icon: 'Heart' },
  Philosophy:   { color: '#7A6BA8', icon: 'Brain' },
  Psychology:   { color: '#B07AA8', icon: 'Brain' },
  Physics:      { color: '#D88A57', icon: 'Atom' },
  'Computer Science': { color: '#6B7B95', icon: 'Atom' },
};

const HISTORY_ITEMS = [
  { id: 'h1', subject: 'Biology', title: 'Photosynthesis & the Carbon Cycle', progress: 0.65, scene: 'leaf' },
  { id: 'h2', subject: 'Economics', title: 'An Overview of Economic Systems', progress: 0.42, scene: 'globe' },
  { id: 'h3', subject: 'History', title: 'Early Human Evolution and Migration', progress: 1.0, scene: 'fire' },
  { id: 'h4', subject: 'Sociology', title: 'What is Sociology?', progress: 0.18, scene: 'city' },
  { id: 'h5', subject: 'Astronomy', title: 'Earth, Sky and the Cosmos', progress: 0.08, scene: 'space' },
  { id: 'h6', subject: 'Chemistry', title: 'Atoms and Molecules', progress: 0.52, scene: 'molecule' },
  { id: 'h7', subject: 'Philosophy', title: 'What is Knowledge? Epistemology 101', progress: 0.0, scene: 'mind' },
  { id: 'h8', subject: 'Physics', title: 'Newton\u2019s Laws of Motion', progress: 0.74, scene: 'orbit' },
];

const FILTERS = ['All', ...Object.keys(SUBJECTS)];

// ============================================
// Subject-specific illustrated thumbnail (CSS/SVG, no external assets)
// ============================================
function SceneArt({ scene, color }) {
  if (scene === 'leaf') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#E8F4E8"/>
      <circle cx="170" cy="30" r="14" fill="#FFD466"/>
      <path d="M170 30 L 170 8 M170 30 L 170 52 M170 30 L 192 30 M170 30 L 148 30 M170 30 L 184 14 M170 30 L 156 46 M170 30 L 184 46 M170 30 L 156 14" stroke="#FFD466" strokeWidth="1.5"/>
      <path d="M 60 110 Q 50 70 80 50 Q 110 30 120 60 Q 110 90 80 100 Q 70 105 60 110 Z" fill="#5BA85F"/>
      <path d="M 80 100 L 95 70" stroke="#3E7E42" strokeWidth="1.5" fill="none"/>
      <path d="M 130 110 Q 125 80 145 65 Q 165 55 170 80 Q 160 100 140 105 Z" fill="#7BC07F"/>
      <circle cx="50" cy="40" r="2" fill="#5BA85F"/>
      <circle cx="40" cy="55" r="1.5" fill="#5BA85F"/>
    </svg>
  );
  if (scene === 'globe') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#CFE4F2"/>
      <circle cx="100" cy="80" r="40" fill="#7AAB7E"/>
      <circle cx="100" cy="80" r="40" fill="#5B8FB9" mask="url(#globeMask)"/>
      <ellipse cx="100" cy="80" rx="40" ry="14" fill="none" stroke="#3E6A8C" strokeWidth="1" opacity="0.4"/>
      <ellipse cx="100" cy="80" rx="14" ry="40" fill="none" stroke="#3E6A8C" strokeWidth="1" opacity="0.4"/>
      <path d="M 80 60 Q 90 70 105 65 Q 110 75 100 80 Q 90 78 88 90 Q 95 95 110 92" stroke="#3E7E42" strokeWidth="2" fill="none" opacity="0.6"/>
      <path d="M 30 40 Q 50 30 70 35" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8"/>
      <path d="M 65 32 L 75 38 L 65 44 Z" fill="#fff" opacity="0.9"/>
    </svg>
  );
  if (scene === 'fire') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#F4D9B3"/>
      <ellipse cx="100" cy="100" rx="120" ry="20" fill="#E8B97A"/>
      <path d="M 90 90 Q 95 70 100 60 Q 105 70 110 90 Q 105 95 100 92 Q 95 95 90 90 Z" fill="#FF8856"/>
      <path d="M 95 88 Q 98 78 100 72 Q 102 78 105 88 Q 100 92 95 88 Z" fill="#FFD466"/>
      <path d="M 80 95 L 120 95 L 116 100 L 84 100 Z" fill="#7A4A2E"/>
      <path d="M 78 100 L 122 100" stroke="#5A3A24" strokeWidth="1.5"/>
      <circle cx="40" cy="80" r="14" fill="#A87A5A"/>
      <circle cx="40" cy="74" r="7" fill="#7A4A2E"/>
      <circle cx="160" cy="78" r="12" fill="#A87A5A"/>
      <circle cx="160" cy="73" r="6" fill="#7A4A2E"/>
    </svg>
  );
  if (scene === 'city') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#CFE4F2"/>
      <rect y="80" width="200" height="40" fill="#A8D4A4"/>
      <rect x="20" y="40" width="22" height="50" fill="#9CB4D0"/>
      <rect x="48" y="20" width="28" height="70" fill="#7A95B5"/>
      <rect x="82" y="50" width="20" height="40" fill="#B5C8DC"/>
      <rect x="108" y="30" width="32" height="60" fill="#8FA8C2"/>
      <rect x="146" y="55" width="22" height="35" fill="#A8BDD1"/>
      <rect x="174" y="42" width="18" height="48" fill="#7A95B5"/>
      {/* windows */}
      {[0,1,2,3].map(i => <rect key={`w1-${i}`} x="52" y={28 + i*12} width="4" height="6" fill="#FFD466"/>)}
      {[0,1,2,3].map(i => <rect key={`w2-${i}`} x="64" y={28 + i*12} width="4" height="6" fill="#FFD466"/>)}
      {/* people dots */}
      <circle cx="60" cy="100" r="4" fill="#9B7CB6"/><circle cx="60" cy="93" r="2.5" fill="#9B7CB6"/>
      <circle cx="100" cy="105" r="4" fill="#C97064"/><circle cx="100" cy="98" r="2.5" fill="#C97064"/>
      <circle cx="140" cy="100" r="4" fill="#5B8FB9"/><circle cx="140" cy="93" r="2.5" fill="#5B8FB9"/>
    </svg>
  );
  if (scene === 'space') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#1A1F3E"/>
      {[[20,20],[60,15],[140,25],[180,30],[40,80],[170,90],[100,40],[150,60]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%2?1:1.5} fill="#fff" opacity="0.9"/>
      ))}
      <circle cx="60" cy="80" r="22" fill="#5B8FB9"/>
      <ellipse cx="60" cy="80" rx="22" ry="6" fill="none" stroke="#FFCBA4" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="140" cy="50" r="14" fill="#C97064"/>
      <circle cx="135" cy="46" r="3" fill="#A05248" opacity="0.6"/>
      <circle cx="148" cy="52" r="2" fill="#A05248" opacity="0.6"/>
      <path d="M 30 100 Q 50 90 70 95" stroke="#fff" strokeWidth="0.5" opacity="0.4" fill="none"/>
    </svg>
  );
  if (scene === 'molecule') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#F0E4D2"/>
      <line x1="60" y1="60" x2="100" y2="40" stroke="#5A4A30" strokeWidth="3"/>
      <line x1="100" y1="40" x2="140" y2="60" stroke="#5A4A30" strokeWidth="3"/>
      <line x1="100" y1="40" x2="100" y2="80" stroke="#5A4A30" strokeWidth="3"/>
      <line x1="60" y1="60" x2="60" y2="90" stroke="#5A4A30" strokeWidth="3"/>
      <line x1="140" y1="60" x2="140" y2="90" stroke="#5A4A30" strokeWidth="3"/>
      <circle cx="100" cy="40" r="12" fill="#5B8FB9"/>
      <circle cx="60" cy="60" r="10" fill="#C97064"/>
      <circle cx="140" cy="60" r="10" fill="#7AAB7E"/>
      <circle cx="100" cy="80" r="9" fill="#FFD466"/>
      <circle cx="60" cy="90" r="7" fill="#9B7CB6"/>
      <circle cx="140" cy="90" r="7" fill="#9B7CB6"/>
    </svg>
  );
  if (scene === 'mind') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#EDE5D6"/>
      <path d="M 60 60 Q 70 30 100 35 Q 130 30 140 60 Q 145 90 110 95 Q 75 90 60 60 Z" fill="#7A6BA8" opacity="0.85"/>
      <path d="M 75 55 Q 85 50 95 55 M 110 55 Q 120 50 130 55 M 85 75 Q 100 80 115 75" stroke="#3D335E" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <circle cx="50" cy="50" r="3" fill="#FFCBA4"/>
      <circle cx="155" cy="45" r="3" fill="#FFCBA4"/>
      <circle cx="160" cy="80" r="3" fill="#E6E6FA"/>
    </svg>
  );
  if (scene === 'orbit') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#FCEBD9"/>
      <ellipse cx="100" cy="60" rx="70" ry="20" fill="none" stroke="#D88A57" strokeWidth="1.5" opacity="0.6"/>
      <ellipse cx="100" cy="60" rx="80" ry="34" fill="none" stroke="#D88A57" strokeWidth="1" opacity="0.4"/>
      <circle cx="100" cy="60" r="14" fill="#FFD466"/>
      <circle cx="100" cy="60" r="14" fill="none" stroke="#FF8856" strokeWidth="2"/>
      <circle cx="170" cy="60" r="6" fill="#5B8FB9"/>
      <circle cx="40" cy="74" r="4" fill="#C97064"/>
      <line x1="100" y1="60" x2="170" y2="60" stroke="#D88A57" strokeWidth="0.6" strokeDasharray="2 2"/>
    </svg>
  );
  return <div style={{ width: '100%', height: '100%', background: color, opacity: 0.3 }}/>;
}

// ============================================
// History card
// ============================================
function HistoryCard({ item, onClick, featured = false }) {
  const sub = SUBJECTS[item.subject];
  const Icon = Ico[sub.icon] || Ico.Book;
  const pct = Math.round(item.progress * 100);
  return (
    <div className={`hcard ${featured ? 'featured' : ''}`} onClick={onClick}>
      <div className="hcard-head">
        <span className="hcard-subject" style={{ color: sub.color }}>
          <Icon/>
          {item.subject}
        </span>
      </div>
      <div className="hcard-title">{item.title}</div>
      <div className="hcard-art">
        <SceneArt scene={item.scene} color={sub.color}/>
      </div>
      <div className="hcard-progress">
        <div className="hcard-progress-bar" style={{ width: `${pct}%` }}/>
        <span className="hcard-progress-label">{pct === 100 ? 'Completed' : pct === 0 ? 'New' : `${pct}% complete`}</span>
      </div>
      <style>{`
        .hcard {
          background: var(--paper);
          border-radius: var(--r-lg);
          padding: 16px 16px 18px;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(45, 30, 15, 0.05);
          cursor: pointer;
          transition: transform 0.4s var(--ease-organic), box-shadow 0.4s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hcard:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--peach-200);
        }
        .hcard-head { display: flex; justify-content: space-between; align-items: center; }
        .hcard-subject {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .hcard-subject svg { width: 14px; height: 14px; }
        .hcard-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--ink-900);
          line-height: 1.2;
          letter-spacing: -0.015em;
          min-height: 41px;
          text-wrap: balance;
        }
        .hcard-art {
          width: 100%;
          aspect-ratio: 1.7;
          border-radius: 14px;
          overflow: hidden;
          background: var(--cream-deep);
        }
        .hcard-progress {
          height: 4px;
          background: var(--ink-100);
          border-radius: 999px;
          position: relative;
          margin-top: 4px;
        }
        .hcard-progress-bar {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(90deg, var(--peach-300), var(--peach-400));
          border-radius: 999px;
          transition: width 0.6s var(--ease-organic);
        }
        .hcard-progress-label {
          position: absolute;
          top: 8px; left: 0;
          font-size: 11px;
          font-weight: 500;
          color: var(--ink-500);
          letter-spacing: -0.01em;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Filter chip row
// ============================================
function FilterChips({ active, onChange }) {
  return (
    <div className="chip-row">
      {FILTERS.map(f => (
        <button key={f} className={`chip ${active === f ? 'active' : ''}`} onClick={() => onChange(f)}>
          {f}
        </button>
      ))}
      <style>{`
        .chip-row {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center;
          padding: 0 24px;
        }
        .chip {
          padding: 8px 16px;
          border-radius: var(--r-pill);
          background: var(--paper);
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-700);
          border: 1px solid transparent;
          transition: all 0.25s var(--ease-organic);
        }
        .chip:hover { background: var(--cream-deep); }
        .chip.active {
          background: var(--ink-900);
          color: var(--cream);
        }
      `}</style>
    </div>
  );
}

// ============================================
// Personalization picker (overlay tile inside grid)
// ============================================
function PersonalizationTile({ persona, onChange }) {
  const grades = ['Middle schooler', 'High schooler', 'College freshman', 'Lifelong learner'];
  const interests = [
    { label: 'cycling', icon: <Ico.Bike/> },
    { label: 'music', icon: <Ico.Music/> },
    { label: 'soccer', icon: <Ico.Soccer/> },
    { label: 'photography', icon: <Ico.Camera/> },
  ];
  return (
    <div className="ptile">
      <div className="ptile-q">What personalization do you want to explore?</div>
      <div className="ptile-options">
        {grades.slice(0,2).map(g => (
          <button
            key={g}
            className={`ptile-pill ${persona.grade === g ? 'active' : ''}`}
            onClick={() => onChange({ ...persona, grade: g })}
          >
            {g} who likes <span className="ptile-icon">{interests[grades.indexOf(g) % interests.length].icon}</span>
          </button>
        ))}
      </div>
      <style>{`
        .ptile {
          background: var(--ink-900);
          color: var(--cream);
          border-radius: var(--r-lg);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
          min-height: 280px;
          box-shadow: var(--shadow-md);
        }
        .ptile-q {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          letter-spacing: -0.015em;
          text-wrap: balance;
        }
        .ptile-options { display: flex; flex-direction: column; gap: 10px; }
        .ptile-pill {
          background: rgba(255,255,255,0.95);
          color: var(--ink-900);
          padding: 12px 16px;
          border-radius: var(--r-pill);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          transition: all 0.3s var(--ease-organic);
          flex-wrap: wrap;
        }
        .ptile-pill.active { background: var(--peach-200); }
        .ptile-pill:hover { transform: translateY(-1px); }
        .ptile-icon { display: inline-flex; color: var(--peach-500); }
      `}</style>
    </div>
  );
}

// ============================================
// Dashboard page
// ============================================
function DashboardPage({ persona, onPersonaChange, onSearch, onUpload, onResume, onLand, dark, onToggleDark }) {
  const [filter, setFilter] = useStateDash('All');
  const [query, setQuery] = useStateDash('');
  const inputRef = useRefDash(null);

  const filtered = filter === 'All' ? HISTORY_ITEMS : HISTORY_ITEMS.filter(i => i.subject === filter);

  const submit = (e) => {
    e?.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="dashboard fade-in">
      <TopBar persona={persona} onChangePersona={onPersonaChange} dark={dark} onToggleDark={onToggleDark}/>

      <div className="dash-hero">
        <span className="eyebrow">Welcome back, Maya</span>
        <h1 className="dash-h1">What do you want to learn today?</h1>
        <form className="search-bar" onSubmit={submit}>
          <span className="search-icon"><Ico.Search/></span>
          <input
            ref={inputRef}
            placeholder="Try “Photosynthesis” or paste a Wikipedia link…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="search-actions">
            <button type="button" className="search-upload" onClick={onUpload} title="Upload PDF">
              <Ico.Upload/>
            </button>
            <button type="submit" className="pill pill-primary search-submit">
              <Ico.Sparkle/> Generate
            </button>
          </div>
        </form>
        <div className="search-hints">
          <button className="hint-chip" onClick={() => { setQuery('Photosynthesis'); setTimeout(submit, 50); }}>Photosynthesis</button>
          <button className="hint-chip" onClick={() => setQuery('Black holes')}>Black holes</button>
          <button className="hint-chip" onClick={() => setQuery('The French Revolution')}>The French Revolution</button>
          <button className="hint-chip" onClick={() => setQuery('How transformers work')}>How transformers work</button>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2 className="h3">Continue learning</h2>
          <span className="muted" style={{ fontSize: 13 }}>{HISTORY_ITEMS.length} modules</span>
        </div>
        <FilterChips active={filter} onChange={setFilter}/>
        <div className="hgrid stagger">
          {filtered.slice(0, 3).map(item => (
            <HistoryCard key={item.id} item={item} onClick={() => onResume(item)}/>
          ))}
          <PersonalizationTile persona={persona} onChange={onPersonaChange}/>
          {filtered.slice(3).map(item => (
            <HistoryCard key={item.id} item={item} onClick={() => onResume(item)}/>
          ))}
        </div>
      </div>

      <div className="dash-footer">
        <button className="link-btn" onClick={onLand}>← Back to landing</button>
      </div>

      <style>{`
        .dashboard { padding-bottom: 48px; }
        .dash-hero {
          max-width: 880px;
          margin: 24px auto 48px;
          padding: 0 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .dash-h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0;
          text-wrap: balance;
        }
        .search-bar {
          width: 100%;
          max-width: 720px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--paper);
          border-radius: var(--r-pill);
          padding: 8px 8px 8px 20px;
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(45,30,15,0.05);
          margin-top: 8px;
          transition: box-shadow 0.3s ease, transform 0.3s var(--ease-spring);
        }
        .search-bar:focus-within {
          box-shadow: var(--shadow-lg), 0 0 0 4px rgba(255, 176, 133, 0.18);
          transform: translateY(-1px);
        }
        .search-icon { color: var(--ink-300); display: flex; }
        .search-bar input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 17px;
          color: var(--ink-900);
          outline: none;
          padding: 12px 0;
          letter-spacing: -0.01em;
        }
        .search-bar input::placeholder { color: var(--ink-300); }
        .search-actions { display: flex; gap: 6px; align-items: center; }
        .search-upload {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--cream-deep);
          color: var(--ink-700);
          display: grid; place-items: center;
          transition: all 0.2s ease;
        }
        .search-upload:hover { background: var(--peach-50); color: var(--peach-500); }
        .search-submit { padding: 12px 20px; font-size: 14px; }
        .search-hints {
          display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
          margin-top: 4px;
        }
        .hint-chip {
          padding: 6px 12px;
          border-radius: var(--r-pill);
          background: transparent;
          border: 1px solid var(--ink-100);
          font-size: 13px;
          color: var(--ink-500);
          transition: all 0.2s ease;
        }
        .hint-chip:hover {
          border-color: var(--peach-300);
          color: var(--peach-500);
          background: var(--peach-50);
        }

        .dash-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dash-section-head {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 0 8px;
        }
        .hgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 18px;
          margin-top: 8px;
        }
        .dash-footer { text-align: center; margin-top: 32px; }
        .link-btn { color: var(--ink-500); font-size: 14px; }
        .link-btn:hover { color: var(--ink-900); }
      `}</style>
    </div>
  );
}

Object.assign(window, { DashboardPage, HistoryCard, SUBJECTS, HISTORY_ITEMS });
