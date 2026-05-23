'use client'
import { useState } from 'react'

export default function CoverLetter() {
  const [jd, setJd] = useState('')
  const [name, setName] = useState('')
  const [experience, setExperience] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!jd || !name) return alert('Please fill name and job description')
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, name, experience, tone })
      })
      const data = await res.json()
      setResult(data.letter)
    } catch (e) {
      alert('Something went wrong')
    }
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(result)
    alert('Copied to clipboard!')
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-4xl mx-auto">
      <a href="/dashboard" className="text-white/40 text-sm hover:text-white transition mb-8 block">← Back to Dashboard</a>
      <h1 className="text-4xl font-bold mb-2">Cover Letter Generator</h1>
      <p className="text-white/50 mb-10">Generate a personalized cover letter in 30 seconds.</p>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Your full name</label>
            <input
              type="text"
              placeholder="Amogh Bhatnagar"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-2 block">Tone</label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="professional" className="bg-black">Professional</option>
              <option value="conversational" className="bg-black">Conversational</option>
              <option value="enthusiastic" className="bg-black">Enthusiastic</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60 mb-2 block">Your experience summary</label>
          <textarea
            className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/30"
            placeholder="e.g. 2 years of React development, built 5 production apps, strong in JavaScript and REST APIs..."
            value={experience}
            onChange={e => setExperience(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-white/60 mb-2 block">Job Description</label>
          <textarea
            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/30"
            placeholder="Paste the full job description here..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Cover Letter →'}
      </button>

      {result && (
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">Your cover letter</p>
            <button
              onClick={copy}
              className="text-xs bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-full"
            >
              Copy →
            </button>
          </div>
          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </main>
  )
}