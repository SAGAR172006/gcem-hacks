import { useState, useRef } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { Brand, TopBar } from '../components/layout/TopBar.jsx'

// ── Peach Waves (same as LandingPage) ─────────────────────────────────────────
function PeachWaves({ intensity = 1 }) {
  const op = (base) => Math.min(0.95, base * intensity)
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="qlPeachA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFCBA4"/><stop offset="1" stopColor="#FFB085"/>
          </linearGradient>
          <linearGradient id="qlPeachB" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE0CC"/><stop offset="1" stopColor="#FFCBA4"/>
          </linearGradient>
          <radialGradient id="qlPeachC" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFB085"/><stop offset="1" stopColor="#FFB085" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{ transformOrigin: '30% 30%', animation: 'wave-drift-1 28s ease-in-out infinite' }}>
          <path d="M -100 80 Q 200 -40 500 60 T 1100 100 Q 1300 180 1500 80 L 1700 -100 L -200 -100 Z" fill="url(#qlPeachA)" opacity={op(0.95)}/>
          <path d="M -100 380 Q 200 240 500 320 Q 800 420 1100 320 Q 1400 220 1700 360 L 1700 100 Q 1400 0 1100 80 Q 800 180 500 80 Q 200 -20 -100 120 Z" fill="url(#qlPeachB)" opacity={op(0.85)}/>
        </g>
        <g style={{ transformOrigin: '70% 60%', animation: 'wave-drift-2 36s ease-in-out infinite' }}>
          <path d="M 1700 600 Q 1400 720 1100 640 Q 800 560 600 660 Q 400 740 100 660 Q -100 600 -100 720 L -100 940 L 1700 940 Z" fill="url(#qlPeachA)" opacity={op(0.92)}/>
        </g>
        <g style={{ transformOrigin: '50% 50%', animation: 'wave-drift-3 22s ease-in-out infinite' }}>
          <ellipse cx="350" cy="500" rx="300" ry="160" fill="url(#qlPeachC)" opacity={op(0.55)}/>
          <ellipse cx="1250" cy="280" rx="240" ry="140" fill="url(#qlPeachC)" opacity={op(0.4)}/>
        </g>
      </svg>
    </div>
  )
}

// ── Deadline Picker ────────────────────────────────────────────────────────────
const DEADLINE_OPTIONS = [
  { label: '1 hr',   value: '1h',  unit: 'Hours' },
  { label: '2 hrs',  value: '2h',  unit: 'Hours' },
  { label: '4 hrs',  value: '4h',  unit: 'Hours' },
  { label: '1 day',  value: '1d',  unit: 'Days' },
  { label: '3 days', value: '3d',  unit: 'Days' },
  { label: '1 week', value: '7d',  unit: 'Days' },
]

function DeadlinePicker({ selected, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 10 }}>
        <Ico.Clock style={{ width: 14, height: 14, display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--peach-500)' }}/>
        Deadline
        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>when do you need to learn this by?</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DEADLINE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: selected?.value === opt.value ? 'var(--peach-50)' : 'rgba(255,255,255,0.7)',
              border: `1.5px solid ${selected?.value === opt.value ? 'var(--peach-400)' : 'rgba(255,255,255,0.5)'}`,
              fontSize: 13,
              fontWeight: 600,
              color: selected?.value === opt.value ? 'var(--peach-600, #c9663a)' : 'var(--ink-600)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s var(--ease-organic)',
              boxShadow: selected?.value === opt.value ? '0 2px 8px rgba(255,148,102,0.2)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Drop Zone ──────────────────────────────────────────────────────────────────
function DropZone({ files, onFiles, onClear }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' || f.type.startsWith('image/')
    )
    if (dropped.length) onFiles(dropped)
  }

  const handleInput = (e) => {
    const picked = Array.from(e.target.files)
    if (picked.length) onFiles(picked)
  }

  if (files.length > 0) {
    return (
      <div style={{
        border: '2px dashed var(--success)',
        borderRadius: 'var(--r-xl)',
        padding: '32px 28px',
        background: 'rgba(79,176,122,0.06)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s var(--ease-organic)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--r-md)', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,176,122,0.15)', display: 'grid', placeItems: 'center', color: 'var(--success)', flexShrink: 0 }}>
                {f.type === 'application/pdf' ? <Ico.Pdf style={{ width: 18, height: 18 }}/> : <Ico.Image style={{ width: 18, height: 18 }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: 0 }}>{(f.size / 1024).toFixed(1)} KB</p>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--success)', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                <Ico.Check style={{ width: 11, height: 11 }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="pill pill-ghost" style={{ backdropFilter: 'blur(8px)' }} onClick={onClear}>
            Clear files
          </button>
          <button className="pill pill-ghost" style={{ backdropFilter: 'blur(8px)' }} onClick={() => inputRef.current?.click()}>
            Add more
          </button>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,image/*" multiple style={{ display: 'none' }} onChange={handleInput}/>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? 'var(--peach-400)' : 'rgba(255,255,255,0.5)'}`,
        borderRadius: 'var(--r-xl)',
        padding: '48px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'rgba(255,203,164,0.15)' : 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.3s var(--ease-organic)',
        boxShadow: dragging ? '0 0 0 4px rgba(255,148,102,0.15)' : 'none',
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf,image/*" multiple style={{ display: 'none' }} onChange={handleInput}/>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.7)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', color: 'var(--peach-500)', boxShadow: '0 4px 16px rgba(255,148,102,0.15)' }}>
        <Ico.Upload style={{ width: 30, height: 30 }}/>
      </div>
      <p style={{ fontWeight: 700, fontSize: 20, margin: '0 0 8px', color: 'var(--ink-900)' }}>
        {dragging ? 'Drop it!' : 'Drop your files here'}
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '0 0 20px' }}>Supports PDF and images · Multiple files OK · Max 10 pages per PDF</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="pill" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', color: 'var(--ink-700)', fontWeight: 600 }}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
          <Ico.Pdf/> Browse PDF
        </button>
        <button className="pill" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', color: 'var(--ink-700)', fontWeight: 600 }}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
          <Ico.Image/> Browse Image
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuickLearningPage({ persona, onChangePersona, onAccountSettings, onLogout, dark, onToggleDark, user, onSubmit, onBack }) {
  const [files, setFiles] = useState([])
  const [deadline, setDeadline] = useState(null)
  const [titleOverride, setTitleOverride] = useState('')

  const canSubmit = files.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const defaultTitle = files.length === 1
      ? files[0].name.replace(/\.[^.]+$/, '')
      : `${files.length} files`
    onSubmit({
      title: titleOverride.trim() || defaultTitle,
      files,
      deadline: deadline?.value || null,
    })
  }

  return (
    <div className="fade-in" style={{ minHeight: '100vh', position: 'relative', background: 'var(--cream)', overflow: 'hidden' }}>
      <PeachWaves intensity={0.75}/>

      {/* TopBar floated over wave */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TopBar
          persona={persona}
          onChangePersona={onChangePersona}
          onAccountSettings={onAccountSettings}
          onLogout={onLogout}
          dark={dark}
          onToggleDark={onToggleDark}
          user={user}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 680, margin: '0 auto', padding: '0 28px 80px' }}>

        {/* Back */}
        <button className="link-btn" onClick={onBack} style={{ marginBottom: 32, marginTop: 8 }}>
          <Ico.ArrowLeft/> Back
        </button>

        {/* Hero copy */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--peach-600, #c9663a)', textTransform: 'uppercase', marginBottom: 18, border: '1px solid rgba(255,255,255,0.5)' }}>
            <Ico.Sparkle style={{ width: 13, height: 13 }}/>
            Quick Learning
          </div>
          <h1 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.1, color: 'var(--ink-900)' }}>
            Upload your material,<br/>
            <span style={{ color: 'var(--peach-500)' }}>AMI handles the rest.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-500)', margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Drop a PDF or images and AMI will generate a complete, personalized learning module — scoped entirely to your content.
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: 'var(--r-xl)',
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(180,100,60,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}>

          {/* Drop zone */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 10 }}>
              <Ico.Upload style={{ width: 14, height: 14, display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--peach-500)' }}/>
              Your material
            </div>
            <DropZone
              files={files}
              onFiles={(f) => setFiles(prev => {
                const names = new Set(prev.map(x => x.name))
                return [...prev, ...f.filter(x => !names.has(x.name))]
              })}
              onClear={() => setFiles([])}
            />
          </div>

          {/* Optional title */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>
              <Ico.Pencil style={{ width: 13, height: 13, display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--peach-500)' }}/>
              Module title
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>optional — we'll infer it from the file</span>
            </div>
            <input
              value={titleOverride}
              onChange={e => setTitleOverride(e.target.value)}
              placeholder={files.length > 0 ? files[0].name.replace(/\.[^.]+$/, '') : 'e.g. Cell Biology Chapter 3'}
              style={{
                width: '100%',
                height: 46,
                padding: '0 16px',
                border: '1.5px solid rgba(255,255,255,0.6)',
                borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                fontSize: 14,
                color: 'var(--ink-900)',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--peach-300)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.6)'}
            />
          </div>

          {/* Deadline */}
          <DeadlinePicker selected={deadline} onSelect={setDeadline}/>

          {/* What AMI generates */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { icon: <Ico.Book/>, label: 'Immersive Text' },
              { icon: <Ico.Slides/>, label: 'Slides' },
              { icon: <Ico.Audio/>, label: 'Audio Lesson' },
              { icon: <Ico.Mind/>, label: 'Mind Map' },
              { icon: <Ico.Target/>, label: 'Quiz Mode' },
            ].map(f => (
              <div key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', border: '1px solid rgba(255,255,255,0.5)' }}>
                <span style={{ color: 'var(--lav-500)' }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.5)' }}>
            {!canSubmit && (
              <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: 0 }}>Upload at least one file to continue</p>
            )}
            <button
              className="pill pill-primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
              style={{ opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: 15, padding: '12px 28px' }}
            >
              <Ico.Sparkle/> Generate my module
            </button>
          </div>
        </div>

        {/* Info blurb */}
        <div style={{ marginTop: 18, padding: '14px 20px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,255,255,0.5)', fontSize: 13, color: 'var(--ink-600)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--lav-500)', flexShrink: 0, marginTop: 1 }}><Ico.Sparkle style={{ width: 14, height: 14 }}/></span>
          <span><strong style={{ color: 'var(--lav-500)' }}>Scoped learning:</strong> AMI reads only your uploaded material — no internet search. Everything generated stays 100% grounded in your content.</span>
        </div>
      </div>
    </div>
  )
}
