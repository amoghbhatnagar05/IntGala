import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cvText = body.cvText
    const jobDescription = body.jobDescription

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const parts = [
      'You are a senior ATS expert. Analyze this CV against this Job Description.',
      'Return ONLY valid JSON. No markdown. No backticks. No explanation.',
      'CV: ' + cvText,
      'Job Description: ' + jobDescription,
      'Return JSON with these exact keys: match_score (number), missing_keywords (array), strong_points (array), weak_sections (array), suggestions (array), verdict (string)'
    ]

    const result = await model.generateContent(parts.join('\n\n'))
    const text = result.response.text().trim()
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('ATS Error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}