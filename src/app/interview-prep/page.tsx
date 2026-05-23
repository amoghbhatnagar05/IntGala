'use client'
import { useState, useEffect, useRef } from 'react'

type Message = {
  role: 'aria' | 'user'
  content: string
}

export default function InterviewPrep() {
  const [step, setStep] = useState<'setup' | 'interview' | 'report'>('setup')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [round, setRound] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [ariaState, setAriaState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [fillerCount, setFillerCount] = useState(0)
  const [detectedLang, setDetectedLang] = useState('English')
  const [amplitude, setAmplitude] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<any[]>([])
  const timeRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    initParticles()
    animate()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function initParticles() {
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  }

  function animate() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    timeRef.current += 0.02

    ctx.clearRect(0, 0, 300, 300)
    const cx = 150, cy = 150

    // Draw neurons
    particlesRef.current.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > 300) p.vx *= -1
      if (p.y < 0 || p.y > 300) p.vy *= -1

      particlesRef.current.forEach(p2 => {
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 60) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 60)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      })

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
      ctx.fill()
    })

    // Glow color based on state
    const colors: Record<string, string[]> = {
      idle: ['rgba(99,102,241,0.8)', 'rgba(99,102,241,0)'],
      listening: ['rgba(34,197,94,0.9)', 'rgba(34,197,94,0)'],
      thinking: ['rgba(251,191,36,0.9)', 'rgba(251,191,36,0)'],
      speaking: ['rgba(168,85,247,0.9)', 'rgba(168,85,247,0)'],
    }

    const [innerColor, outerColor] = colors[ariaState] || colors.idle
    const pulse = 1 + Math.sin(timeRef.current * 2) * 0.08
    const ampBoost = ariaState === 'listening' ? amplitude * 20 : 0
    const radius = (55 + ampBoost) * pulse

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2)
    glow.addColorStop(0, innerColor)
    glow.addColorStop(1, outerColor)
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    // Main ball
    const grad = ctx.createRadialGradient(cx - 15, cy - 15, 5, cx, cy, radius)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.3, innerColor)
    grad.addColorStop(1, 'rgba(0,0,0,0.8)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    // Speaking wave rings
    if (ariaState === 'speaking') {
      for (let i = 1; i <= 3; i++) {
        const waveR = radius + i * 15 + Math.sin(timeRef.current * 4 + i) * 5
        ctx.beginPath()
        ctx.arc(cx, cy, waveR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(168,85,247,${0.3 / i})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Listening waveform
    if (ariaState === 'listening') {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const waveAmp = radius + 10 + Math.sin(timeRef.current * 6 + i) * (5 + amplitude * 30)
        const x1 = cx + Math.cos(angle) * radius
        const y1 = cy + Math.sin(angle) * radius
        const x2 = cx + Math.cos(angle) * waveAmp
        const y2 = cy + Math.sin(angle) * waveAmp
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = 'rgba(34,197,94,0.6)'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }

  function speakText(text: string) {
    if (!synthRef.current) return
    synthRef.current.cancel()
    setAriaState('speaking')
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.95
    utt.pitch = 1.1
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
    if (preferred) utt.voice = preferred
    utt.onend = () => setAriaState('idle')
    synthRef.current.speak(utt)
  }

  function detectLanguage(text: string) {
    const hindiWords = ['hai', 'hain', 'mein', 'main', 'kya', 'aur', 'nahi', 'toh', 'bhi', 'yeh', 'woh']
    const words = text.toLowerCase().split(' ')
    const hindiCount = words.filter(w => hindiWords.includes(w)).length
    if (hindiCount > 2) setDetectedLang('Hinglish')
    else if (hindiCount > 0) setDetectedLang('Hinglish')
    else setDetectedLang('English')
  }

  function countFillers(text: string) {
    const fillers = ['umm', 'um', 'uh', 'basically', 'you know', 'like', 'kind of', 'sort of']
    const count = fillers.reduce((acc, f) => acc + (text.toLowerCase().split(f).length - 1), 0)
    setFillerCount(prev => prev + count)
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Speech recognition not supported. Use Chrome.')
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognitionRef.current = recognition
    setAriaState('listening')
    setIsListening(true)
    setTranscript('')

    // Amplitude simulation
    const interval = setInterval(() => {
      setAmplitude(Math.random() * 0.5 + 0.1)
    }, 100)

    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
      setInput(t)
      detectLanguage(t)
    }
    recognition.onend = () => {
      setIsListening(false)
      setAriaState('idle')
      setAmplitude(0)
      clearInterval(interval)
    }
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
    setAriaState('idle')
  }

  async function startInterview() {
    if (!company || !role || !round) return alert('Please fill all fields')
    setLoading(true)
    setAriaState('thinking')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, round, messages: [], action: 'start' })
      })
      const data = await res.json()
      setMessages([{ role: 'aria', content: data.message }])
      setStep('interview')
      setTimeout(() => speakText(data.message), 500)
    } catch (e) {
      alert('Something went wrong')
      setAriaState('idle')
    }
    setLoading(false)
  }

  async function sendAnswer() {
    if (!input.trim()) return
    countFillers(input)
    const newMessages: Message[] = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setTranscript('')
    setLoading(true)
    setAriaState('thinking')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, round, messages: newMessages, action: 'continue' })
      })
      const data = await res.json()
      if (data.done) {
        setReport(data.report)
        setStep('report')
        speakText('Interview complete. Here is your performance report.')
      } else {
        setMessages([...newMessages, { role: 'aria', content: data.message }])
        speakText(data.message)
      }
    } catch (e) {
      alert('Something went wrong')
      setAriaState('idle')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-3xl mx-auto">
      <a href="/dashboard" className="text-white/40 text-sm hover:text-white transition mb-8 block">← Back to Dashboard</a>

      {step === 'setup' && (
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} width={300} height={300} className="mb-6" />
          <h1 className="text-4xl font-bold mb-2 text-center">Meet Aria</h1>
          <p className="text-white/50 mb-10 text-center max-w-md">IntGala's AI Interviewer with voice. Trained on real Indian tech interviews. She listens, speaks, and prepares you to crack it.</p>

          <div className="w-full space-y-4 mb-8">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Target company</label>
              <select value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="" className="bg-black">Select company</option>
                {['Flipkart','Swiggy','Razorpay','CRED','Zepto','Meesho','PhonePe','Paytm','Zomato','Google','Microsoft','Amazon','Other Startup','Other MNC'].map(c => (
                  <option key={c} value={c} className="bg-black">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="" className="bg-black">Select role</option>
                {['Software Developer','Frontend Developer','Backend Developer','Full Stack Developer','Data Analyst','Product Manager','UI/UX Designer','Marketing'].map(r => (
                  <option key={r} value={r} className="bg-black">{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Round type</label>
              <select value={round} onChange={e => setRound(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="" className="bg-black">Select round</option>
                {['HR Round','Technical Round','System Design','Behavioural Round','Case Study'].map(r => (
                  <option key={r} value={r} className="bg-black">{r}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={startInterview} disabled={loading} className="bg-white text-black px-10 py-4 rounded-full font-semibold text-sm hover:bg-white/90 transition disabled:opacity-50">
            {loading ? 'Starting...' : 'Start Interview with Aria →'}
          </button>
        </div>
      )}

      {step === 'interview' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <canvas ref={canvasRef} width={100} height={100} className="rounded-full" />
            <div>
              <p className="font-bold text-lg">Aria</p>
              <p className="text-white/40 text-xs">{company} • {role} • {round}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{detectedLang}</span>
                {fillerCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">{fillerCount} fillers</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">{ariaState}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'aria' ? 'bg-white/10 text-white/90 rounded-tl-none' : 'bg-white text-black rounded-tr-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0,0.1,0.2].map((d,i) => <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay: d+'s'}} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {transcript && (
            <div className="mb-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-300">
              🎤 {transcript}
            </div>
          )}

          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAnswer()}
              placeholder="Type or speak your answer..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isListening ? '⏹ Stop' : '🎤 Speak'}
            </button>
            <button onClick={sendAnswer} disabled={loading} className="bg-white text-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-white/90 transition disabled:opacity-50">
              Send
            </button>
          </div>
          <p className="text-white/20 text-xs text-center">Aria asks 5 questions then gives your full report</p>
        </div>
      )}

      {step === 'report' && (
        <div>
          <div className="flex justify-center mb-8">
            <canvas ref={canvasRef} width={150} height={150} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Interview Report</h2>
          <p className="text-white/50 mb-6">Aria's assessment of your performance.</p>
          <div className="flex gap-3 mb-6">
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/10">{detectedLang} detected</span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-300">{fillerCount} filler words</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/80 leading-relaxed whitespace-pre-wrap mb-6">
            {report}
          </div>
          <button onClick={() => { setStep('setup'); setMessages([]); setReport(''); setFillerCount(0); setAriaState('idle') }} className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition">
            Practice Again →
          </button>
        </div>
      )}
    </main>
  )
}