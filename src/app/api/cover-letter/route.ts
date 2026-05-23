import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jobDescription, name, experience, tone } = body

    if (!jobDescription || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = 'Write a ' + tone + ' cover letter for ' + name + ' applying for this job. Experience: ' + experience + '. Job Description: ' + jobDescription + '. Write only the cover letter text, no subject line, no extra explanation. Make it personal, specific to the job, and under 300 words.'

    const result = await model.generateContent(prompt)
    const letter = result.response.text().trim()

    return NextResponse.json({ letter })
  } catch (error) {
    console.error('Cover letter error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}