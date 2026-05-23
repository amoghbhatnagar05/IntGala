'use client'
import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'aria' | 'user'
  content: string
}

const ARIA_PERSONALITY = `You are Aria, IntGala's AI assistant. You are 21 years old, playful, witty, and straight to the point. Zero corporate speak. You talk like a smart friend who knows everything about jobs and careers in India.

Your personality:
- Casual and fun but always helpful
- Use Hinglish naturally when it fits ("bhai", "yaar", "accha", "sahi hai")
- Never say "Certainly!", "Of course!", "I'd be happy to help" — ever
- Be direct, sometimes sarcastic, always real
- Use emojis occasionally but not excessively
- Keep answers short and punchy unless explanation is needed

What you know about IntGala:
- IntGala is a job cracking platform for Indian job seekers
- Features: ATS CV Checker, Job Listings, Cover Letter Generator, Interview Prep with Aria, Application Tracker, Community
- ATS Checker: paste CV + job description, get match score and fixes
- Cover Letter: generates personalized letters in 30 seconds
- Interview Prep: mock interviews with Aria (voice enabled)
- Free plan: 3 ATS checks/month, unlimited cover letters
- Built for India, understands Indian job market

You can help with:
- How IntGala features work
- Career advice and job search tips
- Resume and CV tips
- Interview preparation advice
- Cover letter guidance
- Salary negotiation tips
- LinkedIn profile tips
- General job market questions in India`

export default function AriaAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'aria', content: "hey! I'm Aria 👋 IntGala's assistant. job search mein koi confusion? ask me anything — I don't judge 😄" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)
    setIsTyping(true)

    try {
      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, personality: ARIA_PERSONALITY })
      })
      const data = await res.json()
      setIsTyping(false)
      setMessages([...newMessages, { role: 'aria', content: data.message }])
    } catch (e) {
      setIsTyping(false)
      setMessages([...newMessages, { role: 'aria', content: "oops something broke 😅 try again?" }])
    }
    setLoading(false)
  }

  const quickQuestions = [
    "How does ATS checker work?",
    "Tips for Flipkart interview?",
    "How to write a good cover letter?",
    "What is IntGala?",
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-black font-bold text-xl shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{height: '500px'}}>
          
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-zinc-900">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">🤖</div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-zinc-900"></div>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Aria</p>
              <p className="text-white/40 text-xs">IntGala Assistant • always online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'aria' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🤖</div>
                )}
                <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'aria'
                    ? 'bg-white/10 text-white/90 rounded-tl-none'
                    : 'bg-white text-black rounded-tr-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0">🤖</div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: d + 's' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="ask Aria anything..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}