/* global React */
const { useState: useStateLoad, useEffect: useEffectLoad } = React;

// ============================================
// Multi-agent loading screen
// ============================================
function LoadingPage({ topic, fromUpload, onDone }) {
  const phases = fromUpload ? [
    { text: 'Reading your file…', sub: 'Extracting text and figures from your media' },
    { text: 'Removing fluff and extracting core concepts…', sub: 'Identifying what actually matters' },
    { text: 'Transforming and personalizing your study material…', sub: `Tuned for a ${'high schooler'} who likes music` },
    { text: 'Generating audio, images, and mindmaps…', sub: 'The 5 pillars are coming online' },
  ] : [
    { text: 'Scouring the internet for the best resources…', sub: 'Searching textbooks, papers, and trusted sources' },
    { text: 'Removing fluff and extracting core concepts…', sub: 'Identifying what actually matters' },
    { text: 'Transforming and personalizing your study material…', sub: 'Tuned for a high schooler who likes music' },
    { text: 'Generating audio, images, and mindmaps…', sub: 'The 5 pillars are coming online' },
  ];

  const [phase, setPhase] = useStateLoad(0);
  const [progress, setProgress] = useStateLoad(0);

  useEffectLoad(() => {
    const phaseDur = 1700;
    const total = phaseDur * phases.length;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / total);
      setProgress(p);
      const idx = Math.min(phases.length - 1, Math.floor(elapsed / phaseDur));
      setPhase(idx);
      if (p >= 1) {
        clearInterval(tick);
        setTimeout(onDone, 400);
      }
    }, 60);
    return () => clearInterval(tick);
  }, []);

  const current = phases[phase];

  return (
    <div className="loading-page fade-in">
      <div className="loading-stage">
        <div className="agent-cluster">
          <div className="agent-orb">
            <div className="orb-core"><Ico.Sparkle/></div>
            <div className="orb-ring orb-ring-1"/>
            <div className="orb-ring orb-ring-2"/>
            <div className="orb-ring orb-ring-3"/>
          </div>
          <div className="agent-particles">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="agent-particle" style={{ '--i': i, '--n': 8 }}/>
            ))}
          </div>
        </div>

        <div className="loading-text">
          <span className="loading-topic muted">{fromUpload ? 'From your file' : `Searching: “${topic}”`}</span>
          <h2 key={current.text} className="loading-h fade-up">{current.text}</h2>
          <p key={current.sub} className="muted loading-sub fade-up">{current.sub}</p>
        </div>

        <div className="loading-progress">
          <div className="loading-progress-bar" style={{ width: `${progress * 100}%` }}/>
        </div>

        <div className="agent-checklist">
          {phases.map((p, i) => (
            <div key={i} className={`agent-step ${i < phase ? 'done' : i === phase ? 'active' : ''}`}>
              <span className="agent-dot">
                {i < phase ? <Ico.Check/> : i === phase ? <span className="agent-dot-pulse"/> : null}
              </span>
              <span className="agent-step-label">{['Search', 'Extract', 'Personalize', 'Generate'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .loading-page {
          min-height: 100vh;
          background: var(--cream);
          display: grid;
          place-items: center;
          padding: 40px 24px;
          position: relative;
        }
        .loading-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(230, 230, 250, 0.6), transparent 60%);
          pointer-events: none;
        }
        .loading-stage {
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; gap: 28px;
          max-width: 520px;
          text-align: center;
        }
        .agent-cluster { position: relative; width: 200px; height: 200px; }
        .agent-orb {
          position: absolute; inset: 30px;
          display: grid; place-items: center;
        }
        .orb-core {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--lav-100), var(--lav-200));
          display: grid; place-items: center;
          color: var(--lav-500);
          animation: pulse-glow 2.4s ease-in-out infinite;
        }
        .orb-core svg { width: 44px; height: 44px; }
        .orb-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--lav-200);
          opacity: 0.6;
        }
        .orb-ring-1 { inset: -10px; animation: spin-slow 14s linear infinite; border-style: dashed; }
        .orb-ring-2 { inset: -22px; border-color: var(--peach-200); opacity: 0.4; animation: spin-slow 22s linear infinite reverse; }
        .orb-ring-3 { inset: -34px; border-color: var(--lav-200); opacity: 0.25; animation: spin-slow 30s linear infinite; }

        .agent-particles { position: absolute; inset: 0; }
        .agent-particle {
          position: absolute;
          left: 50%; top: 50%;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--lav-400);
          margin: -3px 0 0 -3px;
          animation: orbit 4s linear infinite;
          animation-delay: calc(var(--i) * -0.5s);
          opacity: 0.7;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(0.8); }
          50%  { transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1.1); }
          to   { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(0.8); }
        }

        .loading-text { display: flex; flex-direction: column; gap: 6px; min-height: 110px; }
        .loading-topic { font-size: 13px; letter-spacing: 0.02em; }
        .loading-h {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.15;
        }
        .loading-sub { font-size: 14px; margin: 0; }

        .loading-progress {
          width: 240px; height: 4px;
          background: var(--ink-100);
          border-radius: 999px;
          overflow: hidden;
        }
        .loading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--lav-400), var(--peach-400));
          border-radius: 999px;
          transition: width 0.2s linear;
        }

        .agent-checklist {
          display: flex; gap: 18px;
          flex-wrap: wrap; justify-content: center;
          margin-top: 4px;
        }
        .agent-step {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600;
          color: var(--ink-300);
          letter-spacing: -0.01em;
          transition: color 0.4s ease;
        }
        .agent-step.done { color: var(--success); }
        .agent-step.active { color: var(--lav-500); }
        .agent-dot {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          display: grid; place-items: center;
        }
        .agent-step.done .agent-dot { background: var(--success); border-color: var(--success); color: white; }
        .agent-dot-pulse {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-glow 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { LoadingPage });
