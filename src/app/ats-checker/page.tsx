'use client'
import { useState } from 'react'

export default function ATSChecker() {
  const [cv, setCv] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function checkATS() {
    if (!cv || !jd) return alert('Please fill both fields')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cv, jobDescription: jd, userId: 'guest' })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      alert('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-5xl mx-auto">
      <a href="/" className="text-white/40 text-sm hover:text-white transition mb-8 block">← Back to IntGala</a>
      <h1 className="text-4xl font-bold mb-2">ATS CV Checker</h1>
      <p className="text-white/50 mb-10">Paste your CV and job description. Get your match score and fixes instantly.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-sm text-white/60 mb-2 block">Your CV</label>
          <textarea
            className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/30"
            placeholder="Paste your full CV text here..."
            value={cv}
            onChange={e => setCv(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-white/60 mb-2 block">Job Description</label>
          <textarea
            className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/30"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={checkATS}
        disabled={loading}
        className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Check my CV →'}
      </button>

      {result && (
        <div className="mt-10 space-y-6">
          {/* Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-white/50 text-sm mb-2">Match Score</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-bold">{result.match_score ?? '?'}</span>
              <span className="text-white/40 text-2xl mb-2">/100</span>
            </div>
            <div className="mt-4 h-2 bg-white/10 rounded-full">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: `${result.match_score}%` }}
              />
            </div>
            {result.verdict && <p className="text-white/50 text-sm mt-4">{result.verdict}</p>}
          </div>

          {/* Missing Keywords */}
          {result.missing_keywords?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-4">Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map((kw: string, i: number) => (
                  <span key={i} className="text-xs bg-red-500/20 text-red-300 border border-red-500/20 px-3 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Strong Points */}
          {result.strong_points?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-4">Strong Points</p>
              <ul className="space-y-2">
                {result.strong_points.map((p: string, i: number) => (
                  <li key={i} className="text-sm text-white/80 flex gap-2"><span className="text-green-400">✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-4">Suggestions to improve</p>
              <ul className="space-y-3">
                {result.suggestions.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-white/80 flex gap-2"><span className="text-yellow-400">→</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  )
}