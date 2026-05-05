import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { TopBar } from '../components/layout/TopBar.jsx'
import { PHOTO_CONTENT } from '../data/content.js'
import { api } from '../services/api.js'

// ── Tab bar ──────────────────────────────────────────────────────────────────
const PILLARS = [
  { id: 'source', label: 'Source', icon: 'Pdf', color: 'var(--ink-700)' },
  { id: 'text', label: 'Immersive Text', icon: 'Book', color: 'var(--peach-500)' },
  { id: 'slides', label: 'Slides & Narration', icon: 'Slides', color: 'var(--lav-500)' },
  { id: 'audio', label: 'Audio Lesson', icon: 'Audio', color: 'var(--success)' },
  { id: 'mind', label: 'Mindmap', icon: 'Mind', color: 'var(--info)' },
  { id: 'test', label: 'Test Knowledge', icon: 'Target', color: 'var(--peach-500)' },
]

function PillarTabs({ active, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PILLARS.length}, 1fr)`, gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', overflowX: 'auto' }}>
      {PILLARS.map(p => {
        const Icon = Ico[p.icon]
        const isActive = active === p.id
        return (
          <button key={p.id} onClick={() => onChange(p.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--ink-900)' : 'var(--ink-500)', border: `1.5px solid ${isActive ? p.color : 'transparent'}`, background: isActive ? 'var(--paper)' : 'transparent', transition: 'all 0.4s var(--ease-organic)', cursor: 'pointer' }}>
            <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', background: isActive ? `color-mix(in srgb, ${p.color} 14%, transparent)` : 'var(--cream-deep)', borderRadius: 10, color: p.color }}>
              <Icon style={{ width: 18, height: 18 }}/>
            </span>
            <span>{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── PILLAR 1: Source ─────────────────────────────────────────────────────────
function SourcePillar({ source }) {
  const src = source || PHOTO_CONTENT.source
  const title = src.sourceTitle || src.title || 'Source material'
  const excerpt = src.sourceExcerpt || src.excerpt || ''
  const url = src.sourceUrl || null
  return (
    <div style={{ padding: '32px 48px 48px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="subject-chip"><Ico.Pdf style={{ width: 14, height: 14 }}/> Source</span>
        <span className="muted" style={{ fontSize: 13 }}>{title}</span>
        {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--lav-500)', marginLeft: 'auto' }}>View source ↗</a>}
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: 16, marginBottom: 24 }}>Raw text gathered from the source — before AMI restructured it into your learning module.</p>
      <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-700)', whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: 'var(--cream-deep)', padding: 24, borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--peach-300)', margin: 0 }}>
        {excerpt}
      </pre>
    </div>
  )
}

// ── PILLAR 2: Immersive Text ──────────────────────────────────────────────────
function InlineQuiz({ q }) {
  const [pick, setPick] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const correct = q.choices.find(c => c.correct)
  return (
    <div style={{ margin: '28px 0', padding: 22, background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 14 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--lav-200)', color: 'var(--lav-500)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.Hint/></span>
        <span dangerouslySetInnerHTML={{ __html: q.question.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.choices.map(c => {
          const isPicked = pick === c.id
          const state = pick == null ? '' : isPicked ? (c.correct ? 'right' : 'wrong') : (c.correct ? 'right' : '')
          return (
            <button key={c.id} onClick={() => pick == null && setPick(c.id)} disabled={pick != null} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: state === 'right' ? 'rgba(79,176,122,0.08)' : state === 'wrong' ? 'rgba(226,106,92,0.08)' : 'var(--paper)', border: `1.5px solid ${state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'transparent'}`, borderRadius: 999, fontSize: 14, color: 'var(--ink-700)', textAlign: 'left', cursor: pick != null ? 'default' : 'pointer', transition: 'all 0.3s var(--ease-organic)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'var(--cream-deep)', color: state ? 'white' : 'var(--ink-500)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.id.toUpperCase()}</span>
              <span>{c.text}</span>
              {state === 'right' && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}><Ico.Check/></span>}
              {state === 'wrong' && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}><Ico.Close/></span>}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
        {pick == null ? (
          <button onClick={() => setShowHint(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--ink-500)', cursor: 'pointer' }}>
            <Ico.Hint/> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: correct.id === pick ? 'var(--success)' : 'var(--error)' }}>
            {correct.id === pick ? '✓ Nice — that\'s right.' : `Not quite. The right answer is ${correct.id.toUpperCase()}.`}
          </span>
        )}
      </div>
      {showHint && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', borderLeft: '3px solid var(--lav-300)' }}>{q.hint}</div>}
    </div>
  )
}

function LeafCellDiagram() {
  return (
    <div style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: 16, margin: '16px 0', border: '1px solid var(--ink-100)' }}>
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 'auto' }}>
        <defs><radialGradient id="leafG" cx="0.5" cy="0.5"><stop offset="0" stopColor="#8FCB94"/><stop offset="1" stopColor="#5BA85F"/></radialGradient></defs>
        <ellipse cx="100" cy="100" rx="80" ry="60" fill="url(#leafG)" opacity="0.85"/>
        <ellipse cx="80" cy="90" rx="14" ry="20" fill="#3E7E42" opacity="0.8"/>
        <ellipse cx="120" cy="110" rx="14" ry="20" fill="#3E7E42" opacity="0.7"/>
        <text x="100" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Leaf cell</text>
        <path d="M 200 100 Q 240 80 280 100" stroke="#FFB085" strokeWidth="2.5" fill="none" markerEnd="url(#arr)"/>
        <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#FFB085"/></marker></defs>
        <ellipse cx="320" cy="100" rx="55" ry="40" fill="#7AAB7E" stroke="#3E7E42" strokeWidth="2"/>
        {[0,1,2,3].map(i => <ellipse key={i} cx={300 + i*10} cy={90 + (i%2)*16} rx="6" ry="3" fill="#3E7E42"/>)}
        <text x="320" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Chloroplast</text>
      </svg>
    </div>
  )
}

function CalvinDiagram() {
  return (
    <div style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: 16, margin: '16px 0', border: '1px solid var(--ink-100)' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>The Calvin Cycle</h4>
      <svg viewBox="0 0 360 220" style={{ width: '100%', height: 'auto' }}>
        <circle cx="180" cy="110" r="68" fill="none" stroke="#FFB085" strokeWidth="2" strokeDasharray="4 4"/>
        <g><circle cx="180" cy="42" r="26" fill="#FFCBA4"/><text x="180" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Fixation</text><text x="180" y="52" textAnchor="middle" fontSize="8" fill="#5A5A5A">CO₂ + RuBP</text></g>
        <g><circle cx="248" cy="148" r="26" fill="#E6E6FA"/><text x="248" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Reduction</text><text x="248" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">ATP + NADPH</text></g>
        <g><circle cx="112" cy="148" r="26" fill="#A8D4A4"/><text x="112" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Regen.</text><text x="112" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">RuBP rebuilt</text></g>
        <text x="40" y="50" fontSize="11" fontWeight="700" fill="#5A5A5A">CO₂</text>
        <path d="M 60 48 Q 110 30 154 36" stroke="#5A5A5A" strokeWidth="1.5" fill="none" markerEnd="url(#arr2)"/>
        <text x="290" y="210" fontSize="11" fontWeight="700" fill="#3E7E42">G3P → glucose</text>
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#5A5A5A"/></marker>
        </defs>
      </svg>
    </div>
  )
}

// ── Completion Toast ──────────────────────────────────────────────────────────
function CompletionToast({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fade-up" style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300,
      background: 'linear-gradient(135deg, var(--success), #2eab6e)',
      color: 'white',
      padding: '16px 28px',
      borderRadius: 999,
      boxShadow: '0 8px 32px rgba(79,176,122,0.35)',
      display: 'flex', alignItems: 'center', gap: 14,
      fontSize: 15, fontWeight: 700,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 22 }}>🏆</span>
      <span>Topic complete! You've mastered this module.</span>
    </div>
  )
}

// ── Roadmap sidebar ───────────────────────────────────────────────────────────
function RoadmapSidebar({ sections, sectionStatus, currentSection }) {
  const total = sections.length
  const doneCount = sectionStatus.filter(s => s === 'done').length
  const pct = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <aside style={{ position: 'sticky', top: 24, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 0, minWidth: 200 }}>
      {/* Overall bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--peach-300), var(--success))', borderRadius: 999, transition: 'width 0.6s var(--ease-organic)' }}/>
        </div>
      </div>

      {/* Vertical roadmap */}
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        {/* Vertical track line */}
        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--ink-100)', borderRadius: 999 }}/>
        {/* Filled portion */}
        <div style={{ position: 'absolute', left: 7, top: 8, width: 2, height: `${pct}%`, background: 'linear-gradient(to bottom, var(--peach-300), var(--success))', borderRadius: 999, transition: 'height 0.6s var(--ease-organic)' }}/>

        {sections.map((t, i) => {
          const status = sectionStatus[i] // 'done' | 'current' | 'locked'
          const isCurrent = i === currentSection
          const isDone = status === 'done'
          const isLocked = status === 'locked'
          return (
            <div key={t.id || i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < sections.length - 1 ? 20 : 0, opacity: isLocked ? 0.45 : 1, transition: 'opacity 0.3s' }}>
              {/* Node dot */}
              <div style={{
                position: 'absolute', left: -20, top: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: isDone ? 'var(--success)' : isCurrent ? 'var(--peach-400)' : 'var(--paper)',
                border: `2px solid ${isDone ? 'var(--success)' : isCurrent ? 'var(--peach-400)' : 'var(--ink-200)'}`,
                display: 'grid', placeItems: 'center', color: 'white',
                boxShadow: isCurrent ? '0 0 0 4px rgba(255,148,102,0.2)' : 'none',
                transition: 'all 0.4s var(--ease-organic)',
                zIndex: 1,
              }}>
                {isDone && <Ico.Check style={{ width: 9, height: 9 }}/>}
                {isCurrent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'block' }}/>}
              </div>
              {/* Label */}
              <div style={{ fontSize: 12.5, lineHeight: 1.35, color: isCurrent ? 'var(--ink-900)' : isDone ? 'var(--success)' : 'var(--ink-500)', fontWeight: isCurrent || isDone ? 600 : 400, padding: '2px 10px', borderRadius: 999, background: isCurrent ? 'var(--peach-50)' : 'transparent', transition: 'all 0.3s' }}>
                {t.title}
                {isLocked && <span style={{ marginLeft: 4, fontSize: 10 }}>🔒</span>}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ── Interactive InlineQuiz that reports result up ─────────────────────────────
function InlineQuizTracked({ q, onCorrect, onWrong }) {
  const [pick, setPick] = useState(null)
  const correct = q.choices.find(c => c.correct)
  const [showHint, setShowHint] = useState(false)

  const handlePick = (id) => {
    if (pick != null) return
    setPick(id)
    if (id === correct.id) onCorrect?.()
    else onWrong?.()
  }

  return (
    <div style={{ margin: '28px 0', padding: 22, background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 14 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--lav-200)', color: 'var(--lav-500)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.Hint/></span>
        <span dangerouslySetInnerHTML={{ __html: q.question.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.choices.map(c => {
          const isPicked = pick === c.id
          const state = pick == null ? '' : isPicked ? (c.correct ? 'right' : 'wrong') : (c.correct ? 'right' : '')
          return (
            <button key={c.id} onClick={() => handlePick(c.id)} disabled={pick != null} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: state === 'right' ? 'rgba(79,176,122,0.08)' : state === 'wrong' ? 'rgba(226,106,92,0.08)' : 'var(--paper)', border: `1.5px solid ${state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'transparent'}`, borderRadius: 999, fontSize: 14, color: 'var(--ink-700)', textAlign: 'left', cursor: pick != null ? 'default' : 'pointer', transition: 'all 0.3s var(--ease-organic)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--error)' : 'var(--cream-deep)', color: state ? 'white' : 'var(--ink-500)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.id.toUpperCase()}</span>
              <span>{c.text}</span>
              {state === 'right' && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}><Ico.Check/></span>}
              {state === 'wrong' && <span style={{ marginLeft: 'auto', color: 'var(--error)' }}><Ico.Close/></span>}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
        {pick == null ? (
          <button onClick={() => setShowHint(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--ink-500)', cursor: 'pointer' }}>
            <Ico.Hint/> {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: correct.id === pick ? 'var(--success)' : 'var(--error)' }}>
            {correct.id === pick ? '✓ That\'s right!' : `Not quite. Correct: ${correct.id.toUpperCase()}.`}
          </span>
        )}
      </div>
      {showHint && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', borderLeft: '3px solid var(--lav-300)' }}>{q.hint}</div>}
    </div>
  )
}

function ImmersivePillar({ textContent, moduleId }) {
  const c = textContent || PHOTO_CONTENT
  const tocSections = c.toc || []
  const total = tocSections.length

  // Track quiz results per section: null | 'correct' | 'wrong'
  const [quizResults, setQuizResults] = useState(() => Array(total).fill(null))
  const [currentSection, setCurrentSection] = useState(0)
  const [showToast, setShowToast] = useState(false)

  // Determine section status for roadmap
  const sectionStatus = tocSections.map((_, i) => {
    if (i < currentSection) return 'done'
    if (i === currentSection) return 'current'
    return 'locked'
  })

  // Check if topic is complete
  const isComplete = currentSection >= total

  const handleCorrect = () => {
    // Advance to next section
    const next = currentSection + 1
    setCurrentSection(next)
    setQuizResults(prev => { const r = [...prev]; r[currentSection] = 'correct'; return r })
    if (next >= total) {
      setTimeout(() => setShowToast(true), 400)
    }
  }

  const handleWrong = () => {
    // Reset: go back to section 0, clear all results
    setQuizResults(Array(total).fill(null))
    setCurrentSection(0)
  }

  const renderProse = (body) => body.split('\n\n').map((p, i) => (
    <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-700)', margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
  ))

  // Current section label
  const currentLabel = tocSections[currentSection]?.title || 'Complete'

  return (
    <>
      {showToast && <CompletionToast onClose={() => setShowToast(false)}/>}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, padding: '28px 36px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <RoadmapSidebar
          sections={tocSections}
          sectionStatus={sectionStatus}
          currentSection={Math.min(currentSection, total - 1)}
        />
        <article>
          {isComplete ? (
            <div className="fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>Section complete!</h2>
              <p className="muted" style={{ fontSize: 16, marginBottom: 24 }}>You've worked through all sections of {c.title}. Explore the other learning formats above.</p>
              <button className="pill pill-primary" onClick={() => { setCurrentSection(0); setQuizResults(Array(total).fill(null)) }}>
                <Ico.ArrowLeft/> Start over
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <button className="icon-btn" onClick={() => currentSection > 0 && setCurrentSection(s => s - 1)} style={{ opacity: currentSection === 0 ? 0.3 : 1 }}><Ico.ArrowLeft/></button>
                <span className="muted" style={{ fontSize: 12 }}>Section {currentSection + 1} of {total}</span>
                <div style={{ width: 32 }}/>
              </div>
              <h2 className="h2" style={{ marginBottom: 16 }}>{currentLabel}</h2>
              {c.sections.map(s => {
                if (s.kind === 'objectives') return (
                  <div key={s.id} style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: '18px 22px', borderLeft: '3px solid var(--peach-300)', marginBottom: 24 }}>
                    <h3 className="h3" style={{ marginBottom: 8 }}>{s.heading}</h3>
                    <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>By the end of this section, you should be able to:</p>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)' }}>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </div>
                )
                if (s.kind === 'prose') return (
                  <section key={s.id}>
                    {s.heading && <h3 className="h3" style={{ marginTop: 16 }}>{s.heading}</h3>}
                    {renderProse(s.body)}
                    {s.figure === 'leaf-cell' && <LeafCellDiagram/>}
                    {s.figure === 'calvin-cycle' && <CalvinDiagram/>}
                  </section>
                )
                if (s.kind === 'inline-quiz') return (
                  <InlineQuizTracked
                    key={s.id}
                    q={s}
                    onCorrect={handleCorrect}
                    onWrong={handleWrong}
                  />
                )
                return null
              })}
              {/* Hint bar at the bottom */}
              <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--peach-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--peach-500)' }}><Ico.Hint/></span>
                Answer the quiz correctly to unlock the next section. Wrong answers reset progress.
              </div>
            </>
          )}
        </article>
      </div>
    </>
  )
}

// ── PILLAR 3: Slides ─────────────────────────────────────────────────────────
function SlideRender({ slide }) {
  if (slide.kind === 'cover') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--peach-200), var(--peach-300))', display: 'grid', placeItems: 'center', color: 'white', marginBottom: 16 }}>
        <Ico.Leaf style={{ width: 28, height: 28 }}/>
      </div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--peach-500)', margin: 0 }}>{slide.title}</h1>
      <p style={{ fontSize: 22, color: 'var(--ink-700)', fontWeight: 500, margin: 0 }}>{slide.subtitle}</p>
    </div>
  )
  if (slide.kind === 'equation') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <h2 className="h2" style={{ color: 'var(--peach-500)' }}>{slide.title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, color: 'var(--ink-900)', alignItems: 'center', marginTop: 24, letterSpacing: '-0.02em' }}>
        <span>6 CO<sub>2</sub></span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span>6 H<sub>2</sub>O</span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span style={{ color: 'var(--peach-500)' }}>☀ light</span><span style={{ color: 'var(--peach-500)' }}>→</span>
        <span style={{ color: 'var(--success)' }}>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span><span style={{ color: 'var(--ink-300)' }}>+</span>
        <span>6 O<sub>2</sub></span>
      </div>
    </div>
  )
  if (slide.kind === 'split') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <h2 className="h2">{slide.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {[{ label: 'Stage 1', title: 'Light Reactions', body: 'Capture sunlight in the thylakoid; produce ATP + NADPH + O₂.', color: 'var(--peach-300)' }, { label: 'Stage 2', title: 'Calvin Cycle', body: 'Use ATP + NADPH in the stroma to fix CO₂ into glucose.', color: 'var(--lav-300)' }].map(card => (
          <div key={card.label} style={{ padding: 20, background: 'var(--paper)', borderRadius: 'var(--r-md)', border: `1.5px solid ${card.color}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="subject-chip">{card.label}</span>
            <h3 className="h3" style={{ marginTop: 8 }}>{card.title}</h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
  if (slide.kind === 'stat') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(80px,14vw,160px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--peach-500)', lineHeight: 0.9 }}>
        ~120<span style={{ fontSize: '0.4em', color: 'var(--ink-700)', marginLeft: 8 }}>Gt</span>
      </div>
      <p style={{ fontSize: 20, fontWeight: 600, maxWidth: 520, letterSpacing: '-0.015em', margin: '8px 0' }}>Carbon removed from the atmosphere by photosynthetic life every year.</p>
    </div>
  )
  return null
}

function SlidesPillar({ slides }) {
  const allSlides = (slides && slides.length > 0) ? slides : PHOTO_CONTENT.slides
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => { if (idx < allSlides.length - 1) setIdx(idx + 1); else setPlaying(false) }, 4000)
    return () => clearTimeout(t)
  }, [playing, idx])
  const currentSlide = allSlides[idx] || allSlides[0]
  return (
    <div style={{ padding: '28px 36px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div>
        <div key={idx} style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--cream), var(--peach-50))', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', padding: '48px 56px', overflow: 'hidden', animation: 'slide-in-right 0.6s var(--ease-organic)', position: 'relative' }}>
          {/* Background image if available */}
          {currentSlide.imageUrl && currentSlide.kind !== 'cover' && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${currentSlide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08, borderRadius: 'var(--r-lg)' }}/>
          )}
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <SlideRender slide={currentSlide}/>
          </div>
        </div>
        {/* Narration bar */}
        {currentSlide.narration && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--lav-50)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', border: '1px solid var(--lav-100)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Ico.Audio style={{ color: 'var(--lav-500)', width: 14, height: 14, flexShrink: 0 }}/>
            <span>{currentSlide.narration}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          {allSlides.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 999, background: i === idx ? 'var(--peach-400)' : 'var(--ink-200)', transition: 'all 0.3s var(--ease-organic)', cursor: 'pointer' }}/>)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--paper)', borderRadius: 999, marginTop: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--ink-100)' }}>
        <button onClick={() => setPlaying(p => !p)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--cream)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          {playing ? <Ico.Pause/> : <Ico.Play/>}
        </button>
        <span style={{ fontSize: 12, color: 'var(--ink-500)', minWidth: 32 }}>{idx + 1} / {allSlides.length}</span>
        <div style={{ flex: 1, height: 4, background: 'var(--ink-100)', borderRadius: 999, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${((idx + 1) / allSlides.length) * 100}%`, background: 'linear-gradient(90deg, var(--peach-300), var(--peach-400))', borderRadius: 999, transition: 'width 0.5s var(--ease-organic)' }}/>
        </div>
        <button className="icon-btn" onClick={() => setIdx(Math.max(0, idx - 1))}><Ico.ArrowLeft/></button>
        <button className="icon-btn" onClick={() => setIdx(Math.min(allSlides.length - 1, idx + 1))}><Ico.ArrowRight/></button>
      </div>
    </div>
  )
}

// ── PILLAR 4: Audio (Web Speech API — zero API keys, zero cost) ───────────────
function AudioPillar({ audioContent }) {
  const [playing, setPlaying] = useState(false)
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0)
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const uttRef = useRef(null)

  const title = audioContent?.title || 'Audio Lesson'
  const script = audioContent?.script || ''
  const chapters = audioContent?.chapters || []

  // Clean script: strip [CHAPTER:...] markers for spoken text
  const cleanScript = script.replace(/\[CHAPTER:[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim()

  // Split script into chapter segments for chapter-level playback
  const chapterSegments = useMemo(() => {
    if (!script) return []
    const parts = script.split(/\[CHAPTER:\s*(.+?)\]/g)
    const segs = []
    for (let i = 1; i < parts.length; i += 2) {
      segs.push({ title: parts[i].trim(), text: (parts[i + 1] || '').replace(/\s+/g, ' ').trim() })
    }
    return segs.length > 0 ? segs : [{ title: 'Audio Lesson', text: cleanScript }]
  }, [script])

  const speakChapter = (idx) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const seg = chapterSegments[idx]
    if (!seg) return
    const utt = new SpeechSynthesisUtterance(seg.text)
    utt.rate = 0.92
    utt.pitch = 1.0
    utt.onend = () => {
      const next = idx + 1
      if (next < chapterSegments.length) {
        setCurrentChapterIdx(next)
        speakChapter(next)
      } else {
        setPlaying(false)
        setCurrentChapterIdx(0)
      }
    }
    utt.onerror = () => setPlaying(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  const handlePlay = () => {
    if (!supported) return
    speakChapter(currentChapterIdx)
    setPlaying(true)
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setPlaying(false)
  }

  const handleResume = () => {
    window.speechSynthesis.resume()
    setPlaying(true)
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setCurrentChapterIdx(0)
  }

  const jumpToChapter = (idx) => {
    window.speechSynthesis.cancel()
    setCurrentChapterIdx(idx)
    setPlaying(true)
    speakChapter(idx)
  }

  useEffect(() => {
    return () => { if (supported) window.speechSynthesis.cancel() }
  }, [])

  return (
    <div style={{ padding: '28px 36px 40px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(180deg, var(--paper), var(--cream-deep))', borderRadius: 'var(--r-xl)', padding: 32, border: '1px solid var(--ink-100)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Visualiser */}
        <div style={{ aspectRatio: '2.5', background: 'linear-gradient(135deg, var(--peach-100), var(--lav-100))', borderRadius: 'var(--r-lg)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 4, height: '60%', alignItems: 'center' }}>
            {[...Array(28)].map((_, i) => (
              <span key={i} style={{ width: 4, background: 'linear-gradient(180deg, var(--peach-400), var(--lav-400))', borderRadius: 999, height: '30%', animation: 'audio-bounce 1s ease-in-out infinite alternate', animationDelay: `${i * 0.06}s`, animationPlayState: playing ? 'running' : 'paused', opacity: playing ? 1 : 0.35 }}/>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <span className="eyebrow">Audio Lesson</span>
          <h2 className="h2" style={{ marginTop: 6 }}>{title}</h2>
          <p className="muted" style={{ fontSize: 14 }}>Powered by your browser · No API key needed</p>
        </div>

        {/* Current chapter */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', padding: '12px 18px', background: 'var(--lav-50)', borderRadius: 999, fontSize: 14, fontWeight: 500, color: 'var(--ink-700)', margin: '0 auto', maxWidth: '100%' }}>
          <span style={{ color: 'var(--lav-500)', display: 'flex' }}><Ico.Audio/></span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {playing ? (chapterSegments[currentChapterIdx]?.title || 'Playing…') : 'Press play to begin'}
          </span>
        </div>

        {/* Not supported warning */}
        {!supported && (
          <div style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(226,106,92,0.07)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--error)' }}>
            Your browser does not support speech synthesis. Try Chrome or Edge.
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center' }}>
          <button className="icon-btn" onClick={() => jumpToChapter(Math.max(0, currentChapterIdx - 1))} disabled={!supported} title="Previous chapter"><Ico.ArrowLeft/></button>
          <button
            onClick={playing ? handlePause : (window.speechSynthesis?.paused ? handleResume : handlePlay)}
            disabled={!supported}
            style={{ width: 64, height: 64, borderRadius: '50%', background: supported ? 'var(--ink-900)' : 'var(--ink-200)', color: 'var(--cream)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-md)', cursor: supported ? 'pointer' : 'not-allowed', transition: 'transform 0.2s var(--ease-spring)' }}
          >
            {playing ? <Ico.Pause style={{ width: 22, height: 22 }}/> : <Ico.Play style={{ width: 22, height: 22 }}/>}
          </button>
          <button className="icon-btn" onClick={() => jumpToChapter(Math.min(chapterSegments.length - 1, currentChapterIdx + 1))} disabled={!supported} title="Next chapter"><Ico.ArrowRight/></button>
        </div>

        {/* Chapter list */}
        {chapterSegments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Chapters</div>
            {chapterSegments.map((ch, idx) => (
              <button key={idx} onClick={() => jumpToChapter(idx)} disabled={!supported} style={{ display: 'flex', gap: 14, padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--ink-700)', textAlign: 'left', background: idx === currentChapterIdx && playing ? 'var(--peach-50)' : 'transparent', fontWeight: idx === currentChapterIdx && playing ? 600 : 400, cursor: supported ? 'pointer' : 'default', transition: 'background 0.2s ease', border: 'none', width: '100%' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-300)', minWidth: 24, flexShrink: 0 }}>{idx + 1}.</span>
                <span>{ch.title}</span>
                {idx === currentChapterIdx && playing && <span style={{ marginLeft: 'auto', color: 'var(--peach-500)', fontSize: 11, fontWeight: 700 }}>▶ NOW</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PILLAR 5: Mindmap ─────────────────────────────────────────────────────────
function MindmapPillar({ mindmap }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [collapsed, setCollapsed] = useState({})
  const [active, setActive] = useState('root')
  const dragRef = useRef(null)
  // Support both flat array (new format) and old {root, nodes} format
  const allNodes = Array.isArray(mindmap) ? mindmap
    : mindmap ? [mindmap.root, ...(mindmap.nodes || [])]
    : [PHOTO_CONTENT.mindmap.root, ...PHOTO_CONTENT.mindmap.nodes]
  const visible = allNodes.filter(n => {
    let p = n.parent
    while (p) { if (collapsed[p]) return false; const pn = allNodes.find(x => x.id === p); p = pn?.parent }
    return true
  })
  const onMouseDown = (e) => { dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y } }
  const onMouseMove = (e) => { if (!dragRef.current) return; setPan({ x: dragRef.current.panX + (e.clientX - dragRef.current.x), y: dragRef.current.panY + (e.clientY - dragRef.current.y) }) }
  const onMouseUp = () => { dragRef.current = null }
  const hasChildren = (id) => allNodes.some(n => n.parent === id)
  return (
    <div style={{ height: 640, position: 'relative', overflow: 'hidden', cursor: 'grab', userSelect: 'none' }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--ink-100) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(calc(50% + ${pan.x}px), calc(50% + ${pan.y}px)) scale(${zoom})`, transformOrigin: '0 0', transition: 'transform 0.1s ease' }}>
        <svg style={{ position: 'absolute', left: -600, top: -400, pointerEvents: 'none' }} width="1200" height="800" viewBox="-600 -400 1200 800">
          {visible.filter(n => n.parent).map(n => {
            const parent = allNodes.find(p => p.id === n.parent)
            if (!parent || !visible.includes(parent)) return null
            const dx = n.x - parent.x; const cx = parent.x + dx * 0.5
            return <path key={n.id} d={`M ${parent.x} ${parent.y} C ${cx} ${parent.y}, ${cx} ${n.y}, ${n.x} ${n.y}`} stroke="var(--lav-300)" strokeWidth="1.5" fill="none" opacity="0.7"/>
          })}
        </svg>
        {visible.map(n => (
          <div key={n.id} onClick={(e) => { e.stopPropagation(); setActive(n.id) }} style={{ position: 'absolute', left: 0, top: 0, marginLeft: -60, marginTop: -16, padding: n.id === 'root' ? '12px 22px' : '8px 14px', background: n.id === 'root' ? (active === n.id ? 'var(--peach-300)' : 'var(--peach-200)') : (active === n.id ? 'var(--lav-200)' : 'var(--lav-100)'), border: `1.5px solid ${n.id === 'root' ? (active === n.id ? 'var(--peach-500)' : 'var(--peach-400)') : (active === n.id ? 'var(--lav-400)' : 'var(--lav-200)')}`, borderRadius: 999, fontSize: n.id === 'root' ? 14 : 12.5, fontWeight: n.id === 'root' ? 700 : 600, color: n.id === 'root' ? 'var(--ink-900)' : 'var(--lav-500)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, boxShadow: active === n.id ? '0 0 0 4px rgba(140,138,214,0.2), var(--shadow-md)' : 'var(--shadow-sm)', transform: `translate(${n.x}px, ${n.y}px)`, cursor: 'pointer', transition: 'all 0.3s var(--ease-organic)' }}>
            <span>{n.label}</span>
            {hasChildren(n.id) && (
              <button onClick={(e) => { e.stopPropagation(); setCollapsed(c => ({ ...c, [n.id]: !c[n.id] })) }} style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--paper)', color: 'var(--lav-500)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                {collapsed[n.id] ? <Ico.Plus/> : <Ico.Minus/>}
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 24, bottom: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 5 }}>
        <button className="icon-btn" onClick={() => setZoom(z => Math.min(2, z + 0.2))}><Ico.Plus/></button>
        <button className="icon-btn" onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}><Ico.Minus/></button>
        <button className="icon-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} title="Reset"><Ico.Sparkle/></button>
      </div>
      <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--ink-500)', padding: '8px 14px', background: 'var(--paper)', borderRadius: 999, boxShadow: 'var(--shadow-sm)' }}>
        <Ico.Mind style={{ color: 'var(--lav-500)', width: 14, height: 14 }}/> Drag to pan · click to focus
      </div>
    </div>
  )
}

// ── PILLAR 6: Test Knowledge ──────────────────────────────────────────────────
const SCORE_RUBRIC = [
  { min: 90, label: 'Mastered', color: 'var(--success)', emoji: '🏆' },
  { min: 70, label: 'Almost there', color: 'var(--lav-500)', emoji: '💡' },
  { min: 50, label: 'Keep going', color: 'var(--peach-500)', emoji: '📖' },
  { min: 0,  label: 'Needs review', color: 'var(--error)', emoji: '🔄' },
]

function TestKnowledgePillar({ topic = 'Photosynthesis', moduleId = null, sourceExcerpt = '' }) {
  const [step, setStep] = useState('prompt') // 'prompt' | 'submitted' | 'scored' | 'error'
  const [answer, setAnswer] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [gaps, setGaps] = useState([])
  const [strengths, setStrengths] = useState([])
  const [suggestion, setSuggestion] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef(null)
  const MIN_CHARS = 80

  const handleSubmit = async () => {
    if (answer.trim().length < MIN_CHARS) return
    setStep('submitted')
    try {
      const result = await api.scoreExplanation(moduleId, answer, sourceExcerpt)
      const rubric = SCORE_RUBRIC.find(r => result.score >= r.min) || SCORE_RUBRIC[SCORE_RUBRIC.length - 1]
      setScore(result.score)
      setFeedback(rubric)
      setStrengths(result.strengths || [])
      setGaps(result.gaps || [])
      setSuggestion(result.suggestion || '')
      setStep('scored')
    } catch (err) {
      setErrorMsg(err.message || 'Scoring failed. Please try again.')
      setStep('error')
    }
  }

  const reset = () => {
    setStep('prompt'); setAnswer(''); setCharCount(0); setScore(null)
    setFeedback(null); setGaps([]); setStrengths([]); setSuggestion(''); setErrorMsg('')
  }

  return (
    <div style={{ padding: '36px 48px 64px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--peach-50)', display: 'grid', placeItems: 'center', color: 'var(--peach-500)' }}>
          <Ico.Target style={{ width: 20, height: 20 }}/>
        </div>
        <div>
          <span className="eyebrow">Test Knowledge</span>
          <h2 className="h2" style={{ margin: 0 }}>Explain {topic} in your own words</h2>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 14, marginBottom: 32, marginTop: 6 }}>
        Write as if you're teaching a friend. AMI will score your understanding and tell you exactly what's missing.
      </p>

      {/* Prompt step */}
      {step === 'prompt' && (
        <div className="fade-in">
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => { setAnswer(e.target.value); setCharCount(e.target.value.length) }}
              placeholder={`Explain how ${topic} works, step by step. Mention the key stages, molecules involved, where it happens in the cell, and what it produces…`}
              style={{
                width: '100%', minHeight: 220, padding: '18px 18px 48px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-900)', background: 'var(--cream)', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--peach-300)'}
              onBlur={e => e.target.style.borderColor = 'var(--ink-100)'}
            />
            <div style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 12, color: charCount >= MIN_CHARS ? 'var(--success)' : 'var(--ink-400)', fontWeight: 600 }}>
              {charCount} / {MIN_CHARS}+ chars
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: 0 }}>
              {charCount < MIN_CHARS ? `Write at least ${MIN_CHARS - charCount} more characters` : '✓ Ready to submit'}
            </p>
            <button
              className="pill pill-primary"
              disabled={answer.trim().length < MIN_CHARS}
              onClick={handleSubmit}
              style={{ opacity: answer.trim().length < MIN_CHARS ? 0.45 : 1, cursor: answer.trim().length < MIN_CHARS ? 'not-allowed' : 'pointer' }}
            >
              <Ico.Sparkle/> Score my answer
            </button>
          </div>
          <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)', fontSize: 13, color: 'var(--ink-700)' }}>
            <strong style={{ color: 'var(--lav-500)' }}>Tip:</strong> The best answers cover the <em>where</em> (chloroplast), <em>what</em> (reactants + products), <em>how</em> (light reactions + Calvin cycle), and <em>why</em> it matters.
          </div>
        </div>
      )}

      {/* Loading step */}
      {step === 'submitted' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--lav-100)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: 'var(--lav-500)', animation: 'pulse-glow 1.6s ease-in-out infinite' }}>
            <Ico.Brain style={{ width: 32, height: 32 }}/>
          </div>
          <h3 style={{ fontWeight: 700, margin: '0 0 8px' }}>AMI is reading your answer…</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>Checking for key concepts, accuracy, and depth</p>
        </div>
      )}

      {/* Error step */}
      {step === 'error' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: 'var(--error)', marginBottom: 16 }}>{errorMsg}</p>
          <button className="pill pill-ghost" onClick={reset}>Try again</button>
        </div>
      )}

      {/* Scored step */}
      {step === 'scored' && score !== null && feedback && (
        <div className="fade-in">
          {/* Score ring */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ink-100)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={feedback.color} strokeWidth="10"
                  strokeDasharray={`${score * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s var(--ease-organic)' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: feedback.color, lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600 }}>/ 100</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{feedback.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: feedback.color, marginBottom: 4 }}>{feedback.label}</div>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {score >= 90 ? 'Impressive! You have a strong grasp of this topic.' :
                 score >= 70 ? 'Good effort! A few more concepts and you\'ll nail it.' :
                 score >= 50 ? 'You have the basics. Review the gaps below.' :
                 'Don\'t worry — focus on the missing concepts and try again.'}
              </p>
            </div>
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div style={{ marginBottom: 20, padding: '16px 20px', background: 'rgba(79,176,122,0.06)', borderRadius: 'var(--r-md)', border: '1px solid var(--success)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><Ico.Check/> What you got right</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {strengths.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--ink-700)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }}><Ico.Check style={{ width: 12, height: 12 }}/></span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {gaps.length > 0 && (
            <div style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(226,106,92,0.05)', borderRadius: 'var(--r-md)', border: '1px solid var(--error)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--error)', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><Ico.Target style={{ width: 14, height: 14 }}/> Gaps to address</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {gaps.map((g, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--ink-700)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}>•</span> {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AMI suggestion */}
          {suggestion && (
            <div style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)', fontSize: 13, color: 'var(--ink-700)' }}>
              <strong style={{ color: 'var(--lav-500)' }}>AMI suggests: </strong>{suggestion}
            </div>
          )}

          {/* Your answer (collapsed) */}
          <details style={{ marginBottom: 24 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--ink-500)', userSelect: 'none', marginBottom: 8 }}>Your answer</summary>
            <div style={{ padding: '14px 18px', background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)', borderLeft: '3px solid var(--ink-200)', marginTop: 8 }}>
              {answer}
            </div>
          </details>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill pill-ghost" onClick={reset}>
              <Ico.ArrowLeft/> Try again
            </button>
            <button className="pill pill-primary" onClick={reset} style={{ background: 'var(--lav-200)', color: 'var(--lav-500)', border: '1px solid var(--lav-300)' }}>
              <Ico.Book/> Review Immersive Text
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Floating AI Chatbot ────────────────────────────────────────────────────────
const BOT_INTROS = [
  "Hi! I'm AMI. Ask me anything about this topic.",
  "Got a question? I'm locked in on this module — ask away.",
]

function AIChatbot({ topic }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! I'm AMI. I'm here to help you understand **${topic}**. Ask me anything — definitions, examples, or how concepts connect.` }
  ])
  const [input, setInput] = useState('')
  const [strikes, setStrikes] = useState(0)
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open, messages])

  // Simple off-topic detection: check if message mentions topic keywords
  const isOffTopic = (text) => {
    const lower = text.toLowerCase()
    const topicWords = topic.toLowerCase().split(/\s+/)
    const relatedWords = ['what', 'how', 'why', 'explain', 'define', 'example', 'difference', 'process', 'step', 'stage', 'where', 'which', 'when', 'molecule', 'cell', 'plant', 'light', 'energy', 'reaction', 'glucose', 'oxygen', 'carbon', 'atp', 'chloro']
    const hasTopicWord = topicWords.some(w => lower.includes(w))
    const hasRelated = relatedWords.some(w => lower.includes(w))
    return !hasTopicWord && !hasRelated && text.length > 10
  }

  // Mock bot responses scoped to photosynthesis
  const getBotResponse = (userMsg) => {
    const lower = userMsg.toLowerCase()
    if (lower.includes('chlorophyll') || lower.includes('green')) return 'Chlorophyll is the pigment inside chloroplasts that absorbs light — mainly red and blue wavelengths — and converts it into chemical energy. That\'s why leaves look green: chlorophyll reflects green light back to your eyes.'
    if (lower.includes('atp')) return 'ATP (adenosine triphosphate) is the energy currency of the cell. In photosynthesis, the light reactions generate ATP using sunlight, and the Calvin cycle spends that ATP to build glucose.'
    if (lower.includes('calvin') || lower.includes('cycle')) return 'The Calvin Cycle happens in the stroma of the chloroplast. It uses CO₂, ATP, and NADPH to build glucose through a 3-step cycle: fixation → reduction → regeneration of RuBP.'
    if (lower.includes('oxygen') || lower.includes('o2')) return 'Oxygen is a byproduct of the light-dependent reactions. Water molecules (H₂O) are split in a process called photolysis — the oxygen released is what we breathe!'
    if (lower.includes('where') || lower.includes('chloroplast')) return 'Photosynthesis happens inside the chloroplast. Light reactions occur on the thylakoid membranes; the Calvin Cycle runs in the stroma.'
    if (lower.includes('why') || lower.includes('important')) return 'Photosynthesis is the foundation of almost all food chains on Earth. It converts solar energy into chemical energy (glucose), which fuels nearly all living things — including us.'
    if (lower.includes('glucose') || lower.includes('sugar')) return 'Glucose (C₆H₁₂O₆) is the main output of photosynthesis. Plants use it for energy and as a building block for cellulose, starch, and other organic molecules.'
    return `Good question! Regarding ${topic}: the process involves converting light energy into chemical energy stored as glucose. Could you be more specific about which part you'd like me to clarify?`
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text || thinking) return

    if (isOffTopic(text)) {
      const newStrikes = strikes + 1
      setStrikes(newStrikes)
      setMessages(prev => [
        ...prev,
        { role: 'user', text },
        {
          role: 'bot',
          text: newStrikes >= 2
            ? `⛔ I can only discuss **${topic}** in this session. I've noticed this is the second off-topic question — I'm going to stay focused. What would you like to know about ${topic}?`
            : `⚠️ I'm scoped to **${topic}** only! Let's keep our focus here. (1 of 2 warnings) — Try asking about the process, molecules, or stages involved.`,
          isWarning: true,
        }
      ])
      setInput('')
      return
    }

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: getBotResponse(text) }])
      setThinking(false)
    }, 900 + Math.random() * 600)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? 'var(--ink-900)' : 'linear-gradient(135deg, var(--lav-400), var(--peach-400))',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 2px 8px rgba(140,138,214,0.25)',
          transition: 'all 0.3s var(--ease-organic)',
          transform: open ? 'rotate(45deg) scale(0.9)' : 'scale(1)',
        }}
        title={open ? 'Close AMI' : 'Ask AMI'}
      >
        {open ? <Ico.Close style={{ width: 22, height: 22 }}/> : <Ico.Sparkle style={{ width: 22, height: 22 }}/>}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fade-in"
          style={{
            position: 'fixed', bottom: 96, right: 28, zIndex: 199,
            width: 'min(380px, calc(100vw - 40px))',
            maxHeight: '60vh',
            background: 'var(--paper)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(45,30,15,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fade-up 0.25s var(--ease-organic)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, var(--lav-100), var(--peach-50))', borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lav-300), var(--peach-300))', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
              <Ico.Sparkle style={{ width: 18, height: 18 }}/>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>AMI Tutor</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Scoped to: {topic}</div>
            </div>
            {strikes > 0 && (
              <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--error)', background: 'rgba(226,106,92,0.1)', padding: '3px 8px', borderRadius: 999 }}>
                {strikes}/2 warnings
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, var(--lav-400), var(--peach-400))' : m.isWarning ? 'rgba(226,106,92,0.08)' : 'var(--cream-deep)',
                  color: m.role === 'user' ? 'white' : m.isWarning ? 'var(--error)' : 'var(--ink-800)',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  border: m.isWarning ? '1px solid rgba(226,106,92,0.25)' : 'none',
                }}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'var(--cream-deep)', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lav-400)', animation: 'pulse-glow 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s`, display: 'block' }}/>)}
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask about ${topic}…`}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid var(--ink-100)', borderRadius: 12, padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit', color: 'var(--ink-900)', background: 'var(--cream)', outline: 'none', lineHeight: 1.5, maxHeight: 100, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--lav-300)'}
              onBlur={e => e.target.style.borderColor = 'var(--ink-100)'}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, var(--lav-400), var(--peach-400))' : 'var(--ink-100)', color: input.trim() ? 'white' : 'var(--ink-400)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.2s', }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Generating Placeholder ────────────────────────────────────────────────────
function GeneratingPlaceholder({ mediaType }) {
  return (
    <div style={{ padding: '80px 48px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--peach-300)', borderTopColor: 'var(--peach-500)', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 20px' }}/>
      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 20 }}>Generating your {mediaType}…</h3>
      <p className="muted" style={{ fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>
        This takes a moment. While you wait, explore <strong>Immersive Text</strong>, <strong>Quizzes</strong>, and <strong>Test Knowledge</strong> — they're ready now.
      </p>
      <div style={{ display: 'inline-flex', gap: 6, padding: '8px 16px', background: 'var(--peach-50)', borderRadius: 999, fontSize: 12, color: 'var(--peach-500)', fontWeight: 600, border: '1px solid var(--peach-100)' }}>
        <span style={{ animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--peach-400)', alignSelf: 'center' }}/>
        AMI is working in the background
      </div>
    </div>
  )
}

// ── Learning Hub ──────────────────────────────────────────────────────────────
export default function LearningHub({ module, persona, onChangePersona, onAccountSettings, onLogout, onBack, dark, onToggleDark, user }) {
  const [tab, setTab] = useState('text')
  // Live module state — updates as background generation completes
  const [liveModule, setLiveModule] = useState(module)
  const [moduleStatus, setModuleStatus] = useState(module?.status || 'complete')

  // Poll for module status every 5s until complete
  useEffect(() => {
    if (!module?.id) return
    if (moduleStatus === 'complete' || moduleStatus === 'error') return

    const interval = setInterval(async () => {
      try {
        const data = await api.getModuleStatus(module.id)
        setModuleStatus(data.status)
        if (data.status === 'complete') {
          // Merge completed data into liveModule
          setLiveModule(prev => ({
            ...prev,
            status: 'complete',
            slides: data.slides || prev?.slides || [],
            mindmap: data.mindmap || prev?.mindmap || [],
            audio: data.audio || prev?.audio || { title: '', script: '', chapters: [] }
          }))
          clearInterval(interval)
        }
      } catch (e) {
        // Silently ignore poll errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [module?.id, moduleStatus])

  // Use real module data if available, fall back to mock content
  const c = (liveModule?.textContent) ? liveModule.textContent : PHOTO_CONTENT
  const moduleId = liveModule?.id || null
  const sourceExcerpt = liveModule?.source?.sourceExcerpt || ''

  const isGenerating = moduleStatus === 'generating'
  const hasSlides = liveModule?.slides?.length > 0
  const hasMindmap = liveModule?.mindmap?.length > 0

  return (
    <div style={{ paddingBottom: 64 }} className="fade-in">
      <TopBar persona={persona} onChangePersona={onChangePersona} onAccountSettings={onAccountSettings} onLogout={onLogout} dark={dark} onToggleDark={onToggleDark} user={user}/>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 16px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
        <button className="link-btn" onClick={onBack}><Ico.ArrowLeft/> All modules</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,40px)', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>{c.title}</h2>
          {isGenerating && (
            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', padding: '4px 12px', background: 'var(--peach-50)', borderRadius: 999, fontSize: 12, color: 'var(--peach-500)', fontWeight: 600, border: '1px solid var(--peach-100)', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--peach-400)', animation: 'pulse-glow 1.4s ease-in-out infinite', display: 'block' }}/>
              Generating media…
            </div>
          )}
        </div>
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>{c.subtitle}</p>
      </div>
      <div style={{ maxWidth: 1100, margin: '24px auto 0', background: 'var(--paper)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(45,30,15,0.04)', overflow: 'hidden' }}>
        <PillarTabs active={tab} onChange={setTab}/>
        <div key={tab} style={{ animation: 'slide-in-right 0.5s var(--ease-organic)' }}>
          {tab === 'source' && <SourcePillar source={liveModule?.source}/>}
          {tab === 'text' && <ImmersivePillar textContent={c} moduleId={moduleId}/>}
          {tab === 'slides' && (isGenerating || !hasSlides
            ? <GeneratingPlaceholder mediaType="Slides & Narration"/>
            : <SlidesPillar slides={liveModule.slides}/>
          )}
          {tab === 'audio' && (isGenerating
            ? <GeneratingPlaceholder mediaType="Audio Lesson"/>
            : <AudioPillar audioContent={liveModule?.audio}/>
          )}
          {tab === 'mind' && (isGenerating || !hasMindmap
            ? <GeneratingPlaceholder mediaType="Mindmap"/>
            : <MindmapPillar mindmap={liveModule.mindmap}/>
          )}
          {tab === 'test' && <TestKnowledgePillar topic={c.title} moduleId={moduleId} sourceExcerpt={sourceExcerpt}/>}
        </div>
      </div>

      {/* Floating chatbot — visible on all tabs */}
      <AIChatbot topic={c.title}/>
    </div>
  )
}
