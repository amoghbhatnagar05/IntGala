import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, personality } = body

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const conversation = messages.map((m: any) =>
      (m.role === 'aria' ? 'Aria: ' : 'User: ') + m.content
    ).join('\n\n')

    const prompt = personality + '\n\nConversation so far:\n' + conversation + '\n\nNow respond as Aria to the last user message. Keep it short, punchy, and in character. Max 3 sentences unless more detail is genuinely needed.'

    const result = await model.generateContent(prompt)
    const message = result.response.text().trim()

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Aria error:', error)
    return NextResponse.json({ message: "ugh something broke on my end 😅 try again?" })
  }
}