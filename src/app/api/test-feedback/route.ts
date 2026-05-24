import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { question, userAnswer, correctAnswer, keywords } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a friendly interview coach. A candidate answered an interview question. Give them helpful feedback.

Question: ${question}

Candidate's Answer: ${userAnswer}

Correct Explanation: ${correctAnswer}

Key Concepts: ${keywords.join(', ')}

Give feedback in this format:
1. Start with what they got right (be encouraging)
2. Point out what was missing or wrong (be gentle, not harsh)
3. Highlight the key concepts they missed
4. Give a better way to answer this in an interview

Keep it short (4-5 sentences max). Use simple English. Be like a friendly mentor, not a strict teacher. Don't use bullet points, just natural conversational text.`

    const result = await model.generateContent(prompt)
    const feedback = result.response.text().trim()

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ feedback: 'Could not analyze your answer. Try again!' })
  }
}