import { useState, useRef, useMemo } from 'react'
import { api } from '../services/api.js'
import { Ico } from './ui/Icons.jsx'

export default function MockTestPillar({ moduleId, liveModule, onUpdateMockTest }) {
  // Config view states
  const [file, setFile] = useState(null)
  const [maxMarks, setMaxMarks] = useState(20)
  const [distribution, setDistribution] = useState([
    { marks: 2, count: 3 },
    { marks: 4, count: 2 },
    { marks: 6, count: 1 }
  ])
  const [instructions, setInstructions] = useState('')
  const [topicName, setTopicName] = useState(liveModule?.topic || '')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  
  // Dynamic UI states
  const [generating, setGenerating] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState('')
  
  // Exam states
  const [userAnswers, setUserAnswers] = useState({})
  
  const fileInputRef = useRef(null)

  const activeTest = liveModule?.mock_test || null

  // Total marks in distribution
  const totalAllocatedMarks = useMemo(() => {
    return distribution.reduce((sum, d) => sum + (d.marks * d.count), 0)
  }, [distribution])

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === 'application/pdf') {
      if (selected.size > 10 * 1024 * 1024) {
        setError('Syllabus PDF file size exceeds the 10 MB limit.')
        return
      }
      setFile(selected)
      setError('')
    } else {
      setError('Please select a valid PDF file.')
    }
  }

  // Add questions row
  const addRow = () => {
    setDistribution([...distribution, { marks: 2, count: 1 }])
  }

  // Remove questions row
  const removeRow = (idx) => {
    const updated = distribution.filter((_, i) => i !== idx)
    setDistribution(updated)
  }

  // Update row details
  const updateRow = (idx, field, value) => {
    const updated = distribution.map((d, i) => {
      if (i === idx) {
        return { ...d, [field]: parseInt(value) || 0 }
      }
      return d
    })
    setDistribution(updated)
  }

  // Validate configuration before submission
  const validateConfig = () => {
    if (!file && !topicName.trim()) {
      return 'Please upload a syllabus PDF or enter a topic name.'
    }
    if (totalAllocatedMarks !== maxMarks) {
      return `Total marks allocated in distribution (${totalAllocatedMarks}) must equal Max Marks (${maxMarks}).`
    }
    // Check restricted question marks < Max Marks / 2
    for (const d of distribution) {
      if (d.marks >= maxMarks / 2) {
        return `Question marks (${d.marks}) must be less than half of Max Marks (${maxMarks / 2}).`
      }
    }
    return ''
  }

  // Trigger Mock Test Generation
  const handleGenerate = async () => {
    const err = validateConfig()
    if (err) {
      setError(err)
      return
    }

    setError('')
    setGenerating(true)

    try {
      const form = new FormData()
      if (file) {
        form.append('files', file)
      }
      form.append('maxMarks', maxMarks)
      form.append('distribution', JSON.stringify(distribution))
      form.append('instructions', instructions ? `${instructions} (Difficulty Level: ${selectedDifficulty})` : `(Difficulty Level: ${selectedDifficulty})`)
      if (moduleId) form.append('moduleId', moduleId)
      form.append('topic', topicName)
      form.append('persona', JSON.stringify(liveModule?.persona || { grade: 'College', interest: 'everyday life' }))

      // Call express endpoint via base fetch to support FormData multipart
      const token = localStorage.getItem('ami_token')
      const baseUrl = (import.meta.env.VITE_API_URL ?? '') + '/api'
      const response = await fetch(`${baseUrl}/mock-test/generate`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate mock test')
      }

      onUpdateMockTest(data)
      setUserAnswers({})
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Handle Exam Submission
  const handleSubmitExam = async () => {
    setEvaluating(true)
    setError('')

    try {
      const evaluated = await api.evaluateMockTest({
        moduleId,
        userAnswers
      })
      onUpdateMockTest(evaluated)
    } catch (err) {
      setError(err.message || 'Evaluation failed. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  // Reset exam to take it again
  const handleResetExam = () => {
    onUpdateMockTest(null)
    setUserAnswers({})
    setFile(null)
    setError('')
  }

  // Render Loader View
  if (generating) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--lav-300)', borderTopColor: 'var(--lav-500)', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 24px' }}/>
        <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 20, color: 'var(--ink-900)' }}>Generating your custom question paper…</h3>
        <p className="muted" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.6 }}>
          AMI is analyzing the syllabus, building step-marked rubrics, and generating optimal model answers.
        </p>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-500)', background: 'var(--lav-50)', padding: '6px 14px', borderRadius: 999 }}>
          ⚡ This will take about 15-20 seconds
        </span>
      </div>
    )
  }

  // Render Config View (Mode A: Syllabus / Parameters config)
  if (!activeTest) {
    return (
      <div style={{ padding: '32px 48px 48px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span className="subject-chip" style={{ background: 'var(--lav-50)', color: 'var(--lav-500)', border: '1px solid var(--lav-200)' }}>
            <Ico.Target style={{ width: 14, height: 14 }}/> Custom Mock Test
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>AI Question Paper & Step-Marking Generator</h2>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(226,106,92,0.08)', border: '1px solid var(--error)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--error)', marginBottom: 20, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. PDF File Uploader */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
              Upload Syllabus PDF
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--ink-200)',
                borderRadius: 'var(--r-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? 'rgba(79,176,122,0.05)' : 'var(--cream)',
                borderColor: file ? 'var(--success)' : 'var(--ink-200)',
                transition: 'all 0.2s ease'
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange}/>
              <Ico.Upload style={{ width: 28, height: 28, color: file ? 'var(--success)' : 'var(--ink-400)', margin: '0 auto 10px' }}/>
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--success)', margin: 0 }}>✓ {file.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: '4px 0 0' }}>Click to change file</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink-600)', margin: 0 }}>Drag & drop or browse PDF syllabus</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: '4px 0 0' }}>Ingests syllabus topics, categories, and difficulty levels</p>
                </div>
              )}
            </div>
          </div>

          {/* 1b. Topic fallback name */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
              Topic Name (Fallback / Search term)
            </label>
            <input 
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Photosynthesis, Cellular Respiration"
              style={{ width: '100%', height: 44, padding: '0 14px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink-900)', outline: 'none' }}
            />
          </div>

          {/* 2. Max Marks & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
                Max Marks
              </label>
              <input 
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 0)}
                style={{ width: '100%', height: 44, padding: '0 14px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink-900)', outline: 'none', fontWeight: 600 }}
              />
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>
                  Allocated: <strong style={{ color: totalAllocatedMarks === maxMarks ? 'var(--success)' : 'var(--error)' }}>{totalAllocatedMarks}</strong> / {maxMarks} marks
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
                Difficulty Level
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDifficultyOpen(!difficultyOpen)}
                  style={{ width: '100%', height: 44, padding: '0 14px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink-900)', outline: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: selectedDifficulty === 'Easy' ? 'var(--success)' : selectedDifficulty === 'Medium' ? 'var(--info)' : 'var(--error)' }}/>
                    {selectedDifficulty}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {difficultyOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, padding: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDifficulty(d)
                          setDifficultyOpen(false)
                        }}
                        style={{ padding: '8px 12px', fontSize: 13.5, border: 'none', background: selectedDifficulty === d ? 'var(--lav-50)' : 'transparent', color: selectedDifficulty === d ? 'var(--lav-600)' : 'var(--ink-700)', textAlign: 'left', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Questions Distribution Grid */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
              Marks Distribution Grid
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {distribution.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-500)', minWidth: 44 }}>Marks:</span>
                    <input 
                      type="number" 
                      value={d.marks} 
                      onChange={(e) => updateRow(idx, 'marks', e.target.value)}
                      style={{ width: '100%', height: 38, padding: '0 12px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 13.5, outline: 'none' }}
                    />
                    {d.marks >= maxMarks / 2 && (
                      <span style={{ color: 'var(--error)', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Must be &lt; {maxMarks / 2}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-500)', minWidth: 44 }}>Qty:</span>
                    <input 
                      type="number" 
                      value={d.count} 
                      onChange={(e) => updateRow(idx, 'count', e.target.value)}
                      style={{ width: '100%', height: 38, padding: '0 12px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 13.5, outline: 'none' }}
                    />
                  </div>
                  <button 
                    onClick={() => removeRow(idx)}
                    disabled={distribution.length <= 1}
                    style={{ width: 34, height: 34, borderRadius: '50%', background: 'transparent', color: 'var(--error)', display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none', opacity: distribution.length <= 1 ? 0.3 : 1 }}
                  >
                    <Ico.Close style={{ width: 16, height: 16 }}/>
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={addRow}
              style={{ marginTop: 12, padding: '6px 14px', borderRadius: 999, border: '1.5px dashed var(--lav-300)', color: 'var(--lav-500)', background: 'transparent', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Ico.Plus style={{ width: 12, height: 12 }}/> Add question rule
            </button>
          </div>

          {/* 4. Instructions Box */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
              Instructions / Specific Formatting Rules (Optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. for topic X generate question worth marks Y..."
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ink-100)', borderRadius: 'var(--r-md)', background: 'var(--cream)', fontSize: 14, color: 'var(--ink-900)', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--ink-100)', paddingTop: 20 }}>
            <button 
              onClick={handleGenerate}
              className="pill pill-primary"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              <Ico.Sparkle/> Compile Custom Exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Result View (Score comparison and step evaluation feedback)
  if (activeTest.isEvaluated) {
    const percent = Math.round((activeTest.score / activeTest.maxMarks) * 100)
    return (
      <div style={{ padding: '32px 48px 48px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <span style={{ fontSize: 52 }}>🎯</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--ink-900)' }}>Exam Evaluation Complete</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: percent >= 75 ? 'rgba(79,176,122,0.1)' : 'rgba(255,148,102,0.1)',
              color: percent >= 75 ? 'var(--success)' : 'var(--peach-500)',
              display: 'grid', placeItems: 'center',
              fontSize: 22, fontWeight: 800,
              border: `2.5px solid ${percent >= 75 ? 'var(--success)' : 'var(--peach-400)'}`
            }}>
              {percent}%
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-900)' }}>
                You scored {activeTest.score} / {activeTest.maxMarks} marks
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 4 }}>
                Review step-by-step grader markings and suggested answers below.
              </div>
            </div>
          </div>
        </div>

        {/* List of graded questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
          {activeTest.questions.map((q, idx) => {
            const obtained = q.evaluation?.marksObtained || 0
            const qPercent = Math.round((obtained / q.marks) * 100)
            return (
              <div key={q.id} style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, borderBottom: '1px solid var(--ink-100)', paddingBottom: 14, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase' }}>Question {idx + 1}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 0', color: 'var(--ink-900)' }}>{q.question}</h3>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: qPercent >= 75 ? 'var(--success)' : 'var(--peach-500)', background: 'var(--paper)', padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {obtained} / {q.marks} marks
                  </span>
                </div>

                {/* Student answer */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', display: 'block', marginBottom: 4 }}>Your Answer</span>
                  <div style={{ fontSize: 14, color: 'var(--ink-800)', padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--ink-300)', whiteSpace: 'pre-wrap' }}>
                    {q.userAnswer || <em>(No Answer Provided)</em>}
                  </div>
                </div>

                {/* Step grading feedback */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>Step-by-Step Marking Breakdown</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.evaluation?.stepGrades?.map((sg, sgIdx) => {
                      const baseStep = q.stepMarking[sgIdx] || { marks: 0 }
                      return (
                        <div key={sgIdx} style={{ display: 'flex', gap: 12, background: 'var(--paper)', padding: 12, borderRadius: 'var(--r-md)', border: '1px solid var(--ink-100)', fontSize: 13 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--cream-deep)', color: 'var(--ink-600)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {sgIdx + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{sg.step}</div>
                            <div style={{ color: 'var(--ink-600)', marginTop: 4, fontStyle: 'italic' }}>{sg.feedback}</div>
                          </div>
                          <span style={{ fontWeight: 700, color: sg.marksObtained >= baseStep.marks ? 'var(--success)' : 'var(--peach-500)', whiteSpace: 'nowrap' }}>
                            {sg.marksObtained} / {baseStep.marks}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* suggested Answer */}
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', display: 'block', marginBottom: 4 }}>Suggested Model Answer</span>
                  <div style={{ fontSize: 14, color: 'var(--ink-700)', padding: '12px 14px', background: 'rgba(79,176,122,0.04)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--success)', whiteSpace: 'pre-wrap' }}>
                    {q.suggestedAnswer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action footer */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={handleResetExam} className="pill pill-ghost">
            <Ico.ArrowLeft/> Reset & Take New Exam
          </button>
        </div>
      </div>
    )
  }

  // Render Exam View (Student answering the question paper)
  return (
    <div style={{ padding: '32px 48px 48px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--ink-100)', paddingBottom: 14 }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--lav-500)' }}>Exam Mode</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 0', color: 'var(--ink-900)' }}>{activeTest.topic}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Difficulty Level Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setDifficultyOpen(!difficultyOpen)}
              style={{ padding: '6px 14px', fontSize: 13, background: 'var(--paper)', border: '1.5px solid var(--ink-100)', borderRadius: 999, color: 'var(--ink-700)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
            >
              <span style={{ 
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%', 
                background: selectedDifficulty === 'Easy' ? 'var(--success)' : selectedDifficulty === 'Medium' ? 'var(--info)' : 'var(--error)' 
              }}/>
              Difficulty: {selectedDifficulty} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {difficultyOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--paper)', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, padding: 4, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDifficulty(d);
                      setDifficultyOpen(false);
                    }}
                    style={{ padding: '6px 12px', fontSize: 13, border: 'none', background: selectedDifficulty === d ? 'var(--lav-50)' : 'transparent', color: selectedDifficulty === d ? 'var(--lav-600)' : 'var(--ink-700)', textAlign: 'left', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)', background: 'var(--cream-deep)', padding: '6px 12px', borderRadius: 999 }}>
            Total Marks: {activeTest.maxMarks}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,106,92,0.08)', border: '1px solid var(--error)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--error)', marginBottom: 20, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* List of interactive questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 36 }}>
        {activeTest.questions.map((q, idx) => (
          <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--ink-900)', lineHeight: 1.4 }}>
                {idx + 1}. {q.question}
              </h3>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lav-500)', background: 'var(--lav-50)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                {q.marks} Marks
              </span>
            </div>

            {/* Step marking instructions guide to direct learner */}
            <div style={{ background: 'var(--cream-deep)', borderRadius: 'var(--r-md)', padding: 12, fontSize: 12.5, borderLeft: '3px solid var(--lav-300)' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-600)', display: 'block', marginBottom: 4 }}>Step-marking breakdown:</span>
              <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--ink-500)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {q.stepMarking.map((sm, smIdx) => (
                  <li key={smIdx}>{sm.step} ({sm.marks} {sm.marks === 1 ? 'mark' : 'marks'})</li>
                ))}
              </ul>
            </div>

            {/* Suggested Answer Key directly rendered */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px', background: 'rgba(79,176,122,0.03)', borderRadius: 'var(--r-md)', borderLeft: '3.5px solid var(--success)', marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Model Answer ({q.marks} Marks)</span>
              <p style={{ fontSize: 14, color: 'var(--ink-800)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {q.suggestedAnswer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', borderTop: '1px solid var(--ink-100)', paddingTop: 24, marginTop: 12 }}>
        <button 
          onClick={handleResetExam}
          className="pill pill-ghost"
          style={{ padding: '12px 24px', fontSize: 14, background: 'var(--lav-50)', color: 'var(--lav-600)', border: '1.5px solid var(--lav-200)', borderRadius: 999, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--lav-100)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--lav-50)' }}
        >
          <Ico.ArrowLeft/> Reset & Compile New Exam
        </button>
      </div>
    </div>
  )
}
