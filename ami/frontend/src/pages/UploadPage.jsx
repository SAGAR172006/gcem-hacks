import { useState, useRef } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { TopBar } from '../components/layout/TopBar.jsx'

export default function UploadPage({ persona, onPersonaChange, onSubmit, onBack, dark, onToggleDark }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const submit = () => {
    if (!file) return
    onSubmit({ title: file.name.replace(/\.[^.]+$/, ''), files: [file] })
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 64 }}>
      <TopBar persona={persona} onChangePersona={onPersonaChange} dark={dark} onToggleDark={onToggleDark}/>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px' }}>
        <button className="link-btn" onClick={onBack} style={{ marginBottom: 24 }}><Ico.ArrowLeft/> Back to dashboard</button>
        <span className="eyebrow">Quick Learning</span>
        <h1 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '8px 0 8px' }}>Upload your material</h1>
        <p className="muted" style={{ fontSize: 16, marginBottom: 32 }}>Upload a PDF or image and AMI will generate a full learning module from it — scoped entirely to your file.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'var(--peach-400)' : file ? 'var(--success)' : 'var(--ink-200)'}`, borderRadius: 'var(--r-xl)', padding: '48px 32px', textAlign: 'center', cursor: file ? 'default' : 'pointer', background: dragging ? 'var(--peach-50)' : file ? 'rgba(79,176,122,0.06)' : 'var(--paper)', transition: 'all 0.3s var(--ease-organic)' }}>
          <input ref={inputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])}/>
          {file ? (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(79,176,122,0.15)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: 'var(--success)' }}>
                <Ico.Check style={{ width: 28, height: 28 }}/>
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>{file.name}</p>
              <p className="muted" style={{ fontSize: 14, margin: '0 0 24px' }}>{(file.size / 1024).toFixed(1)} KB</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="pill pill-ghost" onClick={(e) => { e.stopPropagation(); setFile(null) }}>Change file</button>
                <button className="pill pill-primary" onClick={(e) => { e.stopPropagation(); submit() }}><Ico.Sparkle/> Generate module</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--cream-deep)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: 'var(--ink-500)' }}>
                <Ico.Upload style={{ width: 28, height: 28 }}/>
              </div>
              <p style={{ fontWeight: 600, fontSize: 18, margin: '0 0 8px' }}>Drop your file here</p>
              <p className="muted" style={{ fontSize: 14, margin: '0 0 24px' }}>Supports PDF and images · max 10 pages</p>
              <button className="pill pill-ghost" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>Browse files</button>
            </>
          )}
        </div>

        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--lav-50)', borderRadius: 'var(--r-md)', border: '1px solid var(--lav-100)', fontSize: 14, color: 'var(--ink-700)' }}>
          <strong style={{ color: 'var(--lav-500)' }}>How it works:</strong> AMI reads your file and generates a fully personalized learning module scoped strictly to the uploaded content — no internet search, just your material.
        </div>
      </div>
    </div>
  )
}
