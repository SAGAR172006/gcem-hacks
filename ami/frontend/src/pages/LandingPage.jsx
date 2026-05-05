import { useState, useEffect } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { Brand } from '../components/layout/TopBar.jsx'

function PeachWaves({ intensity = 1 }) {
  const op = (base) => Math.min(0.95, base * intensity)
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="peachA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFCBA4"/><stop offset="1" stopColor="#FFB085"/>
          </linearGradient>
          <linearGradient id="peachB" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE0CC"/><stop offset="1" stopColor="#FFCBA4"/>
          </linearGradient>
          <radialGradient id="peachC" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFB085"/><stop offset="1" stopColor="#FFB085" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{ transformOrigin: '30% 30%', animation: 'wave-drift-1 10s ease-in-out infinite' }}>
          <path d="M -100 80 Q 200 -40 500 60 T 1100 100 Q 1300 180 1500 80 L 1700 -100 L -200 -100 Z" fill="url(#peachA)" opacity={op(0.95)}/>
          <path d="M -100 380 Q 200 240 500 320 Q 800 420 1100 320 Q 1400 220 1700 360 L 1700 100 Q 1400 0 1100 80 Q 800 180 500 80 Q 200 -20 -100 120 Z" fill="url(#peachB)" opacity={op(0.85)}/>
        </g>
        <g style={{ transformOrigin: '70% 60%', animation: 'wave-drift-2 13s ease-in-out infinite' }}>
          <path d="M 1700 600 Q 1400 720 1100 640 Q 800 560 600 660 Q 400 740 100 660 Q -100 600 -100 720 L -100 940 L 1700 940 Z" fill="url(#peachA)" opacity={op(0.92)}/>
        </g>
        <g style={{ transformOrigin: '50% 50%', animation: 'wave-drift-3 8s ease-in-out infinite' }}>
          <ellipse cx="350" cy="500" rx="300" ry="160" fill="url(#peachC)" opacity={op(0.55)}/>
          <ellipse cx="1250" cy="280" rx="240" ry="140" fill="url(#peachC)" opacity={op(0.4)}/>
        </g>
      </svg>
    </div>
  )
}

function VisualizerCard() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 4), 2400)
    return () => clearInterval(t)
  }, [])
  const formats = [
    { label: 'Source PDF', icon: <Ico.Pdf/>, color: 'var(--ink-700)' },
    { label: 'Immersive Text', icon: <Ico.Book/>, color: 'var(--peach-500)' },
    { label: 'Slides', icon: <Ico.Slides/>, color: 'var(--lav-500)' },
    { label: 'Audio', icon: <Ico.Audio/>, color: 'var(--success)' },
  ]
  return (
    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 28, padding: 28, boxShadow: 'var(--shadow-lg)', width: 'min(380px, 92vw)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center' }}>
      <div style={{ background: 'var(--cream-deep)', borderRadius: 14, padding: '16px 14px', height: 160, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {[90, 70, 85, 60].map((w, i) => <div key={i} style={{ height: 6, background: 'var(--ink-200)', borderRadius: 3, width: `${w}%` }}/>)}
      </div>
      <div>
        <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
          <path d="M 5 40 Q 20 10 35 40 Q 20 70 5 40" stroke="var(--lav-300)" strokeWidth="1.5" strokeDasharray="3 3" fill="none"/>
          <circle cx="20" cy="40" r="4" fill="var(--lav-500)" style={{ animation: 'pulse-glow 1.6s ease-in-out infinite' }}/>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {formats.map((f, i) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: phase === i ? 'var(--peach-50)' : 'var(--cream-deep)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: phase === i ? 'var(--ink-900)' : 'var(--ink-500)', transition: 'all 0.5s var(--ease-organic)', opacity: phase === i ? 1 : 0.6, transform: phase === i ? 'translateX(4px)' : 'none' }}>
            <span style={{ color: f.color }}>{f.icon}</span>
            <span>{f.label}</span>
            {phase === i && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--peach-500)', marginLeft: 'auto', boxShadow: '0 0 0 4px rgba(244,122,74,0.2)' }}/>}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroSearch({ onSubmit }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [chipIdx, setChipIdx] = useState(0)
  const suggestions = ['Photosynthesis', 'The French Revolution', 'How neural networks learn', 'Plate tectonics', 'Supply and demand']

  useEffect(() => {
    if (focused || q) return
    const t = setInterval(() => setChipIdx(i => (i + 1) % suggestions.length), 2600)
    return () => clearInterval(t)
  }, [focused, q])

  const submit = (val) => {
    const topic = (val ?? q).trim()
    if (!topic) return
    onSubmit(topic)
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 540 }}>
      <form style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper)', border: `1.5px solid ${focused ? 'var(--peach-300)' : 'transparent'}`, borderRadius: 999, padding: '8px 8px 8px 22px', boxShadow: focused ? '0 12px 32px rgba(244,122,74,0.18)' : '0 8px 24px rgba(80,40,20,0.08)', transition: 'all 0.25s var(--ease-organic)', transform: focused ? 'translateY(-1px)' : 'none' }} onSubmit={(e) => { e.preventDefault(); submit() }}>
        <span style={{ color: 'var(--peach-500)', display: 'inline-flex', flexShrink: 0 }}><Ico.Sparkle/></span>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={`Try "${suggestions[chipIdx]}"`} style={{ flex: 1, border: 'none', background: 'transparent', font: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink-900)', padding: '14px 4px', outline: 'none', minWidth: 0 }}/>
        <button type="submit" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: 'var(--peach-500)', color: 'white', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(244,122,74,0.3)' }}>
          <Ico.ArrowRight/>
        </button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>Or try</span>
        {suggestions.slice(0, 3).map(s => (
          <button key={s} onClick={() => { setQ(s); submit(s) }} style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-700)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--ink-100)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage({ onStart, onUpload, onLogin, intensity = 1 }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'var(--cream)', overflow: 'hidden' }}>
      <PeachWaves intensity={intensity}/>
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 56px' }}>
        <Brand/>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14, color: 'var(--ink-700)' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>How it works</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>For educators</a>
          <button className="pill pill-ghost" style={{ padding: '10px 18px', fontSize: 14 }} onClick={() => onLogin ? onLogin() : null}>Sign in</button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 4, display: 'grid', gridTemplateColumns: '1.2fr 1fr', alignItems: 'center', gap: 60, padding: '40px 56px 80px', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 220px)' }}>
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span className="eyebrow">A new kind of textbook</span>
          <h1 className="h1">Re-imagining<br/>textbooks for<br/>every learner.</h1>
          <p className="body" style={{ maxWidth: 480, fontSize: 18 }}>
            AMI transforms any topic — or your own PDF — into immersive text, narrated slides, audio lessons, and interactive mindmaps. Tailored to how <em>you</em> learn.
          </p>
          <HeroSearch onSubmit={(topic) => onStart(topic)}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <VisualizerCard/>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 24, alignItems: 'center', padding: '0 56px 32px', flexWrap: 'wrap' }}>
        <span className="muted" style={{ fontSize: 13 }}>Trusted by curious minds at</span>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, fontWeight: 600, color: 'var(--ink-500)' }}>
          {['Stanford', '·', 'Khan Academy', '·', 'OpenStax', '·', 'MIT OCW'].map((s, i) => (
            <span key={i} style={{ color: i % 2 === 1 ? 'var(--ink-200)' : undefined }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
