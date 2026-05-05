/* global React */
const { useState: useStateHub, useEffect: useEffectHub, useRef: useRefHub, useMemo: useMemoHub } = React;

// ============================================
// Tab bar (top of Learning Hub card)
// ============================================
const PILLARS = [
  { id: 'roadmap', label: 'Roadmap', icon: 'Target', color: 'var(--peach-500)' },
  { id: 'source', label: 'Source', icon: 'Pdf', color: 'var(--ink-700)' },
  { id: 'text', label: 'Immersive Text', icon: 'Book', color: 'var(--peach-500)' },
  { id: 'slides', label: 'Slides & Narration', icon: 'Slides', color: 'var(--lav-500)' },
  { id: 'audio', label: 'Audio Lesson', icon: 'Audio', color: 'var(--success)' },
  { id: 'mind', label: 'Mindmap', icon: 'Mind', color: 'var(--info)' },
];

function PillarTabs({ active, onChange }) {
  return (
    <div className="ptabs">
      {PILLARS.map(p => {
        const Icon = Ico[p.icon];
        const isActive = active === p.id;
        return (
          <button key={p.id} className={`ptab ${isActive ? 'active' : ''}`} onClick={() => onChange(p.id)} style={{ '--c': p.color }}>
            <span className="ptab-icon" style={{ color: p.color }}><Icon/></span>
            <span className="ptab-label">{p.label}</span>
          </button>
        );
      })}
      <style>{`
        .ptabs {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--ink-100);
        }
        .ptab {
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          padding: 10px 12px;
          border-radius: var(--r-pill);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink-500);
          border: 1.5px solid transparent;
          transition: all 0.4s var(--ease-organic);
          background: transparent;
        }
        .ptab:hover { color: var(--ink-700); background: var(--cream-deep); }
        .ptab.active {
          color: var(--ink-900);
          border-color: var(--c);
          background: var(--paper);
          font-weight: 600;
        }
        .ptab-icon {
          width: 32px; height: 32px;
          display: grid; place-items: center;
          background: var(--cream-deep);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .ptab.active .ptab-icon { background: color-mix(in srgb, var(--c) 14%, transparent); }
        .ptab-icon svg { width: 18px; height: 18px; }
      `}</style>
    </div>
  );
}

// ============================================
// PILLAR 1 — Source
// ============================================
function SourcePillar() {
  const c = window.PHOTO_CONTENT;
  return (
    <div className="pillar-pad">
      <div className="source-meta">
        <span className="subject-chip"><Ico.Pdf/> Source PDF</span>
        <span className="muted" style={{ fontSize: 13 }}>{c.source.title}</span>
      </div>
      <h2 className="h2" style={{ marginTop: 16 }}>{c.title}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: 4, marginBottom: 24 }}>Raw text gathered from the source — before AMI restructured it.</p>
      <pre className="source-body">{c.source.excerpt}</pre>
      <style>{`
        .pillar-pad { padding: 32px 48px 48px; max-width: 820px; margin: 0 auto; }
        .source-meta { display: flex; align-items: center; gap: 12px; }
        .source-body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.75;
          color: var(--ink-700);
          white-space: pre-wrap;
          word-wrap: break-word;
          background: var(--cream-deep);
          padding: 24px;
          border-radius: var(--r-md);
          border-left: 3px solid var(--peach-300);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

// ============================================
// PILLAR 2 — Immersive Text + inline quizzes
// ============================================
function InlineQuiz({ q }) {
  const [pick, setPick] = useStateHub(null);
  const [showHint, setShowHint] = useStateHub(false);
  const correct = q.choices.find(c => c.correct);
  return (
    <div className="iq">
      <div className="iq-q">
        <span className="iq-icon"><Ico.Hint/></span>
        <span dangerouslySetInnerHTML={{ __html: q.question.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
      </div>
      <div className="iq-choices">
        {q.choices.map(c => {
          const isPicked = pick === c.id;
          const state = pick == null ? '' : isPicked ? (c.correct ? 'right' : 'wrong') : (c.correct ? 'right' : '');
          return (
            <button key={c.id} className={`iq-choice ${state}`} onClick={() => pick == null && setPick(c.id)} disabled={pick != null}>
              <span className="iq-letter">{c.id.toUpperCase()}</span>
              <span>{c.text}</span>
              {state === 'right' && <span className="iq-mark right"><Ico.Check/></span>}
              {state === 'wrong' && <span className="iq-mark wrong"><Ico.Close/></span>}
            </button>
          );
        })}
      </div>
      <div className="iq-actions">
        {pick == null ? (
          <>
            <button className="iq-link" onClick={() => setShowHint(s => !s)}><Ico.Hint/> {showHint ? 'Hide hint' : 'Show hint'}</button>
            <button className="iq-link iq-skip">Skip</button>
          </>
        ) : (
          <span className={`iq-feedback ${correct.id === pick ? 'good' : 'bad'}`}>
            {correct.id === pick ? '✓ Nice — that\u2019s right.' : `Not quite. The right answer is ${correct.id.toUpperCase()}.`}
          </span>
        )}
      </div>
      {showHint && <div className="iq-hint">{q.hint}</div>}
      <style>{`
        .iq {
          margin: 28px 0;
          padding: 22px;
          background: var(--lav-50);
          border-radius: var(--r-md);
          border: 1px solid var(--lav-100);
        }
        .iq-q {
          display: flex; gap: 10px; align-items: flex-start;
          font-size: 15px; font-weight: 600; color: var(--ink-900);
          margin-bottom: 14px; line-height: 1.45;
        }
        .iq-icon {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: var(--lav-200);
          color: var(--lav-500);
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .iq-choices { display: flex; flex-direction: column; gap: 8px; }
        .iq-choice {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          background: var(--paper);
          border: 1.5px solid transparent;
          border-radius: var(--r-pill);
          font-size: 14px;
          color: var(--ink-700);
          text-align: left;
          transition: all 0.3s var(--ease-organic);
          cursor: pointer;
        }
        .iq-choice:not(:disabled):hover { border-color: var(--peach-300); transform: translateX(2px); }
        .iq-choice:disabled { cursor: default; }
        .iq-letter {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--cream-deep); color: var(--ink-500);
          display: grid; place-items: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
        }
        .iq-choice.right { border-color: var(--success); background: rgba(79,176,122,0.08); color: var(--ink-900); }
        .iq-choice.right .iq-letter { background: var(--success); color: white; }
        .iq-choice.wrong { border-color: var(--error); background: rgba(226,106,92,0.08); color: var(--ink-900); }
        .iq-choice.wrong .iq-letter { background: var(--error); color: white; }
        .iq-mark { margin-left: auto; }
        .iq-mark.right { color: var(--success); }
        .iq-mark.wrong { color: var(--error); }
        .iq-actions {
          display: flex; gap: 16px; margin-top: 14px; align-items: center;
        }
        .iq-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--ink-500);
        }
        .iq-link:hover { color: var(--peach-500); }
        .iq-feedback { font-size: 13px; font-weight: 600; }
        .iq-feedback.good { color: var(--success); }
        .iq-feedback.bad { color: var(--error); }
        .iq-hint {
          margin-top: 12px;
          padding: 10px 14px;
          background: var(--paper);
          border-radius: var(--r-md);
          font-size: 13px;
          color: var(--ink-700);
          border-left: 3px solid var(--lav-300);
        }
      `}</style>
    </div>
  );
}

// Diagrams as small inline SVGs
function LeafCellDiagram() {
  return (
    <div className="diagram">
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id="leafG" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="#8FCB94"/>
            <stop offset="1" stopColor="#5BA85F"/>
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="100" rx="80" ry="60" fill="url(#leafG)" opacity="0.85"/>
        <ellipse cx="80" cy="90" rx="14" ry="20" fill="#3E7E42" opacity="0.8"/>
        <ellipse cx="120" cy="110" rx="14" ry="20" fill="#3E7E42" opacity="0.7"/>
        <ellipse cx="100" cy="80" rx="10" ry="14" fill="#7AAB7E" opacity="0.6"/>
        <text x="100" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Leaf cell</text>
        <text x="100" y="195" textAnchor="middle" fontSize="9" fill="#5A5A5A">chloroplasts in green</text>

        {/* Arrows */}
        <path d="M 200 100 Q 240 80 280 100" stroke="#FFB085" strokeWidth="2.5" fill="none" markerEnd="url(#arr)"/>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFB085"/>
          </marker>
        </defs>

        {/* Chloroplast zoom */}
        <ellipse cx="320" cy="100" rx="55" ry="40" fill="#7AAB7E" stroke="#3E7E42" strokeWidth="2"/>
        {[0,1,2,3].map(i => (
          <ellipse key={i} cx={300 + i*10} cy={90 + (i%2)*16} rx="6" ry="3" fill="#3E7E42"/>
        ))}
        <text x="320" y="180" textAnchor="middle" fontSize="11" fill="#2D2D2D" fontWeight="600">Chloroplast</text>
        <text x="320" y="195" textAnchor="middle" fontSize="9" fill="#5A5A5A">thylakoid stacks</text>
      </svg>
      <style>{`.diagram { background: var(--cream-deep); border-radius: var(--r-md); padding: 16px; margin: 16px 0; border: 1px solid var(--ink-100); }`}</style>
    </div>
  );
}

function CalvinDiagram() {
  return (
    <div className="diagram">
      <h4 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>The Calvin Cycle</h4>
      <svg viewBox="0 0 360 220" style={{ width: '100%', height: 'auto' }}>
        <circle cx="180" cy="110" r="68" fill="none" stroke="#FFB085" strokeWidth="2" strokeDasharray="4 4"/>

        {/* Phase nodes */}
        <g>
          <circle cx="180" cy="42" r="26" fill="#FFCBA4"/>
          <text x="180" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Fixation</text>
          <text x="180" y="52" textAnchor="middle" fontSize="8" fill="#5A5A5A">CO₂ + RuBP</text>
        </g>
        <g>
          <circle cx="248" cy="148" r="26" fill="#E6E6FA"/>
          <text x="248" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Reduction</text>
          <text x="248" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">ATP + NADPH</text>
        </g>
        <g>
          <circle cx="112" cy="148" r="26" fill="#A8D4A4"/>
          <text x="112" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Regen.</text>
          <text x="112" y="158" textAnchor="middle" fontSize="8" fill="#5A5A5A">RuBP rebuilt</text>
        </g>

        {/* CO2 in */}
        <text x="40" y="50" fontSize="11" fontWeight="700" fill="#5A5A5A">CO₂</text>
        <path d="M 60 48 Q 110 30 154 36" stroke="#5A5A5A" strokeWidth="1.5" fill="none" markerEnd="url(#arr2)"/>

        {/* Glucose out */}
        <text x="290" y="210" fontSize="11" fontWeight="700" fill="#3E7E42">G3P → glucose</text>
        <path d="M 240 170 Q 270 195 290 200" stroke="#3E7E42" strokeWidth="1.5" fill="none" markerEnd="url(#arr3)"/>

        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5A5A5A"/>
          </marker>
          <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3E7E42"/>
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function QuizBlock({ block }) {
  const [picks, setPicks] = useStateHub({});
  const [done, setDone] = useStateHub(false);
  const score = useMemoHub(() => {
    let s = 0;
    block.questions.forEach((q, i) => { if (picks[i] === q.correct) s++; });
    return s;
  }, [picks, block]);
  const answered = Object.keys(picks).length;

  return (
    <div className="qb">
      <div className="qb-head">
        <span className="qb-icon"><Ico.Sparkle/></span>
        <h3 className="h3">{block.title}</h3>
      </div>
      <div className="qb-prog">
        <div className="qb-prog-bar" style={{ width: `${(answered / block.questions.length) * 100}%` }}/>
        <span className="qb-prog-label">{answered} / {block.questions.length}</span>
      </div>
      {block.questions.map((q, qi) => (
        <div key={qi} className="qb-q">
          <div className="qb-q-text">Question {qi+1}: {q.q}</div>
          <div className="qb-choices">
            {q.choices.map((c, ci) => {
              const picked = picks[qi];
              const isPicked = picked === ci;
              const showState = done || picked != null;
              const state = !showState ? '' : isPicked ? (ci === q.correct ? 'right' : 'wrong') : (done && ci === q.correct ? 'right' : '');
              return (
                <button
                  key={ci}
                  className={`qb-choice ${state}`}
                  onClick={() => picks[qi] == null && setPicks({ ...picks, [qi]: ci })}
                  disabled={picks[qi] != null}
                >
                  <span className="iq-letter">{String.fromCharCode(65+ci)}</span>
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="qb-actions">
        {!done ? (
          <button className="pill pill-ghost" onClick={() => setDone(true)} disabled={answered < block.questions.length} style={{ opacity: answered < block.questions.length ? 0.5 : 1 }}>Finish quiz</button>
        ) : (
          <div className="qb-result">
            <strong>{score} / {block.questions.length}</strong>
            <span className="muted"> · {score === block.questions.length ? 'Perfect.' : score >= block.questions.length - 1 ? 'Great work.' : 'Review and try again.'}</span>
          </div>
        )}
        <button className="pill pill-ghost" onClick={() => { setPicks({}); setDone(false); }}>Restart</button>
      </div>
      <style>{`
        .qb {
          margin: 32px 0;
          padding: 28px;
          background: var(--paper);
          border-radius: var(--r-lg);
          border: 1px solid var(--ink-100);
          box-shadow: var(--shadow-sm);
        }
        .qb-head { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
        .qb-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--peach-50);
          color: var(--peach-500);
          display: grid; place-items: center;
        }
        .qb-prog {
          height: 6px; background: var(--ink-100); border-radius: 999px;
          position: relative; margin-bottom: 24px;
        }
        .qb-prog-bar {
          position: absolute; inset: 0 auto 0 0;
          background: linear-gradient(90deg, var(--peach-300), var(--peach-400));
          border-radius: 999px; transition: width 0.4s var(--ease-organic);
        }
        .qb-prog-label {
          position: absolute; top: 10px; right: 0;
          font-size: 11px; font-weight: 600; color: var(--ink-500);
        }
        .qb-q { margin-bottom: 22px; }
        .qb-q-text { font-size: 15px; font-weight: 600; margin-bottom: 12px; line-height: 1.4; }
        .qb-choices { display: flex; flex-direction: column; gap: 8px; }
        .qb-choice {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          background: var(--cream);
          border: 1.5px solid transparent;
          border-radius: var(--r-pill);
          font-size: 14px;
          color: var(--ink-700);
          text-align: left;
          transition: all 0.3s var(--ease-organic);
        }
        .qb-choice:not(:disabled):hover { border-color: var(--peach-300); }
        .qb-choice.right { border-color: var(--success); background: rgba(79,176,122,0.08); }
        .qb-choice.wrong { border-color: var(--error); background: rgba(226,106,92,0.08); }
        .qb-actions { display: flex; gap: 12px; align-items: center; justify-content: center; margin-top: 16px; }
        .qb-result { font-size: 16px; }
      `}</style>
    </div>
  );
}

function ImmersivePillar() {
  const c = window.PHOTO_CONTENT;

  const renderProse = (body) => body.split('\n\n').map((p, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}/>
  ));

  return (
    <div className="immersive">
      <aside className="toc">
        {c.toc.map((t, i) => (
          <div key={t.id} className={`toc-item ${t.current ? 'current' : ''} ${t.done ? 'done' : ''}`}>
            <span className="toc-check">
              {t.done ? <Ico.Check/> : <span className="toc-empty"/>}
            </span>
            <span className="toc-label">{t.title}</span>
            {t.current && <button className="toc-quiz-link"><Ico.Hint/> Take quiz to complete</button>}
          </div>
        ))}
      </aside>

      <article className="reader">
        <div className="reader-nav">
          <button className="icon-btn"><Ico.ArrowLeft/></button>
          <span className="muted" style={{ fontSize: 12 }}>Section 3 of 4</span>
          <button className="icon-btn"><Ico.ArrowRight/></button>
        </div>

        <h2 className="h2">The Calvin Cycle</h2>

        {c.sections.map(s => {
          if (s.kind === 'objectives') return (
            <div key={s.id} className="objectives">
              <h3 className="h3" style={{ marginBottom: 8 }}>{s.heading}</h3>
              <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>By the end of this section, you should be able to:</p>
              <ul>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </div>
          );
          if (s.kind === 'prose') return (
            <section key={s.id} className="prose">
              {s.heading && <h3 className="h3" style={{ marginTop: 16 }}>{s.heading}</h3>}
              {renderProse(s.body)}
              {s.figure === 'leaf-cell' && <LeafCellDiagram/>}
              {s.figure === 'calvin-cycle' && <CalvinDiagram/>}
            </section>
          );
          if (s.kind === 'inline-quiz') return <InlineQuiz key={s.id} q={s}/>;
          if (s.kind === 'quiz-block') return <QuizBlock key={s.id} block={s}/>;
          return null;
        })}
      </article>

      <style>{`
        .immersive {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          padding: 28px 36px 48px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .toc {
          position: sticky;
          top: 24px;
          align-self: start;
          display: flex; flex-direction: column; gap: 14px;
        }
        .toc-item {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 8px;
          font-size: 13px;
          line-height: 1.4;
          color: var(--ink-500);
          padding: 10px 12px;
          border-radius: var(--r-md);
          align-items: start;
        }
        .toc-item.current {
          background: var(--peach-50);
          color: var(--ink-900);
          font-weight: 600;
        }
        .toc-item.done .toc-label { color: var(--ink-700); }
        .toc-check {
          display: grid; place-items: center;
          width: 16px; height: 16px;
          border-radius: 4px;
          background: var(--paper);
          border: 1.5px solid var(--ink-200);
          color: white;
          margin-top: 2px;
        }
        .toc-item.done .toc-check { background: var(--success); border-color: var(--success); }
        .toc-empty { display: block; width: 8px; height: 8px; }
        .toc-quiz-link {
          grid-column: 2;
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 8px;
          padding: 6px 12px;
          background: var(--paper);
          border: 1px solid var(--peach-200);
          border-radius: var(--r-pill);
          font-size: 11px; font-weight: 600;
          color: var(--peach-500);
          width: fit-content;
        }

        .reader { min-width: 0; }
        .reader-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .reader h2 { margin-bottom: 16px; }
        .reader p {
          font-size: 16px; line-height: 1.75; color: var(--ink-700);
          margin: 12px 0;
        }
        .reader strong { color: var(--ink-900); }

        .objectives {
          background: var(--cream-deep);
          border-radius: var(--r-md);
          padding: 18px 22px;
          border-left: 3px solid var(--peach-300);
          margin-bottom: 24px;
        }
        .objectives ul { margin: 8px 0 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: var(--ink-700); }

        @media (max-width: 880px) {
          .immersive { grid-template-columns: 1fr; padding: 20px; }
          .toc { position: relative; top: 0; flex-direction: row; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// PILLAR 3 — Slides & Narration
// ============================================
function SlideRender({ slide }) {
  if (slide.kind === 'cover') return (
    <div className="slide slide-cover">
      <div className="slide-leaf"><Ico.Leaf/></div>
      <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--peach-500)' }}>{slide.title}</h1>
      <p style={{ fontSize: 22, color: 'var(--ink-700)', fontWeight: 500 }}>{slide.subtitle}</p>
    </div>
  );
  if (slide.kind === 'equation') return (
    <div className="slide">
      <h2 className="h2" style={{ color: 'var(--peach-500)' }}>{slide.title}</h2>
      <div className="eq">
        <span>6 CO<sub>2</sub></span>
        <span className="eq-op">+</span>
        <span>6 H<sub>2</sub>O</span>
        <span className="eq-op">+</span>
        <span style={{ color: 'var(--peach-500)' }}>☀ light</span>
        <span className="eq-arrow">→</span>
        <span style={{ color: 'var(--success)' }}>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span>
        <span className="eq-op">+</span>
        <span>6 O<sub>2</sub></span>
      </div>
    </div>
  );
  if (slide.kind === 'split') return (
    <div className="slide">
      <h2 className="h2">{slide.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="slide-card" style={{ borderColor: 'var(--peach-300)' }}>
          <span className="subject-chip">Stage 1</span>
          <h3 className="h3" style={{ marginTop: 8 }}>Light Reactions</h3>
          <p className="muted" style={{ fontSize: 14 }}>Capture sunlight in the thylakoid; produce ATP + NADPH + O<sub>2</sub>.</p>
        </div>
        <div className="slide-card" style={{ borderColor: 'var(--lav-300)' }}>
          <span className="subject-chip" style={{ background: 'var(--lav-50)', color: 'var(--lav-500)' }}>Stage 2</span>
          <h3 className="h3" style={{ marginTop: 8 }}>Calvin Cycle</h3>
          <p className="muted" style={{ fontSize: 14 }}>Use ATP + NADPH in the stroma to fix CO<sub>2</sub> into glucose.</p>
        </div>
      </div>
    </div>
  );
  if (slide.kind === 'diagram') return (
    <div className="slide">
      <h2 className="h2">{slide.title}</h2>
      <p className="muted" style={{ fontSize: 16, marginTop: 4 }}>{slide.body}</p>
      <div style={{ marginTop: 16 }}><LeafCellDiagram/></div>
    </div>
  );
  if (slide.kind === 'stat') return (
    <div className="slide slide-stat">
      <div className="stat-num">~120<span className="stat-unit">Gt</span></div>
      <p className="stat-label">Carbon removed from the atmosphere by photosynthetic life every year.</p>
      <p className="muted" style={{ fontSize: 14 }}>That's roughly twelve times all human emissions, on a normal year.</p>
    </div>
  );
  return null;
}

function SlidesPillar() {
  const c = window.PHOTO_CONTENT;
  const [idx, setIdx] = useStateHub(0);
  const [playing, setPlaying] = useStateHub(false);

  useEffectHub(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (idx < c.slides.length - 1) setIdx(idx + 1);
      else setPlaying(false);
    }, 4000);
    return () => clearTimeout(t);
  }, [playing, idx]);

  return (
    <div className="slides-pillar">
      <div className="stage-wrap">
        <div className="stage" key={idx}>
          <SlideRender slide={c.slides[idx]}/>
        </div>
        <div className="stage-pager">
          {c.slides.map((_, i) => (
            <button key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)}/>
          ))}
        </div>
      </div>

      <div className="player">
        <button className="player-play" onClick={() => setPlaying(p => !p)}>
          {playing ? <Ico.Pause/> : <Ico.Play/>}
        </button>
        <div className="player-time">0:{String(idx*4).padStart(2,'0')}</div>
        <div className="player-track">
          <div className="player-fill" style={{ width: `${((idx+1) / c.slides.length) * 100}%` }}/>
          {c.slides.map((_, i) => <span key={i} className="player-mark" style={{ left: `${((i+1) / c.slides.length) * 100}%` }}/>)}
        </div>
        <div className="player-time">0:{String(c.slides.length*4).padStart(2,'0')}</div>
        <button className="icon-btn" onClick={() => setIdx(Math.max(0, idx-1))}><Ico.ArrowLeft/></button>
        <button className="icon-btn" onClick={() => setIdx(Math.min(c.slides.length-1, idx+1))}><Ico.ArrowRight/></button>
      </div>

      <style>{`
        .slides-pillar { padding: 28px 36px 40px; max-width: 960px; margin: 0 auto; }
        .stage-wrap { position: relative; }
        .stage {
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, var(--cream) 0%, var(--peach-50) 100%);
          border-radius: var(--r-lg);
          border: 1px solid var(--ink-100);
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
          animation: slide-in-right 0.6s var(--ease-organic);
        }
        .slide { display: flex; flex-direction: column; gap: 12px; height: 100%; }
        .slide-cover {
          align-items: flex-start; justify-content: center;
        }
        .slide-leaf {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--peach-200), var(--peach-300));
          display: grid; place-items: center;
          color: white;
          margin-bottom: 16px;
        }
        .slide-leaf svg { width: 28px; height: 28px; }
        .slide-card {
          padding: 20px;
          background: var(--paper);
          border-radius: var(--r-md);
          border: 1.5px solid;
          display: flex; flex-direction: column; gap: 6px;
        }
        .eq {
          display: flex; flex-wrap: wrap; gap: 14px;
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 700;
          color: var(--ink-900);
          align-items: center;
          margin-top: 24px;
          letter-spacing: -0.02em;
        }
        .eq-op { color: var(--ink-300); }
        .eq-arrow { color: var(--peach-500); }

        .slide-stat { align-items: center; justify-content: center; text-align: center; }
        .stat-num {
          font-size: clamp(80px, 14vw, 160px);
          font-weight: 800;
          letter-spacing: -0.05em;
          color: var(--peach-500);
          line-height: 0.9;
        }
        .stat-unit { font-size: 0.4em; color: var(--ink-700); margin-left: 8px; }
        .stat-label {
          font-size: 20px; font-weight: 600; max-width: 520px;
          letter-spacing: -0.015em;
          margin: 8px 0;
        }

        .stage-pager {
          display: flex; gap: 6px; justify-content: center;
          margin-top: 16px;
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--ink-200);
          transition: all 0.3s var(--ease-organic);
        }
        .dot.active { background: var(--peach-400); width: 24px; border-radius: 999px; }

        .player {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px;
          background: var(--paper);
          border-radius: var(--r-pill);
          margin-top: 24px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--ink-100);
        }
        .player-play {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--ink-900);
          color: var(--cream);
          display: grid; place-items: center;
        }
        .player-time { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--ink-500); min-width: 32px; }
        .player-track {
          flex: 1; height: 4px;
          background: var(--ink-100);
          border-radius: 999px;
          position: relative;
        }
        .player-fill {
          position: absolute; inset: 0 auto 0 0;
          background: linear-gradient(90deg, var(--peach-300), var(--peach-400));
          border-radius: 999px;
          transition: width 0.5s var(--ease-organic);
        }
        .player-mark {
          position: absolute;
          top: -2px; width: 1px; height: 8px;
          background: var(--paper);
          transform: translateX(-1px);
        }
      `}</style>
    </div>
  );
}

// ============================================
// PILLAR 4 — Audio Lesson
// ============================================
function AudioPillar() {
  const c = window.PHOTO_CONTENT;
  const [playing, setPlaying] = useStateHub(false);
  const [t, setT] = useStateHub(0);
  const dur = c.audio.duration;

  useEffectHub(() => {
    if (!playing) return;
    const id = setInterval(() => setT(prev => prev >= dur ? (setPlaying(false), 0) : prev + 1), 80);
    return () => clearInterval(id);
  }, [playing]);

  const fmt = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const currentChapter = [...c.audio.chapters].reverse().find(c => c.t <= t);

  return (
    <div className="audio-pillar">
      <div className="audio-card">
        <div className="audio-art">
          <div className="audio-eq">
            {[...Array(24)].map((_, i) => (
              <span key={i} className="audio-bar" style={{
                animationDelay: `${i * 0.07}s`,
                animationPlayState: playing ? 'running' : 'paused',
                opacity: playing ? 1 : 0.4,
              }}/>
            ))}
          </div>
        </div>

        <div className="audio-meta">
          <span className="eyebrow">Audio Lesson</span>
          <h2 className="h2" style={{ marginTop: 6 }}>{c.audio.title}</h2>
          <p className="muted" style={{ fontSize: 14 }}>{c.audio.host} · {fmt(dur)}</p>
        </div>

        <div className="audio-now">
          <span className="audio-now-icon"><Ico.Audio/></span>
          <span className="audio-now-label">{currentChapter?.label || 'Press play to begin'}</span>
        </div>

        <div className="audio-track">
          <div className="audio-track-bar">
            <div className="audio-track-fill" style={{ width: `${(t/dur)*100}%` }}/>
            {c.audio.chapters.map(ch => (
              <span key={ch.t} className="audio-chap" style={{ left: `${(ch.t/dur)*100}%` }} title={ch.label}/>
            ))}
            <div className="audio-thumb" style={{ left: `${(t/dur)*100}%` }}/>
          </div>
          <div className="audio-time">
            <span>{fmt(t)}</span>
            <span>−{fmt(dur - t)}</span>
          </div>
        </div>

        <div className="audio-controls">
          <button className="icon-btn"><Ico.ArrowLeft/></button>
          <button className="audio-play" onClick={() => setPlaying(p => !p)}>
            {playing ? <Ico.Pause/> : <Ico.Play/>}
          </button>
          <button className="icon-btn"><Ico.ArrowRight/></button>
        </div>

        <div className="audio-chapters">
          <div className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Chapters</div>
          {c.audio.chapters.map(ch => (
            <button key={ch.t} className={`audio-chap-row ${ch === currentChapter ? 'active' : ''}`} onClick={() => setT(ch.t)}>
              <span className="audio-chap-time">{fmt(ch.t)}</span>
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .audio-pillar { padding: 28px 36px 40px; max-width: 720px; margin: 0 auto; }
        .audio-card {
          background: linear-gradient(180deg, var(--paper), var(--cream-deep));
          border-radius: var(--r-xl);
          padding: 32px;
          border: 1px solid var(--ink-100);
          box-shadow: var(--shadow-md);
          display: flex; flex-direction: column; gap: 20px;
        }
        .audio-art {
          aspect-ratio: 2.2;
          background: linear-gradient(135deg, var(--peach-100), var(--lav-100));
          border-radius: var(--r-lg);
          display: grid; place-items: center;
          overflow: hidden;
        }
        .audio-eq {
          display: flex; gap: 4px; height: 60%;
          align-items: center;
        }
        .audio-bar {
          width: 4px;
          background: linear-gradient(180deg, var(--peach-400), var(--lav-400));
          border-radius: 999px;
          height: 30%;
          animation: audio-bounce 1s ease-in-out infinite alternate;
        }
        @keyframes audio-bounce {
          0% { height: 20%; }
          100% { height: 90%; }
        }
        .audio-meta { text-align: center; }

        .audio-now {
          display: flex; gap: 10px; align-items: center; justify-content: center;
          padding: 12px 18px;
          background: var(--lav-50);
          border-radius: var(--r-pill);
          font-size: 14px; font-weight: 500;
          color: var(--ink-700);
          margin: 0 auto;
        }
        .audio-now-icon { color: var(--lav-500); display: flex; }

        .audio-track-bar {
          position: relative;
          height: 6px;
          background: var(--ink-100);
          border-radius: 999px;
        }
        .audio-track-fill {
          position: absolute; inset: 0 auto 0 0;
          background: linear-gradient(90deg, var(--peach-300), var(--peach-400));
          border-radius: 999px;
        }
        .audio-chap {
          position: absolute;
          top: -2px; width: 2px; height: 10px;
          background: var(--paper);
          transform: translateX(-1px);
          border-radius: 1px;
        }
        .audio-thumb {
          position: absolute;
          top: -5px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--paper);
          border: 2px solid var(--peach-400);
          transform: translateX(-8px);
          box-shadow: var(--shadow-sm);
        }
        .audio-time {
          display: flex; justify-content: space-between;
          font-size: 12px; font-variant-numeric: tabular-nums;
          color: var(--ink-500); margin-top: 8px;
        }

        .audio-controls {
          display: flex; gap: 18px; justify-content: center; align-items: center;
        }
        .audio-play {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--ink-900);
          color: var(--cream);
          display: grid; place-items: center;
          box-shadow: var(--shadow-md);
          transition: transform 0.2s var(--ease-spring);
        }
        .audio-play:hover { transform: scale(1.06); }
        .audio-play svg { width: 22px; height: 22px; }

        .audio-chapters { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
        .audio-chap-row {
          display: flex; gap: 14px;
          padding: 10px 14px;
          border-radius: var(--r-md);
          font-size: 13.5px;
          color: var(--ink-700);
          text-align: left;
          transition: background 0.2s ease;
        }
        .audio-chap-row:hover { background: var(--cream-deep); }
        .audio-chap-row.active { background: var(--peach-50); color: var(--ink-900); font-weight: 600; }
        .audio-chap-time {
          font-variant-numeric: tabular-nums;
          color: var(--ink-300);
          min-width: 38px;
        }
      `}</style>
    </div>
  );
}

// ============================================
// PILLAR 5 — Mindmap
// ============================================
function MindmapPillar() {
  const c = window.PHOTO_CONTENT;
  const [zoom, setZoom] = useStateHub(1);
  const [pan, setPan] = useStateHub({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useStateHub({});
  const [active, setActive] = useStateHub('root');
  const dragRef = useRefHub(null);

  const allNodes = [c.mindmap.root, ...c.mindmap.nodes];
  const visible = allNodes.filter(n => {
    let p = n.parent;
    while (p) {
      if (collapsed[p]) return false;
      const pn = allNodes.find(x => x.id === p);
      p = pn?.parent;
    }
    return true;
  });

  const onMouseDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.x),
      y: dragRef.current.panY + (e.clientY - dragRef.current.y),
    });
  };
  const onMouseUp = () => { dragRef.current = null; };

  const hasChildren = (id) => allNodes.some(n => n.parent === id);

  return (
    <div className="mind-pillar">
      <div className="mind-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="mind-grid"/>
        <div className="mind-stage" style={{ transform: `translate(calc(50% + ${pan.x}px), calc(50% + ${pan.y}px)) scale(${zoom})` }}>
          <svg className="mind-edges" width="1200" height="800" viewBox="-600 -400 1200 800">
            {visible.filter(n => n.parent).map(n => {
              const parent = allNodes.find(p => p.id === n.parent);
              if (!parent || !visible.includes(parent)) return null;
              const dx = n.x - parent.x;
              const cx = parent.x + dx * 0.5;
              return <path key={n.id} d={`M ${parent.x} ${parent.y} C ${cx} ${parent.y}, ${cx} ${n.y}, ${n.x} ${n.y}`} stroke="var(--lav-300)" strokeWidth="1.5" fill="none" opacity="0.7"/>;
            })}
          </svg>
          {visible.map(n => (
            <div
              key={n.id}
              className={`mind-node ${n.id === 'root' ? 'root' : ''} ${active === n.id ? 'active' : ''}`}
              style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
              onClick={(e) => { e.stopPropagation(); setActive(n.id); }}
            >
              <span>{n.label}</span>
              {hasChildren(n.id) && (
                <button className="mind-toggle" onClick={(e) => { e.stopPropagation(); setCollapsed(c => ({ ...c, [n.id]: !c[n.id] })); }}>
                  {collapsed[n.id] ? <Ico.Plus/> : <Ico.Minus/>}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mind-controls">
          <button className="icon-btn" onClick={() => setZoom(z => Math.min(2, z+0.2))}><Ico.Plus/></button>
          <button className="icon-btn" onClick={() => setZoom(z => Math.max(0.4, z-0.2))}><Ico.Minus/></button>
          <button className="icon-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset"><Ico.Sparkle/></button>
        </div>

        <div className="mind-hint">
          <Ico.Mind/> Drag to pan · scroll wheel to zoom · click node to focus
        </div>
      </div>

      <style>{`
        .mind-pillar { height: 640px; }
        .mind-canvas {
          position: relative;
          width: 100%; height: 100%;
          overflow: hidden;
          cursor: grab;
          user-select: none;
        }
        .mind-canvas:active { cursor: grabbing; }
        .mind-grid {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, var(--ink-100) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.5;
        }
        .mind-stage {
          position: absolute;
          left: 0; top: 0;
          transform-origin: 0 0;
          transition: transform 0.4s var(--ease-organic);
        }
        .mind-edges { position: absolute; left: -600px; top: -400px; pointer-events: none; }
        .mind-node {
          position: absolute;
          left: 0; top: 0;
          margin-left: -60px; margin-top: -16px;
          padding: 8px 14px;
          background: var(--lav-100);
          border: 1.5px solid var(--lav-200);
          border-radius: var(--r-pill);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--lav-500);
          white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s var(--ease-organic);
          cursor: pointer;
        }
        .mind-node:hover { transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.05); }
        .mind-node.root {
          background: var(--peach-200);
          border-color: var(--peach-400);
          color: var(--ink-900);
          font-size: 14px;
          padding: 12px 22px;
          font-weight: 700;
        }
        .mind-node.active {
          background: var(--lav-200);
          border-color: var(--lav-400);
          box-shadow: 0 0 0 4px rgba(140,138,214,0.2), var(--shadow-md);
        }
        .mind-node.root.active { background: var(--peach-300); border-color: var(--peach-500); }
        .mind-toggle {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--paper);
          color: var(--lav-500);
          display: grid; place-items: center;
          margin-left: 4px;
        }

        .mind-controls {
          position: absolute;
          left: 24px; bottom: 24px;
          display: flex; flex-direction: column; gap: 8px;
          z-index: 5;
        }
        .mind-hint {
          position: absolute;
          right: 24px; bottom: 24px;
          display: flex; gap: 8px; align-items: center;
          font-size: 12px; color: var(--ink-500);
          padding: 8px 14px;
          background: var(--paper);
          border-radius: var(--r-pill);
          box-shadow: var(--shadow-sm);
        }
        .mind-hint svg { color: var(--lav-500); width: 14px; height: 14px; }
      `}</style>
    </div>
  );
}

// ============================================
// Hub container — switches between pillars
// ============================================
function LearningHub({ persona, onPersonaChange, onBack, dark, onToggleDark, plan, deadlines }) {
  const [tab, setTab] = useStateHub('roadmap');
  const c = window.PHOTO_CONTENT;
  return (
    <div className="hub fade-in" data-screen-label={`Hub · ${tab}`}>
      <TopBar persona={persona} onChangePersona={onPersonaChange} dark={dark} onToggleDark={onToggleDark}/>

      <div className="hub-meta">
        <button className="link-btn" onClick={onBack}><Ico.ArrowLeft/> All modules</button>
        <h2 className="hub-title">{c.title}</h2>
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>{c.subtitle}</p>
      </div>

      <div className="hub-card">
        <PillarTabs active={tab} onChange={setTab}/>
        <div className="pillar-stage" key={tab}>
          {tab === 'roadmap' && <RoadmapPillar plan={plan} deadlines={deadlines}/>}
          {tab === 'source' && <SourcePillar/>}
          {tab === 'text' && <ImmersivePillar/>}
          {tab === 'slides' && <SlidesPillar/>}
          {tab === 'audio' && <AudioPillar/>}
          {tab === 'mind' && <MindmapPillar/>}
        </div>
      </div>

      <style>{`
        .hub { padding-bottom: 64px; }
        .hub-meta {
          max-width: 1100px; margin: 0 auto;
          padding: 0 32px 16px;
          display: flex; flex-direction: column; gap: 4px;
          align-items: flex-start;
        }
        .link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-500); margin-bottom: 8px; }
        .link-btn:hover { color: var(--ink-900); }
        .hub-title {
          font-size: clamp(28px, 3.4vw, 40px);
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 0;
        }
        .hub-card {
          max-width: 1100px;
          margin: 24px auto 0;
          background: var(--paper);
          border-radius: var(--r-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(45,30,15,0.04);
          overflow: hidden;
        }
        .pillar-stage { animation: slide-in-right 0.5s var(--ease-organic); }
      `}</style>
    </div>
  );
}

Object.assign(window, { LearningHub });
