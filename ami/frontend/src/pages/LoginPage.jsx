import { useState, useEffect, useRef } from 'react'
import { Ico } from '../components/ui/Icons.jsx'
import { Brand } from '../components/layout/TopBar.jsx'

// ── Animated eyeball that tracks mouse ───────────────────────────────────────
function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const r = ref.current.getBoundingClientRect()
    const dx = mouse.x - (r.left + r.width / 2)
    const dy = mouse.y - (r.top + r.height / 2)
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  })()
  return (
    <div ref={ref} style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'height 0.15s ease' }}>
      {!isBlinking && <div style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor, borderRadius: '50%', transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out' }}/>}
    </div>
  )
}

// ── Standalone pupil (no white) ───────────────────────────────────────────────
function Pupil({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const r = ref.current.getBoundingClientRect()
    const dx = mouse.x - (r.left + r.width / 2)
    const dy = mouse.y - (r.top + r.height / 2)
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  })()
  return (
    <div ref={ref} style={{ width: size, height: size, backgroundColor: pupilColor, borderRadius: '50%', transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out' }}/>
  )
}

// ── Animated characters panel ─────────────────────────────────────────────────
function CharactersPanel({ isTyping, showPassword, password }) {
  const [purpleBlink, setPurpleBlink] = useState(false)
  const [blackBlink, setBlackBlink] = useState(false)
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false)
  const [purplePeeking, setPurplePeeking] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const purpleRef = useRef(null); const blackRef = useRef(null)
  const yellowRef = useRef(null); const orangeRef = useRef(null)

  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h); return () => window.removeEventListener('mousemove', h)
  }, [])

  // Random blinking
  useEffect(() => {
    const schedule = (setFn) => {
      const t = setTimeout(() => { setFn(true); setTimeout(() => { setFn(false); schedule(setFn) }, 150) }, Math.random() * 4000 + 3000)
      return t
    }
    const t1 = schedule(setPurpleBlink); const t2 = schedule(setBlackBlink)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Look at each other when typing starts
  useEffect(() => {
    if (isTyping) { setLookingAtEachOther(true); const t = setTimeout(() => setLookingAtEachOther(false), 800); return () => clearTimeout(t) }
    else setLookingAtEachOther(false)
  }, [isTyping])

  // Purple peeks when password visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => { setPurplePeeking(true); setTimeout(() => setPurplePeeking(false), 800) }, Math.random() * 3000 + 2000)
      return () => clearTimeout(t)
    } else setPurplePeeking(false)
  }, [password, showPassword, purplePeeking])

  const calcPos = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2; const cy = r.top + r.height / 3
    return {
      faceX: Math.max(-15, Math.min(15, (mouse.x - cx) / 20)),
      faceY: Math.max(-10, Math.min(10, (mouse.y - cy) / 30)),
      bodySkew: Math.max(-6, Math.min(6, -(mouse.x - cx) / 120)),
    }
  }

  const pp = calcPos(purpleRef); const bp = calcPos(blackRef)
  const yp = calcPos(yellowRef); const op = calcPos(orangeRef)
  const hidingPassword = isTyping || (password.length > 0 && !showPassword)

  return (
    <div style={{ position: 'relative', width: 550, height: 400 }}>
      {/* Purple — back */}
      <div ref={purpleRef} style={{ position: 'absolute', bottom: 0, left: 70, width: 180, height: hidingPassword ? 440 : 400, backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1, transition: 'all 0.7s ease-in-out', transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : hidingPassword ? `skewX(${(pp.bodySkew || 0) - 12}deg) translateX(40px)` : `skewX(${pp.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', display: 'flex', gap: 32, left: (password.length > 0 && showPassword) ? 20 : lookingAtEachOther ? 55 : 45 + pp.faceX, top: (password.length > 0 && showPassword) ? 35 : lookingAtEachOther ? 65 : 40 + pp.faceY, transition: 'all 0.7s ease-in-out' }}>
          {[0,1].map(i => <EyeBall key={i} size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={purpleBlink} forceLookX={(password.length > 0 && showPassword) ? (purplePeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined} forceLookY={(password.length > 0 && showPassword) ? (purplePeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined}/>)}
        </div>
      </div>
      {/* Black — middle */}
      <div ref={blackRef} style={{ position: 'absolute', bottom: 0, left: 240, width: 120, height: 310, backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2, transition: 'all 0.7s ease-in-out', transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : lookingAtEachOther ? `skewX(${(bp.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)` : `skewX(${bp.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', display: 'flex', gap: 24, left: (password.length > 0 && showPassword) ? 10 : lookingAtEachOther ? 32 : 26 + bp.faceX, top: (password.length > 0 && showPassword) ? 28 : lookingAtEachOther ? 12 : 32 + bp.faceY, transition: 'all 0.7s ease-in-out' }}>
          {[0,1].map(i => <EyeBall key={i} size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={blackBlink} forceLookX={(password.length > 0 && showPassword) ? -4 : lookingAtEachOther ? 0 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : lookingAtEachOther ? -4 : undefined}/>)}
        </div>
      </div>
      {/* Orange — front left semicircle */}
      <div ref={orangeRef} style={{ position: 'absolute', bottom: 0, left: 0, width: 240, height: 200, backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', zIndex: 3, transition: 'all 0.7s ease-in-out', transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : `skewX(${op.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', display: 'flex', gap: 32, left: (password.length > 0 && showPassword) ? 50 : 82 + (op.faceX || 0), top: (password.length > 0 && showPassword) ? 85 : 90 + (op.faceY || 0), transition: 'all 0.2s ease-out' }}>
          {[0,1].map(i => <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined}/>)}
        </div>
      </div>
      {/* Yellow — front right */}
      <div ref={yellowRef} style={{ position: 'absolute', bottom: 0, left: 310, width: 140, height: 230, backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4, transition: 'all 0.7s ease-in-out', transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : `skewX(${yp.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', display: 'flex', gap: 24, left: (password.length > 0 && showPassword) ? 20 : 52 + (yp.faceX || 0), top: (password.length > 0 && showPassword) ? 35 : 40 + (yp.faceY || 0), transition: 'all 0.2s ease-out' }}>
          {[0,1].map(i => <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined}/>)}
        </div>
        <div style={{ position: 'absolute', width: 80, height: 4, background: '#2D2D2D', borderRadius: 999, left: (password.length > 0 && showPassword) ? 10 : 40 + (yp.faceX || 0), top: (password.length > 0 && showPassword) ? 88 : 88 + (yp.faceY || 0), transition: 'all 0.2s ease-out' }}/>
      </div>
    </div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage({ onLogin, onBack }) {
  // mode: 'choice' | 'returning' | 'new' | 'google-complete'
  const [mode, setMode] = useState('choice')
  const [showPassword, setShowPassword] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Returning user fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // New user fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [qualification, setQualification] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Google-complete fields (same as new but email pre-filled)
  const [googleEmail, setGoogleEmail] = useState('user@gmail.com')

  const qualifications = ['Middle School', 'High School', 'Undergraduate', 'Postgraduate', 'Professional', 'Lifelong Learner']

  const handleReturningLogin = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    if (email && password) {
      try {
        await onLogin({ email, password, isNew: false })
      } catch (err) {
        setError(err.message)
      }
    } else setError('Please enter your email and password.')
    setIsLoading(false)
  }

  const handleNewSignup = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    if (!firstName || !age || !qualification || !newEmail || !newPassword) { setError('Please fill in all fields.'); setIsLoading(false); return }
    try {
      await onLogin({ email: newEmail, password: newPassword, name: `${firstName} ${lastName}`.trim(), age: Number(age), qualification, isNew: true })
    } catch (err) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  const handleGoogleComplete = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    if (!firstName || !age || !qualification) { setError('Please fill in all fields.'); setIsLoading(false); return }
    try {
      await onLogin({ email: googleEmail, name: `${firstName} ${lastName}`.trim(), age: Number(age), qualification, isNew: true, googleAuth: true })
    } catch (err) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      // In production: trigger Google OAuth via backend
      const data = await onLogin({ googleAuth: true });
      if (data && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  const inputStyle = { width: '100%', height: 48, padding: '0 16px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--paper)', fontSize: 15, color: 'var(--ink-900)', outline: 'none', transition: 'border-color 0.2s ease', fontFamily: 'inherit' }
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6, display: 'block' }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="fade-in">
      {/* LEFT — characters panel */}
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, var(--peach-100) 0%, var(--cream-deep) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '25%', right: '25%', width: 256, height: 256, background: 'rgba(244,122,74,0.08)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '25%', left: '25%', width: 384, height: 384, background: 'rgba(244,122,74,0.04)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }}/>
        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(80,40,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(80,40,20,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }}/>

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--peach-500)', display: 'grid', placeItems: 'center' }}>
              <Ico.Sparkle style={{ color: 'white', width: 18, height: 18 }}/>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>AMI</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, border: '1px solid var(--ink-200)', color: 'var(--ink-500)' }}>EXPERIMENT</span>
          </div>
        </div>

        {/* Characters */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 420 }}>
          <CharactersPanel isTyping={isTyping} showPassword={showPassword} password={password}/>
        </div>

        {/* Footer links */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', gap: 24, fontSize: 13, color: 'var(--ink-500)' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--ink-900)'} onMouseLeave={e => e.target.style.color = 'var(--ink-500)'}>{l}</a>
          ))}
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'var(--cream)', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* ── MODE: CHOICE ── */}
          {mode === 'choice' && (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-500)', marginBottom: 32, cursor: 'pointer' }}>
                <Ico.ArrowLeft/> Back to AMI
              </button>
              <span className="eyebrow">Get started</span>
              <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', margin: '8px 0 6px' }}>Welcome to AMI</h1>
              <p className="muted" style={{ fontSize: 15, marginBottom: 40 }}>Your autonomous learning companion.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={handleGoogleLogin} style={{ width: '100%', height: 52, borderRadius: 'var(--r-md)', background: 'var(--paper)', border: '1.5px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--peach-300)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ink-100)'} disabled={isLoading}>
                  {/* Google SVG */}
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {isLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }}/>
                  <span style={{ fontSize: 13, color: 'var(--ink-300)', fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-100)' }}/>
                </div>

                <button className="pill pill-primary" style={{ width: '100%', height: 52, justifyContent: 'center', fontSize: 15 }} onClick={() => setMode('new')}>
                  <Ico.Plus/> Create account
                </button>
                <button className="pill pill-ghost" style={{ width: '100%', height: 52, justifyContent: 'center', fontSize: 15 }} onClick={() => setMode('returning')}>
                  Sign in to existing account
                </button>
              </div>
            </div>
          )}

          {/* ── MODE: RETURNING ── */}
          {mode === 'returning' && (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={() => setMode('choice')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-500)', marginBottom: 32, cursor: 'pointer' }}>
                <Ico.ArrowLeft/> Back
              </button>
              <span className="eyebrow">Welcome back</span>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Sign in</h1>
              <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>Enter your credentials to continue.</p>

              <form onSubmit={handleReturningLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} required
                    onFocus_={(e) => e.target.style.borderColor = 'var(--peach-300)'} onBlur_={(e) => e.target.style.borderColor = 'var(--ink-100)'}/>
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingRight: 48 }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-300)', cursor: 'pointer' }}>
                      {showPassword ? <Ico.Close style={{ width: 18, height: 18 }}/> : <Ico.Search style={{ width: 18, height: 18 }}/>}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a href="#" style={{ fontSize: 13, color: 'var(--peach-500)', fontWeight: 500, textDecoration: 'none' }}>Forgot password?</a>
                </div>
                {error && <div style={{ padding: '12px 16px', background: 'rgba(226,106,92,0.08)', border: '1px solid rgba(226,106,92,0.3)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--error)' }}>{error}</div>}
                <button type="submit" className="pill pill-primary" style={{ width: '100%', height: 52, justifyContent: 'center', fontSize: 15, marginTop: 4 }} disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <button onClick={handleGoogleLogin} style={{ width: '100%', height: 48, borderRadius: 'var(--r-md)', background: 'var(--paper)', border: '1.5px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--ink-700)', cursor: 'pointer', marginTop: 12 }} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-500)', marginTop: 24 }}>
                Don't have an account?{' '}
                <button onClick={() => setMode('new')} style={{ color: 'var(--peach-500)', fontWeight: 600, cursor: 'pointer' }}>Sign up</button>
              </p>
            </div>
          )}

          {/* ── MODE: NEW USER ── */}
          {mode === 'new' && (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={() => setMode('choice')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-500)', marginBottom: 28, cursor: 'pointer' }}>
                <Ico.ArrowLeft/> Back
              </button>
              <span className="eyebrow">Create account</span>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Tell us about yourself</h1>
              <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>AMI will personalize everything for you.</p>

              <form onSubmit={handleNewSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>First name</label><input style={inputStyle} placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required/></div>
                  <div><label style={labelStyle}>Last name</label><input style={inputStyle} placeholder="Liu" value={lastName} onChange={e => setLastName(e.target.value)}/></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Age</label>
                    <input style={inputStyle} type="number" min="8" max="100" placeholder="17" value={age} onChange={e => setAge(e.target.value)} required/>
                  </div>
                  <div>
                    <label style={labelStyle}>Qualification</label>
                    <select style={selectStyle} value={qualification} onChange={e => setQualification(e.target.value)} required>
                      <option value="">Select…</option>
                      {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" placeholder="you@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} required/></div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingRight: 48 }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-300)', cursor: 'pointer' }}>
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                {error && <div style={{ padding: '10px 14px', background: 'rgba(226,106,92,0.08)', border: '1px solid rgba(226,106,92,0.3)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--error)' }}>{error}</div>}
                <button type="submit" className="pill pill-primary" style={{ width: '100%', height: 52, justifyContent: 'center', fontSize: 15, marginTop: 4 }} disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-500)', marginTop: 20 }}>
                Already have an account?{' '}
                <button onClick={() => setMode('returning')} style={{ color: 'var(--peach-500)', fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
              </p>
            </div>
          )}

          {/* ── MODE: GOOGLE COMPLETE ── */}
          {mode === 'google-complete' && (
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <span className="eyebrow">One more step</span>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Complete your profile</h1>
              <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Signed in as <strong>{googleEmail}</strong>. Tell us a bit more so AMI can personalize your experience.</p>

              <form onSubmit={handleGoogleComplete} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>First name</label><input style={inputStyle} placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required/></div>
                  <div><label style={labelStyle}>Last name</label><input style={inputStyle} placeholder="Liu" value={lastName} onChange={e => setLastName(e.target.value)}/></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Age</label><input style={inputStyle} type="number" min="8" max="100" placeholder="17" value={age} onChange={e => setAge(e.target.value)} required/></div>
                  <div>
                    <label style={labelStyle}>Qualification</label>
                    <select style={selectStyle} value={qualification} onChange={e => setQualification(e.target.value)} required>
                      <option value="">Select…</option>
                      {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>
                {error && <div style={{ padding: '10px 14px', background: 'rgba(226,106,92,0.08)', border: '1px solid rgba(226,106,92,0.3)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--error)' }}>{error}</div>}
                <button type="submit" className="pill pill-primary" style={{ width: '100%', height: 52, justifyContent: 'center', fontSize: 15, marginTop: 4 }} disabled={isLoading}>
                  {isLoading ? 'Saving…' : 'Start learning'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
