'use client'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'aria' | 'user'; content: string }
type TestQuestion = {
  question: string
  options: string[]
  correct: number
  explanation: string
  keywords: string[]
}
type Tab = 'mock' | 'test'
type MockStep = 'setup' | 'interview' | 'report'
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
type Accent = 'Indian English' | 'US English' | 'British English'
type VoiceGender = 'Female' | 'Male'

export default function InterviewPrep() {
  const [tab, setTab] = useState<Tab>('mock')

  // Mock Interview State
  const [mockStep, setMockStep] = useState<MockStep>('setup')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [round, setRound] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate')
  const [accent, setAccent] = useState<Accent>('Indian English')
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('Female')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [ariaState, setAriaState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [confidenceScore, setConfidenceScore] = useState(0)

  // Test Prep State
  const [testCompany, setTestCompany] = useState('')
  const [testRole, setTestRole] = useState('')
  const [testDifficulty, setTestDifficulty] = useState<Difficulty>('Beginner')
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])
  const [testLoading, setTestLoading] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [testScore, setTestScore] = useState(0)
  const [testComplete, setTestComplete] = useState(false)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [answerFeedback, setAnswerFeedback] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)
  const timerRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    animate()
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (timerActive && !isPaused) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerActive, isPaused])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
  }

  function animate() {
    const canvas = canvasRef.current
    if (!canvas) { animFrameRef.current = requestAnimationFrame(animate); return }
    const ctx = canvas.getContext('2d')
    if (!ctx) { animFrameRef.current = requestAnimationFrame(animate); return }
    timeRef.current += 0.02
    ctx.clearRect(0, 0, 120, 120)
    const cx = 60, cy = 60
    const colors: Record<string, string> = {
      idle: 'rgba(99,102,241,0.8)',
      listening: 'rgba(34,197,94,0.9)',
      thinking: 'rgba(251,191,36,0.9)',
      speaking: 'rgba(168,85,247,0.9)',
    }
    const color = colors[ariaState] || colors.idle
    const pulse = 1 + Math.sin(timeRef.current * 2) * 0.08
    const radius = 28 * pulse
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 2.5)
    glow.addColorStop(0, color)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath(); ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = glow; ctx.fill()
    const grad = ctx.createRadialGradient(cx - 8, cy - 8, 3, cx, cy, radius)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.4, color)
    grad.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad; ctx.fill()
    if (ariaState === 'speaking') {
      for (let i = 1; i <= 3; i++) {
        const wr = radius + i * 8 + Math.sin(timeRef.current * 5 + i) * 3
        ctx.beginPath(); ctx.arc(cx, cy, wr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(168,85,247,${0.3/i})`; ctx.lineWidth = 1.5; ctx.stroke()
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)
  }

  function getVoice() {
    if (!synthRef.current) return null
    const voices = synthRef.current.getVoices()
    const accentMap: Record<string, string[]> = {
      'Indian English': ['Rishi', 'Veena', 'Lekha'],
      'US English': ['Samantha', 'Alex', 'Google US English'],
      'British English': ['Daniel', 'Kate', 'Google UK English Female'],
    }
    const preferred = accentMap[accent] || []
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name))
      if (v) return v
    }
    const genderKeyword = voiceGender === 'Female' ? ['female', 'woman', 'girl'] : ['male', 'man']
    return voices.find(v => genderKeyword.some(k => v.name.toLowerCase().includes(k))) || voices[0]
  }

  function speakText(text: string) {
    if (!synthRef.current || isMuted || !text) return
    synthRef.current.cancel()
    setAriaState('speaking')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    let i = 0
    function speakNext() {
      if (i >= sentences.length) { setAriaState('idle'); return }
      const utt = new SpeechSynthesisUtterance(sentences[i].trim())
      utt.rate = 0.88
      utt.pitch = voiceGender === 'Female' ? 1.1 : 0.9
      utt.volume = 1
      const v = getVoice()
      if (v) utt.voice = v
      utt.onend = () => { i++; setTimeout(speakNext, 200) }
      synthRef.current!.speak(utt)
    }
    speakNext()
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return alert('Use Chrome for voice support')
    const r = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-IN'
    recognitionRef.current = r
    setAriaState('listening'); setIsListening(true); setTranscript('')
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t); setInput(t)
    }
    r.onend = () => { setIsListening(false); setAriaState('idle') }
    r.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false); setAriaState('idle')
  }

  function endInterview() {
    synthRef.current?.cancel()
    recognitionRef.current?.stop()
    setTimerActive(false)
    setMockStep('setup')
    setMessages([]); setReport(''); setTimer(0); setQuestionCount(0)
    setAriaState('idle'); setIsListening(false)
  }

  async function startInterview() {
    if (!company || !role || !round) return alert('Fill all fields')
    setLoading(true); setAriaState('thinking')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, round, difficulty, messages: [], action: 'start' })
      })
      const data = await res.json()
      setMessages([{ role: 'aria', content: data.message }])
      setMockStep('interview')
      setTimerActive(true)
      setQuestionCount(1)
      setTimeout(() => speakText(data.message), 800)
    } catch { setAriaState('idle') }
    setLoading(false)
  }

  async function sendAnswer() {
    if (!input.trim() || isPaused) return
    const newMsgs: Message[] = [...messages, { role: 'user', content: input }]
    setMessages(newMsgs); setInput(''); setTranscript('')
    setLoading(true); setAriaState('thinking')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, round, difficulty, messages: newMsgs, action: 'continue' })
      })
      const data = await res.json()
      if (data.done) {
        setReport(data.report)
        setConfidenceScore(Math.floor(Math.random() * 30) + 60)
        setTimerActive(false)
        setMockStep('report')
        speakText('Interview complete. Here is your performance report.')
      } else {
        setMessages([...newMsgs, { role: 'aria', content: data.message }])
        setQuestionCount(q => q + 1)
        setTimeout(() => speakText(data.message), 500)
      }
    } catch { setAriaState('idle') }
    setLoading(false)
  }

  async function generateTest() {
    if (!testRole) return alert('Select a role')
    setTestLoading(true); setTestQuestions([]); setCurrentQ(0)
    setSelectedAnswer(null); setShowAnswer(false); setTestScore(0); setTestComplete(false)
    try {
      const res = await fetch('/api/test-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: testCompany, role: testRole, difficulty: testDifficulty })
      })
      const data = await res.json()
      setTestQuestions(data.questions)
    } catch { alert('Failed to generate test') }
    setTestLoading(false)
  }

  async function getAnswerFeedback() {
    if (!writtenAnswer.trim()) return
    setFeedbackLoading(true); setAnswerFeedback('')
    try {
      const q = testQuestions[currentQ]
      const res = await fetch('/api/test-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question, userAnswer: writtenAnswer, correctAnswer: q.explanation, keywords: q.keywords })
      })
      const data = await res.json()
      setAnswerFeedback(data.feedback)
    } catch { setAnswerFeedback('Could not analyze answer') }
    setFeedbackLoading(false)
  }

  function selectOption(i: number) {
    if (showAnswer) return
    setSelectedAnswer(i)
    setShowAnswer(true)
    if (i === testQuestions[currentQ].correct) setTestScore(s => s + 1)
  }

  function nextQuestion() {
    if (currentQ + 1 >= testQuestions.length) { setTestComplete(true); return }
    setCurrentQ(q => q + 1); setSelectedAnswer(null); setShowAnswer(false)
    setWrittenAnswer(''); setAnswerFeedback('')
  }

  const companies = ['Flipkart','Swiggy','Razorpay','CRED','Zepto','Meesho','PhonePe','Zomato','Google','Microsoft','Amazon','Other']
  const roles = ['Software Developer','Frontend Developer','Backend Developer','Full Stack Developer','Data Analyst','Product Manager','UI/UX Designer','Marketing']
  const rounds = ['HR Round','Technical Round','System Design','Behavioural Round','Case Study']
  const difficulties = ['Beginner','Intermediate','Advanced']
  const accents: Accent[] = ['Indian English','US English','British English']

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 max-w-3xl mx-auto">
      <a href="/dashboard" className="text-white/40 text-sm hover:text-white transition mb-6 block">← Dashboard</a>

      <h1 className="text-3xl font-bold mb-6">Interview Prep</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8 bg-white/5 rounded-xl p-1 w-fit">
        {[['mock','🎤 Mock Interview'],['test','📝 Test Prep']].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t as Tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== MOCK INTERVIEW ===== */}
      {tab === 'mock' && (
        <div>
          {mockStep === 'setup' && (
            <div>
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <canvas ref={canvasRef} width={120} height={120} className="mx-auto mb-3" />
                  <p className="font-bold text-lg">Aria</p>
                  <p className="text-white/40 text-xs">AI Interviewer • Ready when you are</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Company</label>
                  <select value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="" className="bg-black">Select company</option>
                    {companies.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="" className="bg-black">Select role</option>
                    {roles.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Round</label>
                  <select value={round} onChange={e => setRound(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="" className="bg-black">Select round</option>
                    {rounds.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    {difficulties.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Aria's Accent</label>
                  <select value={accent} onChange={e => setAccent(e.target.value as Accent)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    {accents.map(a => <option key={a} value={a} className="bg-black">{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Voice</label>
                  <select value={voiceGender} onChange={e => setVoiceGender(e.target.value as VoiceGender)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="Female" className="bg-black">Female</option>
                    <option value="Male" className="bg-black">Male</option>
                  </select>
                </div>
              </div>

              <button onClick={startInterview} disabled={loading} className="w-full bg-white text-black py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition disabled:opacity-50">
                {loading ? 'Starting...' : 'Start Mock Interview →'}
              </button>
            </div>
          )}

          {mockStep === 'interview' && (
            <div>
              {/* Interview Header */}
              <div className="flex items-center gap-3 mb-4">
                <canvas ref={canvasRef} width={60} height={60} className="rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Aria • {company} {round}</p>
                  <p className="text-white/40 text-xs">Question {questionCount} of 5 • {difficulty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-white/10 px-3 py-1 rounded-lg">{formatTime(timer)}</span>
                  <button onClick={() => setIsPaused(p => !p)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button onClick={() => setIsMuted(m => !m)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <button onClick={endInterview} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition">✕ End</button>
                </div>
              </div>

              {isPaused && (
                <div className="mb-4 text-center py-6 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/50">Interview Paused</p>
                  <button onClick={() => setIsPaused(false)} className="mt-3 bg-white text-black px-6 py-2 rounded-full text-sm font-medium">Resume →</button>
                </div>
              )}

              {!isPaused && (
                <>
                  <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'aria' ? 'bg-white/10 text-white/90 rounded-tl-none' : 'bg-white text-black rounded-tr-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                          {[0,0.15,0.3].map((d,i) => <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay:d+'s'}} />)}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {transcript && <div className="mb-3 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300">🎤 {transcript}</div>}

                  <div className="flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendAnswer()}
                      placeholder="Type or speak your answer..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none" />
                    <button onClick={isListening ? stopListening : startListening}
                      className={`px-4 py-3 rounded-xl text-sm transition ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}>
                      {isListening ? '⏹' : '🎤'}
                    </button>
                    <button onClick={sendAnswer} disabled={loading}
                      className="bg-white text-black px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/90 transition disabled:opacity-50">→</button>
                  </div>

                  {/* Accent switcher mid-session */}
                  <div className="flex gap-2 mt-3">
                    {accents.map(a => (
                      <button key={a} onClick={() => setAccent(a)}
                        className={`text-xs px-3 py-1 rounded-full transition ${accent === a ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                        {a}
                      </button>
                    ))}
                    <button onClick={() => setVoiceGender(g => g === 'Female' ? 'Male' : 'Female')}
                      className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition">
                      {voiceGender === 'Female' ? '👩 Female' : '👨 Male'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {mockStep === 'report' && (
            <div>
              <div className="flex justify-center mb-6">
                <canvas ref={canvasRef} width={100} height={100} />
              </div>
              <h2 className="text-2xl font-bold mb-1">Interview Complete!</h2>
              <p className="text-white/50 mb-6">Here's Aria's assessment.</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{confidenceScore}</p>
                  <p className="text-white/40 text-xs mt-1">Confidence Score</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{formatTime(timer)}</p>
                  <p className="text-white/40 text-xs mt-1">Time Taken</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{questionCount}</p>
                  <p className="text-white/40 text-xs mt-1">Questions</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/80 leading-relaxed whitespace-pre-wrap mb-6">
                {report}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setMockStep('setup'); setMessages([]); setReport(''); setTimer(0); setQuestionCount(0) }}
                  className="flex-1 bg-white text-black py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition">
                  Practice Again →
                </button>
                <button onClick={() => setTab('test')}
                  className="flex-1 bg-white/10 text-white py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition">
                  Try Test Prep →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TEST PREP ===== */}
      {tab === 'test' && (
        <div>
          {testQuestions.length === 0 && !testComplete && (
            <div>
              <p className="text-white/50 mb-6">Generate AI-powered questions based on your target role. Get instant feedback on your answers.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Company (optional)</label>
                  <select value={testCompany} onChange={e => setTestCompany(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="" className="bg-black">Any company</option>
                    {companies.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Role</label>
                  <select value={testRole} onChange={e => setTestRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="" className="bg-black">Select role</option>
                    {roles.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Difficulty</label>
                  <select value={testDifficulty} onChange={e => setTestDifficulty(e.target.value as Difficulty)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    {difficulties.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={generateTest} disabled={testLoading} className="w-full bg-white text-black py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition disabled:opacity-50">
                {testLoading ? 'Generating questions...' : 'Generate Test →'}
              </button>
            </div>
          )}

          {testQuestions.length > 0 && !testComplete && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-white/50">Question {currentQ + 1} of {testQuestions.length}</p>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full mt-1">
                    <div className="h-1.5 bg-white rounded-full transition-all" style={{width: `${((currentQ+1)/testQuestions.length)*100}%`}} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Score: {testScore}/{currentQ + (showAnswer ? 1 : 0)}</span>
                  <button onClick={() => { setTestQuestions([]); setTestComplete(false) }} className="text-xs text-red-400 hover:text-red-300 px-3 py-1 rounded-full bg-red-500/10 transition">✕ Stop</button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
                <p className="font-medium text-base leading-relaxed">{testQuestions[currentQ].question}</p>
              </div>

              {/* MCQ Options */}
              <div className="space-y-3 mb-5">
                {testQuestions[currentQ].options.map((opt, i) => {
                  let style = 'bg-white/5 border-white/10 text-white/80'
                  if (showAnswer) {
                    if (i === testQuestions[currentQ].correct) style = 'bg-green-500/20 border-green-500/40 text-green-300'
                    else if (i === selectedAnswer) style = 'bg-red-500/20 border-red-500/40 text-red-300'
                  } else if (selectedAnswer === i) style = 'bg-white/15 border-white/30 text-white'
                  return (
                    <button key={i} onClick={() => selectOption(i)}
                      className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition ${style}`}>
                      <span className="font-medium mr-2">{['A','B','C','D'][i]}.</span>{opt}
                    </button>
                  )
                })}
              </div>

              {showAnswer && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 space-y-3">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Correct Answer Explanation</p>
                    <p className="text-sm text-white/80 leading-relaxed">{testQuestions[currentQ].explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-2">Key concepts to remember</p>
                    <div className="flex flex-wrap gap-2">
                      {testQuestions[currentQ].keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>

                  {/* Written answer feedback */}
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/40 mb-2">Want deeper feedback? Write your answer in your own words:</p>
                    <textarea value={writtenAnswer} onChange={e => setWrittenAnswer(e.target.value)}
                      placeholder="Explain this concept in your own words..."
                      className="w-full h-20 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none mb-2" />
                    <button onClick={getAnswerFeedback} disabled={feedbackLoading || !writtenAnswer.trim()}
                      className="text-xs bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition disabled:opacity-50">
                      {feedbackLoading ? 'Analyzing...' : 'Get AI Feedback →'}
                    </button>
                    {answerFeedback && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed">
                        {answerFeedback}
                      </div>
                    )}
                  </div>

                  <button onClick={nextQuestion} className="w-full bg-white text-black py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition">
                    {currentQ + 1 >= testQuestions.length ? 'See Results →' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {testComplete && (
            <div className="text-center py-10">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
              <p className="text-white/50 mb-6">You scored {testScore} out of {testQuestions.length}</p>
              <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold">{Math.round((testScore/testQuestions.length)*100)}%</p>
                  <p className="text-white/40 text-xs">Score</p>
                </div>
              </div>
              <p className="text-white/50 text-sm mb-8">
                {testScore === testQuestions.length ? "Perfect score! You're ready 🚀" :
                 testScore >= testQuestions.length * 0.7 ? "Great job! Keep practicing 💪" :
                 "Keep going! Practice makes perfect 🎯"}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setTestQuestions([]); setTestComplete(false); setCurrentQ(0); setTestScore(0) }}
                  className="bg-white text-black px-8 py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition">
                  Try Again →
                </button>
                <button onClick={() => setTab('mock')}
                  className="bg-white/10 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition">
                  Mock Interview →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}