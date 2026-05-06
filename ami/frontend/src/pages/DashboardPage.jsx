import { useState, useEffect } from 'react'
import { api } from '../services/api.js'
import { Ico } from '../components/ui/Icons.jsx'
import { TopBar } from '../components/layout/TopBar.jsx'
import { SUBJECTS, HISTORY_ITEMS } from '../data/content.js'

function SceneArt({ scene }) {
  if (scene === 'leaf') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#E8F4E8"/>
      <circle cx="170" cy="30" r="14" fill="#FFD466"/>
      <path d="M170 30 L 170 8 M170 30 L 170 52 M170 30 L 192 30 M170 30 L 148 30" stroke="#FFD466" strokeWidth="1.5"/>
      <path d="M 60 110 Q 50 70 80 50 Q 110 30 120 60 Q 110 90 80 100 Q 70 105 60 110 Z" fill="#5BA85F"/>
      <path d="M 80 100 L 95 70" stroke="#3E7E42" strokeWidth="1.5" fill="none"/>
      <path d="M 130 110 Q 125 80 145 65 Q 165 55 170 80 Q 160 100 140 105 Z" fill="#7BC07F"/>
    </svg>
  )
  if (scene === 'globe') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#CFE4F2"/>
      <circle cx="100" cy="80" r="40" fill="#7AAB7E"/>
      <ellipse cx="100" cy="80" rx="40" ry="14" fill="none" stroke="#3E6A8C" strokeWidth="1" opacity="0.4"/>
      <ellipse cx="100" cy="80" rx="14" ry="40" fill="none" stroke="#3E6A8C" strokeWidth="1" opacity="0.4"/>
      <path d="M 30 40 Q 50 30 70 35" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8"/>
    </svg>
  )
  if (scene === 'fire') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#F4D9B3"/>
      <path d="M 90 90 Q 95 70 100 60 Q 105 70 110 90 Q 105 95 100 92 Q 95 95 90 90 Z" fill="#FF8856"/>
      <path d="M 95 88 Q 98 78 100 72 Q 102 78 105 88 Q 100 92 95 88 Z" fill="#FFD466"/>
      <path d="M 80 95 L 120 95 L 116 100 L 84 100 Z" fill="#7A4A2E"/>
    </svg>
  )
  if (scene === 'space') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#1A1F3E"/>
      {[[20,20],[60,15],[140,25],[180,30],[40,80],[170,90]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={1.5} fill="#fff" opacity="0.9"/>)}
      <circle cx="60" cy="80" r="22" fill="#5B8FB9"/>
      <ellipse cx="60" cy="80" rx="22" ry="6" fill="none" stroke="#FFCBA4" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="140" cy="50" r="14" fill="#C97064"/>
    </svg>
  )
  if (scene === 'city') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#CFE4F2"/>
      <rect y="80" width="200" height="40" fill="#A8D4A4"/>
      <rect x="20" y="40" width="22" height="50" fill="#9CB4D0"/>
      <rect x="48" y="20" width="28" height="70" fill="#7A95B5"/>
      <rect x="108" y="30" width="32" height="60" fill="#8FA8C2"/>
    </svg>
  )
  if (scene === 'molecule') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#F0E4D2"/>
      <line x1="60" y1="60" x2="100" y2="40" stroke="#5A4A30" strokeWidth="3"/>
      <line x1="100" y1="40" x2="140" y2="60" stroke="#5A4A30" strokeWidth="3"/>
      <circle cx="100" cy="40" r="12" fill="#5B8FB9"/>
      <circle cx="60" cy="60" r="10" fill="#C97064"/>
      <circle cx="140" cy="60" r="10" fill="#7AAB7E"/>
    </svg>
  )
  if (scene === 'mind') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#EDE5D6"/>
      <path d="M 60 60 Q 70 30 100 35 Q 130 30 140 60 Q 145 90 110 95 Q 75 90 60 60 Z" fill="#7A6BA8" opacity="0.85"/>
    </svg>
  )
  if (scene === 'orbit') return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <rect width="200" height="120" fill="#FCEBD9"/>
      <ellipse cx="100" cy="60" rx="70" ry="20" fill="none" stroke="#D88A57" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="100" cy="60" r="14" fill="#FFD466"/>
      <circle cx="170" cy="60" r="6" fill="#5B8FB9"/>
    </svg>
  )
  return <div style={{ width: '100%', height: '100%', background: '#eee' }}/>
}

function HistoryCard({ item, onClick, isMock }) {
  const sub = SUBJECTS[item.subject] || { color: '#888', icon: 'Book' }
  const Icon = Ico[sub.icon] || Ico.Book
  const pct = Math.round((item.progress || 0) * 100)
  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
  return (
    <div
      onClick={isMock ? undefined : onClick}
      title={isMock ? 'Generate a module to start learning' : undefined}
      style={{
        background: 'var(--paper)',
        borderRadius: 'var(--r-lg)',
        padding: '16px 16px 18px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(45,30,15,0.05)',
        cursor: isMock ? 'default' : 'pointer',
        transition: 'transform 0.4s var(--ease-organic), box-shadow 0.4s ease',
        display: 'flex', flexDirection: 'column', gap: 10,
        opacity: isMock ? 0.82 : 1,
      }}
      onMouseEnter={e => { if (!isMock) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' } }}
      onMouseLeave={e => { if (!isMock) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: sub.color }}>
          <Icon style={{ width: 14, height: 14 }}/>{item.subject || 'Module'}
        </span>
        {isMock
          ? <span style={{ fontSize: 11, color: 'var(--lav-400)', fontWeight: 500 }}>sample</span>
          : <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>{dateStr}</span>
        }
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.2, letterSpacing: '-0.015em' }}>{item.topic || item.title}</div>
      <div style={{ width: '100%', aspectRatio: '1.7', borderRadius: 14, overflow: 'hidden', background: 'var(--cream-deep)' }}>
        <SceneArt scene={item.scene}/>
      </div>
      <div style={{ position: 'relative', marginTop: 4 }}>
        <div style={{ height: 4, background: 'var(--ink-100)', borderRadius: 999 }}>
          <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${pct}%`, background: 'linear-gradient(90deg, var(--peach-300), var(--peach-400))', borderRadius: 999, transition: 'width 0.6s var(--ease-organic)' }}/>
        </div>
        <span style={{ position: 'absolute', top: 8, left: 0, fontSize: 11, fontWeight: 500, color: 'var(--ink-500)' }}>
          {pct === 100 ? 'Completed' : pct === 0 ? 'New' : `${pct}% complete`}
        </span>
      </div>
    </div>
  )
}

// ── How It Works tiles (for logged-out guests) ────────────────────────────────
const HOW_IT_WORKS = [
  {
    icon: <Ico.Search style={{ width: 22, height: 22 }}/>,
    color: 'var(--peach-400)',
    bg: 'var(--peach-50)',
    title: 'Search any topic',
    desc: 'Type a concept, paste a Wikipedia link, or upload a PDF. AMI figures out the rest.',
  },
  {
    icon: <Ico.Sparkle style={{ width: 22, height: 22 }}/>,
    color: 'var(--lav-500)',
    bg: 'var(--lav-50)',
    title: 'AMI builds your module',
    desc: '5 formats are generated in seconds — immersive text, slides, audio, mindmap, and source.',
  },
  {
    icon: <Ico.Brain style={{ width: 22, height: 22 }}/>,
    color: 'var(--success)',
    bg: 'rgba(79,176,122,0.08)',
    title: 'Learn your way',
    desc: 'Read, listen, watch, or explore. Switch between formats whenever you like.',
  },
  {
    icon: <Ico.Target style={{ width: 22, height: 22 }}/>,
    color: 'var(--peach-500)',
    bg: 'var(--peach-50)',
    title: 'Test your knowledge',
    desc: 'Explain what you learned in your own words. AMI scores you and pinpoints gaps.',
  },
]

const DEMO_IDS = {
  'Photosynthesis': 'demo-photosynthesis',
  'Black Holes': 'demo-black-holes',
  'The French Revolution': 'demo-french-revolution',
  'How Transformers Work': 'demo-transformers',
}

export default function DashboardPage({ persona, onChangePersona, onAccountSettings, onLogout, onSearch, onUpload, onResume, onDemoLoad, onLand, onLogin, dark, onToggleDark, user }) {
  const [query, setQuery] = useState('')
  const [modules, setModules] = useState([])

  useEffect(() => {
    if (user) {
      api.getModules().then(setModules).catch(console.error)
    }
  }, [user])

  const submit = (e) => {
    e?.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const isLoggedIn = !!user

  return (
    <div style={{ paddingBottom: 48 }} className="fade-in">
      <TopBar
        persona={persona}
        onChangePersona={onChangePersona}
        onAccountSettings={onAccountSettings}
        onLogout={onLogout}
        dark={dark}
        onToggleDark={onToggleDark}
        user={user}
      />

      <div style={{ maxWidth: 880, margin: '24px auto 48px', padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span className="eyebrow">
          {isLoggedIn ? `Welcome back, ${firstName}` : 'Start learning for free'}
        </span>
        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0 }}>
          {isLoggedIn ? 'What do you want to learn today?' : 'What do you want to master?'}
        </h1>
        <form style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--paper)', borderRadius: 'var(--r-pill)', padding: '8px 8px 8px 20px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(45,30,15,0.05)', marginTop: 8 }} onSubmit={submit}>
          <span style={{ color: 'var(--ink-300)', display: 'flex' }}><Ico.Search/></span>
          <input placeholder='Try "Photosynthesis" or paste a Wikipedia link…' value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 17, color: 'var(--ink-900)', outline: 'none', padding: '12px 0', letterSpacing: '-0.01em' }}/>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button type="button" onClick={onUpload} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-deep)', color: 'var(--ink-700)', display: 'grid', placeItems: 'center' }}>
              <Ico.Upload/>
            </button>
            <button type="submit" className="pill pill-primary" style={{ padding: '12px 20px', fontSize: 14 }}>
              <Ico.Sparkle/> Generate
            </button>
          </div>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
          {Object.keys(DEMO_IDS).map(s => (
            <button
              key={s}
              onClick={() => onDemoLoad ? onDemoLoad(DEMO_IDS[s]) : (setQuery(s), onSearch(s))}
              style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--lav-50)', border: '1px solid var(--lav-200)', fontSize: 13, color: 'var(--lav-500)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--lav-100)'; e.currentTarget.style.borderColor = 'var(--lav-300)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--lav-50)'; e.currentTarget.style.borderColor = 'var(--lav-200)' }}
            >
              <span style={{ fontSize: 11, opacity: 0.7 }}>⚡</span> {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isLoggedIn ? (
          <>
            {modules.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 8px' }}>
                  <h2 className="h3">Continue learning</h2>
                  <span className="muted" style={{ fontSize: 13 }}>{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginTop: 8 }}>
                  {modules.map(item => (
                    <HistoryCard key={item.id} item={item} onClick={() => onResume(item)}/>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 8px' }}>
                  <h2 className="h3">Continue learning</h2>
                  <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 999, background: 'var(--lav-50)', border: '1px solid var(--lav-200)', color: 'var(--lav-500)' }}>
                    ✦ Sample modules
                  </span>
                </div>
                <p className="muted" style={{ fontSize: 14, padding: '0 8px', margin: '0 0 4px' }}>
                  Your modules will appear here. Generate your first one above — or explore these samples to see what AMI creates.
                </p>
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginTop: 4 }}>
                  {HISTORY_ITEMS.map(item => (
                    <HistoryCard key={item.id} item={{ ...item, topic: item.title }} onClick={() => {}} isMock/>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 8px' }}>
              <h2 className="h3">How it works</h2>
              <button className="pill pill-ghost" style={{ fontSize: 13 }} onClick={onLogin}>
                <Ico.LogIn style={{ width: 14, height: 14 }}/> Sign in to save progress
              </button>
            </div>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginTop: 8 }}>
              {HOW_IT_WORKS.map((tile, i) => (
                <div key={i} style={{ background: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '24px 22px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(45,30,15,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: tile.bg, display: 'grid', placeItems: 'center', color: tile.color }}>
                    {tile.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink-900)', marginBottom: 6 }}>{tile.title}</div>
                    <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.55 }}>{tile.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, padding: '20px', background: 'var(--lav-50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--lav-100)' }}>
              <p style={{ fontSize: 15, color: 'var(--ink-700)', margin: '0 0 14px' }}>
                <strong>Create a free account</strong> to save your modules and track progress across sessions.
              </p>
              <button className="pill pill-primary" onClick={onLogin}>
                <Ico.Sparkle/> Get started free
              </button>
            </div>
          </>
        )}
      </div>

      {isLoggedIn && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="link-btn" onClick={onLand}>← Back to landing</button>
        </div>
      )}
    </div>
  )
}
