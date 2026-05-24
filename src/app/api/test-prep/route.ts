import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { company, role, difficulty } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Generate 5 multiple choice questions for a ${difficulty} level ${role} interview${company ? ' at ' + company : ''}.

Return ONLY a valid JSON array. No markdown. No backticks. No explanation.

Format:
[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "detailed explanation in simple English",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

Rules:
- correct is the index (0-3) of the correct option
- Mix technical and conceptual questions
- Use simple clear English
- Beginner friendly explanations
- Realistic interview questions`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const questions = JSON.parse(clean)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Test prep error:', error)
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}