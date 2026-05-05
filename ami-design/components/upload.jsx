/* global React */
const { useState: useStateUL, useRef: useRefUL, useEffect: useEffectUL, useMemo: useMemoUL } = React;

// ============================================
// Quick Learning v2 — multi-file + planner options
// ============================================
//
// Flow:
//   1. User uploads PDFs, images, or both (drag/drop or click).
//   2. User configures planner: deadline, daily effort, "stick to source" toggle,
//      objectives chips, exclude topics.
//   3. AMI generates a learning plan tied to the uploaded source.
//   4. Submit → loading screen → Hub (Roadmap pillar focused).
// ============================================

function UploadPage({ persona, onPersonaChange, onSubmit, onBack, dark, onToggleDark }) {
  const [files, setFiles] = useStateUL([]);
  const [dragOver, setDragOver] = useStateUL(false);
  const inputRef = useRefUL(null);

  // Planner state
  const [deadline, setDeadline] = useStateUL(''); // YYYY-MM-DD
  const [dailyMin, setDailyMin] = useStateUL(20);
  const [stickToSource, setStickToSource] = useStateUL(true);
  const [objectives, setObjectives] = useStateUL([]);
  const [exclude, setExclude] = useStateUL('');
  const [depth, setDepth] = useStateUL('balanced'); // overview | balanced | deep
  const [showPlanner, setShowPlanner] = useStateUL(false);

  // Helpers
  const addFiles = (list) => {
    if (!list || !list.length) return;
    const incoming = Array.from(list).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      kind: f.type?.startsWith('image/') ? 'image' : 'pdf',
      sizeKb: Math.max(1, Math.round((f.size || 0) / 1024)),
    }));
    setFiles(prev => [...prev, ...incoming]);
  };
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  // Suggested objective chips
  const SUGGESTED = ['Pass an exam', 'Build intuition', 'Memorize key facts', 'Apply to project', 'Teach someone else'];
  const toggleObjective = (o) => setObjectives(prev =>
    prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]
  );

  // Auto-show planner once a file lands
  useEffectUL(() => { if (files.length && !showPlanner) setShowPlanner(true); }, [files.length]);

  // Compute a friendly relative-deadline label
  const deadlineLabel = useMemoUL(() => {
    if (!deadline) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(deadline + 'T00:00:00');
    const diff = Math.round((target - today) / 86400000);
    if (diff < 0) return 'In the past';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `In ${diff} days`;
    if (diff < 30) return `In ${Math.round(diff/7)} weeks`;
    return `In ~${Math.round(diff/30)} months`;
  }, [deadline]);

  const canSubmit = files.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      files,
      title: deriveTitle(files),
      deadlines: deadline ? { due: deadlineLabel, dueDate: deadline, dailyMin } : null,
      planner: {
        stickToSource,
        objectives,
        exclude: exclude.trim(),
        depth,
        dailyMin,
      },
    });
  };

  // Default min date = today
  const todayISO = useMemoUL(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }, []);

  return (
    <div className="upload-page fade-in">
      <TopBar persona={persona} onChangePersona={onPersonaChange} dark={dark} onToggleDark={onToggleDark}/>

      <div className="upload-wrap">
        <div className="upload-head">
          <span className="eyebrow">Quick learning</span>
          <h2 className="upload-h1">Bring your own source.</h2>
          <p className="body" style={{ maxWidth: 560, margin: '0 auto' }}>
            Upload PDFs and images. Tell AMI when you need to know it. We'll build a focused learning plan — no internet, just your source.
          </p>
        </div>

        {/* DROPZONE */}
        <div
          className={`dropzone ${dragOver ? 'over' : ''} ${files.length ? 'has-files' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            hidden
            onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
          />

          {files.length === 0 ? (
            <>
              <div className="dz-art">
                <div className="dz-doc dz-doc-1"><Ico.Pdf/></div>
                <div className="dz-doc dz-doc-2"><Ico.Pdf/></div>
                <div className="dz-doc dz-doc-3"><Ico.Image/></div>
                <div className="dz-orbit"></div>
              </div>
              <h3 className="h3">Drop PDFs or images here</h3>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                or <span style={{ color: 'var(--peach-500)', fontWeight: 600 }}>browse</span> · combine multiple files into one module
              </p>
            </>
          ) : (
            <div className="file-grid" onClick={(e) => e.stopPropagation()}>
              {files.map(f => (
                <div key={f.id} className={`file-tile file-tile--${f.kind}`}>
                  <span className="file-tile-icon">{f.kind === 'image' ? <Ico.Image/> : <Ico.Pdf/>}</span>
                  <div className="file-tile-meta">
                    <div className="file-tile-name" title={f.name}>{f.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{f.kind === 'image' ? 'Image' : 'PDF'} · {f.sizeKb} KB</div>
                  </div>
                  <button className="icon-btn icon-btn--sm" onClick={() => removeFile(f.id)} aria-label="Remove">
                    <Ico.Trash/>
                  </button>
                </div>
              ))}
              <button
                className="file-add"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                <Ico.Plus/>
                <span>Add more</span>
              </button>
            </div>
          )}
        </div>

        {/* PLANNER */}
        {showPlanner && (
          <div className="planner fade-in" data-screen-label="Quick Learning · Planner">
            <div className="planner-head">
              <span className="eyebrow" style={{ color: 'var(--peach-500)' }}>Tell AMI how to teach you</span>
              <h3 className="planner-h">Optional — skip and we'll pick sensible defaults</h3>
            </div>

            <div className="planner-grid">
              {/* Deadline */}
              <div className="planner-card">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Calendar/></span>
                  <h4>Deadline</h4>
                </div>
                <p className="planner-card-desc">When do you need to know this?</p>
                <input
                  type="date"
                  className="planner-input"
                  value={deadline}
                  min={todayISO}
                  onChange={e => setDeadline(e.target.value)}
                />
                {deadlineLabel && <span className="planner-tag">{deadlineLabel}</span>}
                <div className="planner-presets">
                  {[
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 3 days', days: 3 },
                    { label: 'Next week', days: 7 },
                    { label: 'In a month', days: 30 },
                  ].map(p => (
                    <button key={p.label} type="button" className="preset-chip" onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + p.days);
                      setDeadline(d.toISOString().slice(0,10));
                    }}>{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Daily effort */}
              <div className="planner-card">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Clock/></span>
                  <h4>Daily effort</h4>
                </div>
                <p className="planner-card-desc">How long can you study each day?</p>
                <div className="effort-row">
                  <input
                    type="range"
                    min="5" max="120" step="5"
                    value={dailyMin}
                    onChange={e => setDailyMin(+e.target.value)}
                    className="planner-slider"
                  />
                  <span className="effort-readout"><strong>{dailyMin}</strong> min/day</span>
                </div>
                <span className="planner-hint">≈ {Math.max(1, Math.round((files.length * 30) / dailyMin))} sessions to finish</span>
              </div>

              {/* Stick to source */}
              <div className="planner-card">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Target/></span>
                  <h4>Stick to source</h4>
                </div>
                <p className="planner-card-desc">Should AMI stay strictly inside what you uploaded?</p>
                <div className="seg seg-2">
                  <button
                    className={`seg-opt ${stickToSource ? 'on' : ''}`}
                    onClick={() => setStickToSource(true)}
                  >
                    <strong>Strict</strong>
                    <em>Source only — no outside context</em>
                  </button>
                  <button
                    className={`seg-opt ${!stickToSource ? 'on' : ''}`}
                    onClick={() => setStickToSource(false)}
                  >
                    <strong>Augmented</strong>
                    <em>Add background to fill gaps</em>
                  </button>
                </div>
              </div>

              {/* Depth */}
              <div className="planner-card">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Sparkle/></span>
                  <h4>Depth</h4>
                </div>
                <p className="planner-card-desc">How deep should we go?</p>
                <div className="seg">
                  {[
                    { id: 'overview', label: 'Overview', meta: 'Big ideas only' },
                    { id: 'balanced', label: 'Balanced', meta: 'Recommended' },
                    { id: 'deep', label: 'Deep dive', meta: 'Every detail' },
                  ].map(o => (
                    <button
                      key={o.id}
                      className={`seg-opt ${depth === o.id ? 'on' : ''}`}
                      onClick={() => setDepth(o.id)}
                    >
                      <strong>{o.label}</strong>
                      <em>{o.meta}</em>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objectives — full width */}
              <div className="planner-card planner-card--wide">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Heart/></span>
                  <h4>Why are you learning this?</h4>
                </div>
                <p className="planner-card-desc">Pick anything that fits — AMI weights examples accordingly.</p>
                <div className="chip-row">
                  {SUGGESTED.map(o => (
                    <button
                      key={o}
                      type="button"
                      className={`obj-chip ${objectives.includes(o) ? 'on' : ''}`}
                      onClick={() => toggleObjective(o)}
                    >
                      {objectives.includes(o) && <Ico.Check/>}
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exclude topics — full width */}
              <div className="planner-card planner-card--wide">
                <div className="planner-card-head">
                  <span className="planner-card-icon"><Ico.Close/></span>
                  <h4>Skip these topics</h4>
                </div>
                <p className="planner-card-desc">Comma-separated. AMI will quietly route around them.</p>
                <input
                  type="text"
                  className="planner-input planner-input--wide"
                  placeholder="e.g. derivations, historical asides"
                  value={exclude}
                  onChange={e => setExclude(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* CALLOUT */}
        <div className="warn-card">
          <span className="warn-dot"/>
          <div>
            <strong>How AMI uses your files: </strong>
            We'll extract text and figures from your PDFs and images, then build a roadmap, immersive text, slides, audio, and a mindmap. Nothing leaves your session.
          </div>
        </div>

        {/* ACTIONS */}
        <div className="upload-actions">
          <button className="pill pill-ghost" onClick={onBack}><Ico.ArrowLeft/> Back</button>
          <button
            className="pill pill-primary"
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
            onClick={submit}
          >
            <Ico.Sparkle/> Generate learning plan
            <span className="pill-arrow"><Ico.ArrowRight/></span>
          </button>
        </div>
      </div>

      <style>{`
        .upload-page { padding-bottom: 80px; }
        .upload-wrap {
          max-width: 880px;
          margin: 24px auto 0;
          padding: 0 24px;
          display: flex; flex-direction: column; gap: 24px;
          align-items: center;
        }
        .upload-head { text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .upload-h1 {
          font-size: clamp(34px, 4.4vw, 48px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0;
        }

        /* ===== Dropzone ===== */
        .dropzone {
          width: 100%;
          background: var(--paper);
          border: 2px dashed var(--ink-100);
          border-radius: var(--r-xl);
          padding: 44px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.4s var(--ease-organic);
          box-shadow: var(--shadow-sm);
        }
        .dropzone:hover, .dropzone.over {
          border-color: var(--peach-300);
          background: var(--peach-50);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .dropzone.has-files { border-style: solid; border-color: var(--peach-200); padding: 24px; cursor: default; }
        .dropzone.has-files:hover { transform: none; }

        .dz-art { position: relative; width: 140px; height: 100px; margin-bottom: 8px; }
        .dz-doc {
          position: absolute;
          width: 60px; height: 76px;
          border-radius: 10px;
          background: var(--paper);
          border: 1.5px solid var(--ink-100);
          display: grid; place-items: center;
          color: var(--peach-500);
          box-shadow: var(--shadow-sm);
        }
        .dz-doc-1 { left: 10px; top: 12px; transform: rotate(-12deg); animation: doc-1 4s ease-in-out infinite; }
        .dz-doc-2 { left: 40px; top: 4px; z-index: 2; animation: doc-2 4s ease-in-out infinite; }
        .dz-doc-3 { left: 70px; top: 16px; transform: rotate(10deg); animation: doc-3 4s ease-in-out infinite; }
        @keyframes doc-1 { 0%,100% { transform: rotate(-12deg) translateY(0); } 50% { transform: rotate(-14deg) translateY(-4px); } }
        @keyframes doc-2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes doc-3 { 0%,100% { transform: rotate(10deg) translateY(0); } 50% { transform: rotate(12deg) translateY(-4px); } }
        .dz-orbit {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 1.5px dashed var(--lav-200);
          animation: spin-slow 20s linear infinite;
          opacity: 0.6;
        }

        /* ===== File grid ===== */
        .file-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .file-tile {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: var(--paper);
          border: 1px solid var(--ink-100);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          min-width: 0;
        }
        .file-tile-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: var(--peach-50);
          color: var(--peach-500);
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .file-tile--image .file-tile-icon { background: rgba(140, 138, 214, 0.12); color: var(--lav-500); }
        .file-tile-meta { min-width: 0; flex: 1; }
        .file-tile-name {
          font-weight: 600; font-size: 13px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .icon-btn--sm { width: 28px; height: 28px; }
        .file-add {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 14px;
          background: transparent;
          border: 1.5px dashed var(--ink-100);
          border-radius: 12px;
          font: inherit; font-size: 13px; font-weight: 500;
          color: var(--ink-500);
          cursor: pointer;
          transition: all 0.2s var(--ease-organic);
        }
        .file-add:hover { border-color: var(--peach-300); color: var(--peach-500); background: var(--peach-50); }

        /* ===== Planner ===== */
        .planner {
          width: 100%;
          background: var(--paper);
          border: 1px solid var(--ink-100);
          border-radius: var(--r-xl);
          padding: 28px;
          box-shadow: var(--shadow-sm);
        }
        .planner-head { text-align: center; margin-bottom: 22px; }
        .planner-h {
          font-size: 22px; font-weight: 700;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
        }
        .planner-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .planner-card {
          background: var(--cream-deep);
          border-radius: 14px;
          padding: 18px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .planner-card--wide { grid-column: span 2; }
        .planner-card-head { display: flex; align-items: center; gap: 10px; }
        .planner-card-head h4 {
          font-size: 14px; font-weight: 700; margin: 0;
          letter-spacing: -0.01em;
        }
        .planner-card-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: var(--paper);
          color: var(--peach-500);
          display: grid; place-items: center;
          box-shadow: var(--shadow-sm);
        }
        .planner-card-desc { font-size: 12.5px; color: var(--ink-500); margin: 0; line-height: 1.45; }

        .planner-input {
          font: inherit; font-size: 14px;
          padding: 10px 12px;
          background: var(--paper);
          border: 1px solid var(--ink-100);
          border-radius: 10px;
          color: var(--ink-900);
          outline: none;
          transition: all 0.2s ease;
          width: fit-content;
        }
        .planner-input--wide { width: 100%; }
        .planner-input:focus { border-color: var(--peach-300); box-shadow: 0 0 0 3px rgba(244,122,74,0.12); }

        .planner-tag {
          display: inline-flex; width: fit-content;
          padding: 4px 10px;
          background: var(--peach-50);
          color: var(--peach-500);
          border-radius: 999px;
          font-size: 12px; font-weight: 600;
        }
        .planner-presets { display: flex; gap: 6px; flex-wrap: wrap; }
        .preset-chip {
          font: inherit; font-size: 11.5px; font-weight: 500;
          padding: 5px 10px;
          background: var(--paper);
          border: 1px solid var(--ink-100);
          border-radius: 999px;
          cursor: pointer;
          color: var(--ink-700);
          transition: all 0.15s ease;
        }
        .preset-chip:hover { border-color: var(--peach-300); color: var(--peach-500); }
        .planner-hint { font-size: 11.5px; color: var(--ink-500); }

        .effort-row { display: flex; align-items: center; gap: 14px; }
        .planner-slider {
          flex: 1;
          accent-color: var(--peach-500);
          height: 4px;
        }
        .effort-readout {
          font-size: 13px; color: var(--ink-700);
          background: var(--paper);
          padding: 4px 10px;
          border-radius: 8px;
          min-width: 90px; text-align: center;
        }
        .effort-readout strong { color: var(--peach-500); font-weight: 700; }

        .seg {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          background: var(--paper);
          padding: 4px;
          border-radius: 12px;
        }
        .seg-2 { grid-template-columns: repeat(2, 1fr); }
        .seg-opt {
          padding: 10px 12px;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 9px;
          font: inherit;
          color: var(--ink-700);
          text-align: left;
          cursor: pointer;
          display: flex; flex-direction: column; gap: 2px;
          transition: all 0.2s var(--ease-organic);
        }
        .seg-opt:hover { background: var(--cream-deep); }
        .seg-opt.on {
          background: var(--peach-50);
          border-color: var(--peach-300);
          color: var(--ink-900);
        }
        .seg-opt strong { font-size: 13px; font-weight: 700; }
        .seg-opt em { font-size: 11.5px; color: var(--ink-500); font-style: normal; }

        .chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .obj-chip {
          font: inherit; font-size: 13px;
          padding: 7px 12px;
          background: var(--paper);
          border: 1.5px solid var(--ink-100);
          border-radius: 999px;
          cursor: pointer;
          color: var(--ink-700);
          transition: all 0.18s var(--ease-organic);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .obj-chip:hover { border-color: var(--peach-300); }
        .obj-chip.on {
          background: var(--peach-500);
          color: white;
          border-color: var(--peach-500);
        }
        .obj-chip svg { width: 12px; height: 12px; }

        .warn-card {
          display: flex; gap: 12px; align-items: flex-start;
          background: var(--lav-50);
          border-radius: var(--r-md);
          padding: 14px 16px;
          font-size: 13.5px;
          color: var(--ink-700);
          line-height: 1.5;
          border: 1px solid var(--lav-100);
          max-width: 720px;
          width: 100%;
        }
        .warn-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--lav-400);
          margin-top: 7px;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(140, 138, 214, 0.2);
        }

        .upload-actions {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
          width: 100%;
        }
        .pill-arrow { display: inline-flex; margin-left: 4px; transition: transform 0.3s var(--ease-spring); }
        .pill-primary:not(:disabled):hover .pill-arrow { transform: translateX(3px); }

        @media (max-width: 720px) {
          .planner-grid { grid-template-columns: 1fr; }
          .planner-card--wide { grid-column: span 1; }
          .seg { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function deriveTitle(files) {
  if (!files.length) return 'My module';
  const first = files[0].name.replace(/\.[^.]+$/, '');
  if (files.length === 1) return first;
  return `${first} (+${files.length - 1} more)`;
}

Object.assign(window, { UploadPage });
