/* global React */
const { useState: useStateApp, useEffect: useEffectApp } = React;

// ============================================
// Personalization modal
// ============================================
function PersonaModal({ persona, onSave, onClose }) {
  const [draft, setDraft] = useStateApp(persona);
  const grades = ['Middle schooler', 'High schooler', 'College freshman', 'Lifelong learner'];
  const interests = [
    { label: 'cycling', icon: <Ico.Bike/> },
    { label: 'music', icon: <Ico.Music/> },
    { label: 'soccer', icon: <Ico.Soccer/> },
    { label: 'photography', icon: <Ico.Camera/> },
  ];
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Ico.Close/></button>
        <span className="eyebrow">Personalization</span>
        <h2 className="h2" style={{ marginBottom: 8 }}>How should AMI explain things?</h2>
        <p className="muted" style={{ fontSize: 14, marginTop: 0, marginBottom: 24 }}>
          We tailor analogies, examples, and reading level to you. Change anytime.
        </p>

        <div className="modal-section">
          <div className="modal-label">Reading level</div>
          <div className="modal-pills">
            {grades.map(g => (
              <button key={g} className={`modal-pill ${draft.grade === g ? 'active' : ''}`} onClick={() => setDraft({ ...draft, grade: g })}>{g}</button>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-label">Interest <span className="muted" style={{ fontWeight: 400 }}>· used for examples & analogies</span></div>
          <div className="modal-pills">
            {interests.map(i => (
              <button key={i.label} className={`modal-pill ${draft.interest === i.label ? 'active' : ''}`} onClick={() => setDraft({ ...draft, interest: i.label, iconNode: i.icon })}>
                <span style={{ display: 'inline-flex', color: 'var(--peach-500)' }}>{i.icon}</span>
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="pill pill-ghost" onClick={onClose}>Cancel</button>
          <button className="pill pill-primary" onClick={() => onSave(draft)}><Ico.Check/> Save</button>
        </div>
      </div>

      <style>{`
        .modal-bg {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(26,26,26,0.4);
          backdrop-filter: blur(6px);
          display: grid; place-items: center;
          padding: 24px;
          animation: fade-in 0.25s ease;
        }
        .modal {
          width: min(560px, 100%);
          background: var(--paper);
          border-radius: var(--r-xl);
          padding: 32px;
          box-shadow: var(--shadow-lg);
          position: relative;
          animation: fade-up 0.4s var(--ease-organic);
        }
        .modal-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--cream-deep);
          color: var(--ink-700);
          display: grid; place-items: center;
        }
        .modal-section { margin-bottom: 20px; }
        .modal-label { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .modal-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .modal-pill {
          padding: 10px 16px;
          border-radius: var(--r-pill);
          background: var(--cream-deep);
          font-size: 13px; font-weight: 500;
          color: var(--ink-700);
          border: 1.5px solid transparent;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.25s var(--ease-organic);
        }
        .modal-pill:hover { background: var(--peach-50); }
        .modal-pill.active { background: var(--peach-50); border-color: var(--peach-300); color: var(--ink-900); }
      `}</style>
    </div>
  );
}

// ============================================
// App root
// ============================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "wave_intensity": 1.0,
  "dark_mode": false,
  "grade": "High schooler",
  "interest": "music"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateApp('landing'); // landing | dashboard | upload | loading | hub
  const [topic, setTopic] = useStateApp('Photosynthesis');
  const [fromUpload, setFromUpload] = useStateApp(false);
  const [showPersona, setShowPersona] = useStateApp(false);
  const [uploadCtx, setUploadCtx] = useStateApp(null); // { files, deadlines, planner }

  const interestIcon = {
    cycling: <Ico.Bike/>, music: <Ico.Music/>,
    soccer: <Ico.Soccer/>, photography: <Ico.Camera/>,
  };

  const persona = {
    grade: tweaks.grade,
    interest: tweaks.interest,
    iconNode: interestIcon[tweaks.interest] || <Ico.Music/>,
  };

  const onPersonaChange = (p) => {
    if (p.grade) setTweak('grade', p.grade);
    if (p.interest) setTweak('interest', p.interest);
    setShowPersona(false);
  };

  // Apply theme
  useEffectApp(() => {
    document.documentElement.setAttribute('data-theme', tweaks.dark_mode ? 'dark' : 'light');
  }, [tweaks.dark_mode]);

  const dark = tweaks.dark_mode;
  const onToggleDark = () => setTweak('dark_mode', !dark);

  return (
    <>
      {route === 'landing' && (
        <LandingPage
          intensity={tweaks.wave_intensity}
          onStart={(q) => {
            if (q && typeof q === 'string') {
              setTopic(q);
              setFromUpload(false);
              setRoute('loading');
            } else {
              setRoute('dashboard');
            }
          }}
          onUpload={() => setRoute('upload')}
        />
      )}
      {route === 'dashboard' && (
        <DashboardPage
          persona={persona}
          onPersonaChange={() => setShowPersona(true)}
          onSearch={(q) => { setTopic(q); setFromUpload(false); setRoute('loading'); }}
          onUpload={() => setRoute('upload')}
          onResume={(item) => { setTopic(item.title); setFromUpload(false); setRoute('hub'); }}
          onLand={() => setRoute('landing')}
          dark={dark} onToggleDark={onToggleDark}
        />
      )}
      {route === 'upload' && (
        <UploadPage
          persona={persona}
          onPersonaChange={() => setShowPersona(true)}
          onSubmit={(payload) => {
            setTopic(payload.title || 'My module');
            setFromUpload(true);
            setUploadCtx(payload);
            setRoute('loading');
          }}
          onBack={() => setRoute('dashboard')}
          dark={dark} onToggleDark={onToggleDark}
        />
      )}
      {route === 'loading' && (
        <LoadingPage topic={topic} fromUpload={fromUpload} onDone={() => setRoute('hub')}/>
      )}
      {route === 'hub' && (
        <LearningHub
          persona={persona}
          onPersonaChange={() => setShowPersona(true)}
          onBack={() => setRoute('dashboard')}
          dark={dark} onToggleDark={onToggleDark}
          plan={uploadCtx?.plan}
          deadlines={uploadCtx?.deadlines}
        />
      )}
      {showPersona && <PersonaModal persona={persona} onSave={onPersonaChange} onClose={() => setShowPersona(false)}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakToggle label="Dark mode" value={tweaks.dark_mode} onChange={(v) => setTweak('dark_mode', v)}/>
          <TweakSlider label="Landing wave intensity" value={tweaks.wave_intensity} onChange={(v) => setTweak('wave_intensity', v)} min={0} max={2} step={0.1}/>
        </TweakSection>
        <TweakSection title="Personalization">
          <TweakRadio label="Reading level" value={tweaks.grade} onChange={(v) => setTweak('grade', v)} options={[
            { value: 'Middle schooler', label: 'Middle' },
            { value: 'High schooler', label: 'High' },
            { value: 'College freshman', label: 'College' },
            { value: 'Lifelong learner', label: 'Adult' },
          ]}/>
          <TweakRadio label="Interest" value={tweaks.interest} onChange={(v) => setTweak('interest', v)} options={[
            { value: 'cycling', label: 'Cycling' },
            { value: 'music', label: 'Music' },
            { value: 'soccer', label: 'Soccer' },
            { value: 'photography', label: 'Photo' },
          ]}/>
        </TweakSection>
        <TweakSection title="Navigate">
          <TweakButton onClick={() => setRoute('landing')}>→ Landing</TweakButton>
          <TweakButton onClick={() => setRoute('dashboard')}>→ Dashboard</TweakButton>
          <TweakButton onClick={() => setRoute('upload')}>→ Upload</TweakButton>
          <TweakButton onClick={() => setRoute('loading')}>→ Loading</TweakButton>
          <TweakButton onClick={() => setRoute('hub')}>→ Learning Hub</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
