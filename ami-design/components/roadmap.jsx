/* global React */
const { useState: useStateRM, useEffect: useEffectRM, useRef: useRefRM, useMemo: useMemoRM } = React;

// ============================================
// Roadmap Pillar — vertical pointer-based progress
// ============================================
//
// Layout: a sticky vertical rail on the left with milestone "pointers".
// As the user scrolls, the rail's progress bar fills smoothly between
// pointers based on how much of each milestone's content has scrolled past.
//
// Quiz failure semantics: each milestone has an optional gate quiz at the
// end. If the user fails the quiz, the rail's "completed" mark for that
// milestone is removed and the progress bar is reset to the previous
// milestone — they have to re-read & re-pass to advance.
//
// We expose this as <RoadmapPillar/> for use in the Hub, and accept an
// optional `plan` prop so Quick-Learning can pass a generated plan.
// ============================================

function RoadmapPillar({ plan, deadlines }) {
  const data = plan || DEFAULT_PHOTO_PLAN;
  const milestones = data.milestones;

  // Per-milestone state: 'locked' | 'active' | 'passed' | 'failed'
  const [statuses, setStatuses] = useStateRM(() =>
    milestones.map((_, i) => (i === 0 ? 'active' : 'locked'))
  );
  // Highest milestone the user has reached (drives rail fill cap)
  const [highest, setHighest] = useStateRM(0);
  // Smooth scroll-driven fill (0..1 within current milestone)
  const [fillFrac, setFillFrac] = useStateRM(0);

  const scrollerRef = useRefRM(null);
  const sectionRefs = useRefRM([]);

  // ---- Compute live scroll → progress -----------------------------------
  useEffectRM(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const viewportMid = scrollTop + el.clientHeight * 0.45;

      // Find which section the viewport mid is currently inside
      let activeIdx = 0;
      let frac = 0;
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const s = sectionRefs.current[i];
        if (!s) continue;
        const top = s.offsetTop;
        const bottom = top + s.offsetHeight;
        if (viewportMid >= top && viewportMid < bottom) {
          activeIdx = i;
          frac = (viewportMid - top) / Math.max(1, s.offsetHeight);
          break;
        }
        if (viewportMid >= bottom) {
          activeIdx = i + 1;
          frac = 0;
        }
      }
      setFillFrac(Math.min(1, Math.max(0, frac)));

      // Auto-promote 'active' as user scrolls if not failed
      setHighest(prev => Math.max(prev, activeIdx));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [milestones.length]);

  // ---- Quiz outcomes -----------------------------------------------------
  const onQuizPass = (i) => {
    setStatuses(prev => {
      const next = [...prev];
      next[i] = 'passed';
      if (i + 1 < next.length && next[i + 1] === 'locked') next[i + 1] = 'active';
      return next;
    });
    // Smooth-scroll into the next milestone's section
    requestAnimationFrame(() => {
      const target = sectionRefs.current[i + 1] || sectionRefs.current[i];
      if (target && scrollerRef.current) {
        scrollerRef.current.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
      }
    });
  };

  const onQuizFail = (i) => {
    // Reset to previous milestone — this milestone is failed, all later ones re-lock
    setStatuses(prev => {
      const next = prev.map((s, idx) => {
        if (idx < i) return 'passed';
        if (idx === i) return 'failed';
        return 'locked';
      });
      return next;
    });
    setHighest(Math.max(0, i - 1));
    setFillFrac(0);
    // Scroll user back to start of the failed milestone's section
    requestAnimationFrame(() => {
      const target = sectionRefs.current[i];
      if (target && scrollerRef.current) {
        scrollerRef.current.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
      }
    });
  };

  const onRetry = (i) => {
    setStatuses(prev => {
      const next = [...prev];
      next[i] = 'active';
      return next;
    });
  };

  // ---- Derived: rail progress (0..1 across whole rail) -------------------
  // Each milestone occupies 1/N of the rail. For each milestone:
  //   - 'passed' → contributes its full segment
  //   - the currently-scrolled-into milestone contributes fillFrac * segment
  //   - 'failed' / 'locked' → 0
  const railFrac = useMemoRM(() => {
    const N = milestones.length;
    let total = 0;
    for (let i = 0; i < N; i++) {
      if (statuses[i] === 'passed') total += 1 / N;
    }
    // Add live scroll contribution from the topmost not-yet-passed milestone
    const liveIdx = statuses.findIndex(s => s !== 'passed');
    if (liveIdx !== -1 && (statuses[liveIdx] === 'active' || statuses[liveIdx] === 'failed')) {
      // For failed: rail visibly retreats — contribute 0 from this segment.
      if (statuses[liveIdx] === 'active' && liveIdx <= highest) {
        total += (fillFrac * (1 / N));
      }
    }
    return Math.min(1, total);
  }, [statuses, fillFrac, highest, milestones.length]);

  return (
    <div className="rm-wrap" data-screen-label="Roadmap">
      {/* Header strip */}
      <div className="rm-head">
        <div>
          <span className="eyebrow">Learning roadmap</span>
          <h3 className="rm-title">{data.title}</h3>
        </div>
        <div className="rm-head-meta">
          {deadlines?.due && (
            <span className="rm-meta-pill">
              <Ico.Clock/> Due {deadlines.due}
            </span>
          )}
          <span className="rm-meta-pill">
            <Ico.Sparkle/> {milestones.length} milestones · ~{data.totalMinutes} min
          </span>
        </div>
      </div>

      {/* Two-pane: rail + content */}
      <div className="rm-body">
        {/* RAIL */}
        <aside className="rm-rail" aria-label="Progress rail">
          <div className="rm-rail-inner">
            <div className="rm-rail-track"/>
            <div
              className="rm-rail-fill"
              style={{ height: `${(railFrac * 100).toFixed(2)}%` }}
            />
            {milestones.map((m, i) => {
              const top = (i / (milestones.length - 1)) * 100;
              const status = statuses[i];
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`rm-pin rm-pin--${status}`}
                  style={{ top: `${top}%` }}
                  onClick={() => {
                    if (status === 'locked') return;
                    const target = sectionRefs.current[i];
                    if (target && scrollerRef.current) {
                      scrollerRef.current.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
                    }
                  }}
                  title={m.title}
                >
                  <span className="rm-pin-dot">
                    {status === 'passed' && <Ico.Check/>}
                    {status === 'failed' && <span className="rm-pin-x">×</span>}
                    {(status === 'active' || status === 'locked') && <span>{i + 1}</span>}
                  </span>
                  <span className="rm-pin-label">
                    <strong>{m.title}</strong>
                    <em>{m.minutes} min</em>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* SCROLLER */}
        <div className="rm-scroll" ref={scrollerRef}>
          {milestones.map((m, i) => {
            const status = statuses[i];
            return (
              <section
                key={m.id}
                ref={(el) => (sectionRefs.current[i] = el)}
                className={`rm-section rm-section--${status}`}
                data-screen-label={`Roadmap · ${i + 1} ${m.title}`}
              >
                <div className="rm-section-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="rm-section-body">
                  <h4 className="rm-section-title">{m.title}</h4>
                  <p className="rm-section-summary">{m.summary}</p>

                  <div className="rm-section-content">
                    {m.content.map((c, ci) => {
                      if (c.type === 'lead') {
                        return <p key={ci} className="rm-lead">{c.text}</p>;
                      }
                      if (c.type === 'p') {
                        return <p key={ci} className="rm-p">{c.text}</p>;
                      }
                      if (c.type === 'bullets') {
                        return (
                          <ul key={ci} className="rm-bullets">
                            {c.items.map((it, k) => <li key={k}>{it}</li>)}
                          </ul>
                        );
                      }
                      if (c.type === 'callout') {
                        return (
                          <div key={ci} className="rm-callout">
                            <span className="rm-callout-tag">{c.tag || 'Note'}</span>
                            <span>{c.text}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {m.gateQuiz && (
                    <RoadmapGate
                      quiz={m.gateQuiz}
                      status={status}
                      onPass={() => onQuizPass(i)}
                      onFail={() => onQuizFail(i)}
                      onRetry={() => onRetry(i)}
                    />
                  )}
                </div>
              </section>
            );
          })}

          {/* Tail */}
          <div className="rm-finish">
            <div className="rm-finish-trophy">
              <Ico.Sparkle/>
            </div>
            <h4>You're done — beautifully.</h4>
            <p>Every milestone passed. AMI will revisit weak spots in your next session.</p>
          </div>
        </div>
      </div>

      <style>{`
        .rm-wrap {
          display: flex;
          flex-direction: column;
          height: 700px;
          max-height: calc(100vh - 280px);
        }
        .rm-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px;
          padding: 22px 28px 18px;
          border-bottom: 1px solid var(--ink-100);
          flex-wrap: wrap;
        }
        .rm-title {
          font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
          margin: 4px 0 0;
        }
        .rm-head-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .rm-meta-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: var(--cream-deep);
          border-radius: 999px;
          font-size: 12.5px; font-weight: 500;
          color: var(--ink-700);
        }
        .rm-meta-pill svg { width: 14px; height: 14px; color: var(--peach-500); }

        .rm-body {
          flex: 1;
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 0;
        }

        /* ============ RAIL ============ */
        .rm-rail {
          padding: 36px 0 36px 24px;
          background: linear-gradient(to right, var(--cream-deep), transparent);
        }
        .rm-rail-inner {
          position: relative;
          height: 100%;
          padding: 12px 0;
        }
        .rm-rail-track {
          position: absolute;
          left: 18px; top: 12px; bottom: 12px;
          width: 4px;
          background: var(--ink-100);
          border-radius: 2px;
        }
        .rm-rail-fill {
          position: absolute;
          left: 18px; top: 12px;
          width: 4px;
          background: linear-gradient(180deg, var(--peach-300), var(--peach-500));
          border-radius: 2px;
          transition: height 0.6s var(--ease-organic);
          box-shadow: 0 0 12px rgba(244,122,74,0.4);
        }

        .rm-pin {
          position: absolute;
          left: 0; transform: translateY(-50%);
          display: flex; align-items: center; gap: 12px;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          color: inherit;
          width: 100%;
        }
        .rm-pin-dot {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--paper);
          border: 2.5px solid var(--ink-100);
          display: grid; place-items: center;
          font-size: 13px; font-weight: 700;
          color: var(--ink-500);
          flex-shrink: 0;
          transition: all 0.4s var(--ease-organic);
          z-index: 2;
          position: relative;
          box-shadow: var(--shadow-sm);
        }
        .rm-pin-label {
          display: flex; flex-direction: column;
          line-height: 1.3;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.3s var(--ease-organic);
          pointer-events: none;
        }
        .rm-pin-label strong {
          font-size: 13px; color: var(--ink-900); font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 160px;
        }
        .rm-pin-label em {
          font-size: 11px; color: var(--ink-500); font-style: normal;
        }

        .rm-pin--active .rm-pin-dot {
          border-color: var(--peach-500);
          color: var(--peach-500);
          box-shadow: 0 0 0 5px rgba(244,122,74,0.18), var(--shadow-md);
          transform: scale(1.05);
        }
        .rm-pin--active .rm-pin-dot::after {
          content: '';
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 2px solid var(--peach-300);
          opacity: 0.6;
          animation: rm-pulse 2.4s ease-in-out infinite;
        }
        @keyframes rm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.18); opacity: 0; }
        }
        .rm-pin--active .rm-pin-label,
        .rm-pin--passed .rm-pin-label,
        .rm-pin--failed .rm-pin-label {
          opacity: 1; transform: translateX(0);
        }

        .rm-pin--passed .rm-pin-dot {
          background: var(--peach-500);
          border-color: var(--peach-500);
          color: white;
        }
        .rm-pin--passed .rm-pin-dot svg { width: 16px; height: 16px; }

        .rm-pin--failed .rm-pin-dot {
          background: rgba(220, 80, 60, 0.08);
          border-color: rgba(220, 80, 60, 0.6);
          color: rgb(180, 50, 40);
        }
        .rm-pin-x { font-size: 22px; line-height: 1; font-weight: 600; }

        .rm-pin--locked .rm-pin-dot {
          opacity: 0.5;
          background: var(--ink-100);
        }
        .rm-pin--locked { cursor: not-allowed; }

        /* ============ SCROLLER ============ */
        .rm-scroll {
          overflow-y: auto;
          padding: 24px 32px 80px;
          scroll-behavior: smooth;
        }
        .rm-scroll::-webkit-scrollbar { width: 8px; }
        .rm-scroll::-webkit-scrollbar-thumb { background: var(--ink-100); border-radius: 4px; }

        .rm-section {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 18px;
          padding: 32px 0 40px;
          border-bottom: 1px dashed var(--ink-100);
          opacity: 1;
          transition: opacity 0.4s ease;
        }
        .rm-section:last-of-type { border-bottom: none; }
        .rm-section--locked { opacity: 0.4; pointer-events: none; filter: blur(0.4px); }

        .rm-section-num {
          font-family: ui-serif, 'Georgia', serif;
          font-size: 44px; font-weight: 400;
          color: var(--peach-300);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .rm-section--passed .rm-section-num { color: var(--peach-500); }
        .rm-section--failed .rm-section-num { color: rgb(180, 50, 40); }

        .rm-section-title {
          font-size: 26px; font-weight: 700;
          letter-spacing: -0.02em;
          margin: 4px 0 6px;
        }
        .rm-section-summary {
          font-size: 14.5px; color: var(--ink-500);
          margin: 0 0 22px;
          font-style: italic;
        }
        .rm-section-content { display: flex; flex-direction: column; gap: 14px; }
        .rm-lead { font-size: 17px; line-height: 1.55; margin: 0; color: var(--ink-900); }
        .rm-p { font-size: 15px; line-height: 1.62; margin: 0; color: var(--ink-700); }
        .rm-bullets {
          margin: 0; padding-left: 0; list-style: none;
          display: flex; flex-direction: column; gap: 8px;
        }
        .rm-bullets li {
          position: relative;
          padding-left: 22px;
          font-size: 14.5px; color: var(--ink-700);
          line-height: 1.55;
        }
        .rm-bullets li::before {
          content: '';
          position: absolute;
          left: 6px; top: 9px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--peach-500);
        }
        .rm-callout {
          display: flex; gap: 12px;
          background: var(--cream-deep);
          border-left: 3px solid var(--peach-500);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px; color: var(--ink-700);
          line-height: 1.5;
        }
        .rm-callout-tag {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--peach-500);
          flex-shrink: 0;
          padding-top: 2px;
        }

        .rm-finish {
          text-align: center;
          padding: 60px 24px 24px;
          color: var(--ink-700);
        }
        .rm-finish-trophy {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--peach-300), var(--peach-500));
          display: grid; place-items: center;
          margin: 0 auto 16px;
          color: white;
          box-shadow: 0 8px 24px rgba(244,122,74,0.3);
        }
        .rm-finish h4 { font-size: 22px; margin: 0 0 8px; letter-spacing: -0.02em; }
        .rm-finish p { font-size: 14px; color: var(--ink-500); margin: 0; }

        @media (max-width: 820px) {
          .rm-body { grid-template-columns: 60px 1fr; }
          .rm-pin-label { display: none; }
          .rm-rail { padding-left: 12px; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Gate quiz at end of each milestone
// ============================================
function RoadmapGate({ quiz, status, onPass, onFail, onRetry }) {
  const [pick, setPick] = useStateRM(null);
  const [submitted, setSubmitted] = useStateRM(false);

  const reset = () => { setPick(null); setSubmitted(false); };
  useEffectRM(() => { if (status === 'active') reset(); }, [status]);

  if (status === 'passed') {
    return (
      <div className="gate gate--passed">
        <span className="gate-icon"><Ico.Check/></span>
        <div>
          <strong>Milestone passed.</strong>
          <span> You answered correctly. The next milestone is unlocked.</span>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="gate gate--failed">
        <span className="gate-icon">×</span>
        <div className="gate-failed-body">
          <strong>Not quite — let's revisit.</strong>
          <p>The progress bar reset to the previous milestone. Re-read the section above and try again.</p>
          <button className="pill pill-primary" style={{ padding: '10px 18px', fontSize: 13 }} onClick={onRetry}>
            <Ico.Sparkle/> Retry quiz
          </button>
        </div>
        <RoadmapGateStyles/>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="gate gate--locked">
        <span className="gate-icon"><Ico.Lock/></span>
        <span>Complete the previous milestones to unlock.</span>
        <RoadmapGateStyles/>
      </div>
    );
  }

  // active — show interactive quiz
  const correct = quiz.choices.find(c => c.correct);
  const isCorrect = pick && pick.correct;

  return (
    <div className="gate gate--active">
      <div className="gate-head">
        <span className="gate-tag">Checkpoint quiz</span>
        <span className="gate-meta">Pass to continue</span>
      </div>
      <p className="gate-q">{quiz.q}</p>
      <div className="gate-choices">
        {quiz.choices.map((c, i) => {
          const isPicked = pick === c;
          const showOutcome = submitted && isPicked;
          return (
            <button
              key={i}
              className={`gate-choice ${isPicked ? 'picked' : ''} ${showOutcome ? (c.correct ? 'right' : 'wrong') : ''}`}
              onClick={() => !submitted && setPick(c)}
              disabled={submitted}
            >
              <span className="gate-choice-letter">{String.fromCharCode(65 + i)}</span>
              <span>{c.text}</span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          className="pill pill-primary"
          disabled={!pick}
          style={{ opacity: pick ? 1 : 0.5, padding: '12px 22px' }}
          onClick={() => {
            setSubmitted(true);
            setTimeout(() => {
              if (pick.correct) onPass();
              else onFail();
            }, 900);
          }}
        >
          Submit answer
        </button>
      ) : (
        <div className={`gate-result ${isCorrect ? 'right' : 'wrong'}`}>
          {isCorrect ? (
            <>
              <Ico.Check/> Correct — unlocking next milestone…
            </>
          ) : (
            <>
              <span style={{ fontSize: 18, fontWeight: 700 }}>×</span>
              That's not it. Correct answer: "{correct?.text}". Resetting progress…
            </>
          )}
        </div>
      )}
      <RoadmapGateStyles/>
    </div>
  );
}

function RoadmapGateStyles() {
  return (
    <style>{`
      .gate {
        margin-top: 28px;
        background: var(--paper);
        border: 1.5px solid var(--ink-100);
        border-radius: var(--r-md);
        padding: 18px 20px;
        box-shadow: var(--shadow-sm);
      }
      .gate--active { border-color: var(--peach-300); background: linear-gradient(180deg, var(--peach-50), var(--paper)); }
      .gate--passed {
        border-color: rgba(74, 200, 120, 0.4);
        background: rgba(220, 245, 230, 0.5);
        display: flex; gap: 12px; align-items: center;
        font-size: 14px; color: var(--ink-700); padding: 14px 18px;
      }
      .gate--passed strong { color: rgb(40, 130, 80); }
      .gate--passed .gate-icon {
        width: 28px; height: 28px;
        border-radius: 50%;
        background: rgb(74, 200, 120);
        color: white;
        display: grid; place-items: center;
        flex-shrink: 0;
      }
      .gate--failed {
        border-color: rgba(220, 80, 60, 0.4);
        background: rgba(255, 240, 235, 0.7);
        display: flex; gap: 14px; align-items: flex-start;
      }
      .gate--failed .gate-icon {
        width: 28px; height: 28px;
        border-radius: 50%;
        background: rgb(220, 80, 60);
        color: white;
        font-size: 18px; font-weight: 700;
        display: grid; place-items: center;
        flex-shrink: 0; margin-top: 2px;
      }
      .gate-failed-body p { font-size: 13.5px; color: var(--ink-700); margin: 4px 0 12px; line-height: 1.5; }
      .gate-failed-body strong { color: rgb(180, 50, 40); font-size: 14.5px; }
      .gate--locked {
        display: flex; gap: 10px; align-items: center;
        font-size: 13px; color: var(--ink-500);
        background: var(--cream-deep); border-color: var(--ink-100);
      }
      .gate--locked .gate-icon { color: var(--ink-300); display: inline-flex; }

      .gate-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
      .gate-tag {
        font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.1em;
        color: var(--peach-500);
        padding: 4px 10px;
        background: var(--peach-50);
        border-radius: 999px;
        border: 1px solid var(--peach-200);
      }
      .gate-meta { font-size: 12px; color: var(--ink-500); }
      .gate-q { font-size: 17px; font-weight: 600; margin: 4px 0 14px; line-height: 1.4; }
      .gate-choices { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
      .gate-choice {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px;
        background: var(--paper);
        border: 1.5px solid var(--ink-100);
        border-radius: 10px;
        font: inherit; font-size: 14px;
        color: var(--ink-900);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s var(--ease-organic);
      }
      .gate-choice:hover:not(:disabled) {
        border-color: var(--peach-300);
        background: var(--peach-50);
      }
      .gate-choice.picked { border-color: var(--peach-500); background: var(--peach-50); }
      .gate-choice.right { border-color: rgb(74, 200, 120); background: rgba(220, 245, 230, 0.5); }
      .gate-choice.wrong { border-color: rgb(220, 80, 60); background: rgba(255, 230, 225, 0.6); }
      .gate-choice-letter {
        width: 26px; height: 26px;
        border-radius: 50%;
        background: var(--cream-deep);
        font-size: 12px; font-weight: 700;
        color: var(--ink-700);
        display: grid; place-items: center;
        flex-shrink: 0;
      }
      .gate-choice.picked .gate-choice-letter { background: var(--peach-500); color: white; }
      .gate-choice.right .gate-choice-letter { background: rgb(74, 200, 120); color: white; }
      .gate-choice.wrong .gate-choice-letter { background: rgb(220, 80, 60); color: white; }
      .gate-result {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 16px;
        border-radius: 999px;
        font-size: 13px; font-weight: 500;
      }
      .gate-result.right { background: rgba(220,245,230,0.6); color: rgb(40, 130, 80); }
      .gate-result.wrong { background: rgba(255, 230, 225, 0.7); color: rgb(180, 50, 40); }
      .gate-result svg { width: 16px; height: 16px; }
    `}</style>
  );
}

// ============================================
// Default plan (Photosynthesis) so the pillar
// works without a Quick-Learning generated one.
// ============================================
const DEFAULT_PHOTO_PLAN = {
  title: 'Photosynthesis · 5-step path',
  totalMinutes: 32,
  milestones: [
    {
      id: 'm1',
      title: 'Why plants need light',
      summary: 'The big-picture problem photosynthesis solves.',
      minutes: 5,
      content: [
        { type: 'lead', text: 'Plants are alive. Like us, they need energy. Unlike us, they cannot eat.' },
        { type: 'p', text: 'Photosynthesis is the answer to a single question: how does a plant — stuck in one spot, with no mouth — get the energy it needs to grow, build leaves, and produce fruit?' },
        { type: 'callout', tag: 'Key idea', text: 'A leaf is a solar panel and a kitchen, fused into one tissue thinner than a sheet of paper.' },
        { type: 'p', text: 'In the next milestones, we will follow a single photon of sunlight all the way into a sugar molecule. By the end, you will be able to draw the entire process from memory.' },
      ],
      gateQuiz: {
        q: 'What core problem does photosynthesis solve for a plant?',
        choices: [
          { text: 'How to move toward sunlight.', correct: false },
          { text: 'How to obtain energy without being able to eat.', correct: true },
          { text: 'How to defend against insects.', correct: false },
        ],
      },
    },
    {
      id: 'm2',
      title: 'The two raw ingredients',
      summary: 'Water from below, CO₂ from above.',
      minutes: 6,
      content: [
        { type: 'lead', text: 'Photosynthesis takes two ordinary inputs and combines them into something extraordinary.' },
        { type: 'bullets', items: [
          'Water (H₂O) is pulled up from the soil by the roots, all the way into the leaves.',
          'Carbon dioxide (CO₂) drifts in through tiny pores called stomata on the underside of each leaf.',
          'Sunlight provides the energy that drives the reaction.',
        ] },
        { type: 'p', text: 'Notice that none of the inputs contain sugar. The plant is going to build sugar from scratch — using carbon atoms it has never met before.' },
      ],
      gateQuiz: {
        q: 'Where does the carbon in a plant\'s sugar ultimately come from?',
        choices: [
          { text: 'The water it drinks from the soil.', correct: false },
          { text: 'CO₂ in the air.', correct: true },
          { text: 'Minerals absorbed by the roots.', correct: false },
          { text: 'The sunlight itself.', correct: false },
        ],
      },
    },
    {
      id: 'm3',
      title: 'Light reactions — splitting water',
      summary: 'Sunlight is captured and water is broken apart.',
      minutes: 7,
      content: [
        { type: 'lead', text: 'Inside each chloroplast, stacks of green disks called thylakoids are packed with chlorophyll molecules — nature\'s antennas for sunlight.' },
        { type: 'p', text: 'When a photon hits chlorophyll, it bumps an electron up to a higher energy level. That excited electron is passed down a chain of proteins, like a baton in a relay race, and along the way its energy is used to do two crucial jobs:' },
        { type: 'bullets', items: [
          'Split water molecules into hydrogen and oxygen — the oxygen we breathe is a by-product.',
          'Build energy-carrying molecules called ATP and NADPH that will fuel the next stage.',
        ] },
        { type: 'callout', tag: 'Beautiful detail', text: 'Every breath you take contains oxygen released by a plant splitting water with sunlight.' },
      ],
      gateQuiz: {
        q: 'In the light reactions, water is split. What is released as a by-product?',
        choices: [
          { text: 'Carbon dioxide', correct: false },
          { text: 'Oxygen', correct: true },
          { text: 'Sugar', correct: false },
          { text: 'Nitrogen', correct: false },
        ],
      },
    },
    {
      id: 'm4',
      title: 'Calvin cycle — building sugar',
      summary: 'Carbon is captured and woven into glucose.',
      minutes: 8,
      content: [
        { type: 'lead', text: 'The light reactions handed us two things: stored chemical energy (ATP, NADPH) and a problem — what to do with all that captured carbon.' },
        { type: 'p', text: 'In the stroma — the watery space surrounding the thylakoids — an enzyme named RuBisCO grabs CO₂ molecules out of the air and clips them onto a 5-carbon sugar called RuBP. The resulting unstable molecule splits in two, kicking off a cycle that, after several turns, produces glucose.' },
        { type: 'callout', tag: 'Did you know', text: 'RuBisCO is the most abundant protein on Earth — roughly 1 kg of it exists per human alive today.' },
      ],
      gateQuiz: {
        q: 'Which enzyme captures CO₂ and starts the Calvin cycle?',
        choices: [
          { text: 'Chlorophyll', correct: false },
          { text: 'RuBisCO', correct: true },
          { text: 'ATP synthase', correct: false },
          { text: 'NADPH', correct: false },
        ],
      },
    },
    {
      id: 'm5',
      title: 'Putting it all together',
      summary: 'The whole equation, end to end.',
      minutes: 6,
      content: [
        { type: 'lead', text: '6 CO₂ + 6 H₂O + light  →  C₆H₁₂O₆ + 6 O₂' },
        { type: 'p', text: 'Six molecules of carbon dioxide, six of water, and a dose of sunlight produce one molecule of glucose plus six molecules of oxygen.' },
        { type: 'p', text: 'Every part of every plant — every leaf, every fruit, every grain of wheat — is built from atoms that arrived as CO₂ in the air, captured by chlorophyll, fixed by RuBisCO, and assembled into sugars in the Calvin cycle.' },
        { type: 'callout', tag: 'Take it with you', text: 'The next time you eat bread, remember: those carbohydrates were once carbon dioxide drifting through the sky.' },
      ],
      gateQuiz: {
        q: 'Roughly speaking, the overall photosynthesis equation is:',
        choices: [
          { text: 'CO₂ + sunlight → O₂', correct: false },
          { text: '6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂', correct: true },
          { text: 'C₆H₁₂O₆ + O₂ → CO₂ + H₂O', correct: false },
        ],
      },
    },
  ],
};

Object.assign(window, { RoadmapPillar, DEFAULT_PHOTO_PLAN });
