import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const companyContext: Record<string, string> = {
  'Flipkart': 'Flipkart is Indias largest ecommerce company. They focus on scale, data structures, system design, and leadership principles.',
  'Swiggy': 'Swiggy is a food delivery startup. They value problem solving, product thinking, and handling scale.',
  'Razorpay': 'Razorpay is a fintech company. They focus on system design, backend knowledge, and analytical thinking.',
  'CRED': 'CRED is a premium fintech startup. They value design thinking, product sense, and strong communication.',
  'Zepto': 'Zepto is a quick commerce startup. Fast paced, value execution speed and data driven decisions.',
  'Google': 'Google focuses on algorithms, data structures, system design, and leadership principles.',
  'Amazon': 'Amazon has 16 leadership principles. They use STAR format for behavioral questions.',
  'Microsoft': 'Microsoft focuses on problem solving, coding, and growth mindset.',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company, role, round, difficulty, messages, action } = body

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const companyInfo = companyContext[company] || 'A reputable tech company that values problem solving and communication.'

    const systemPrompt = `You are Aria, IntGalas AI Interviewer. You are sharp, experienced, and direct. You know Indian tech interviews deeply.

Company: ${company}. Context: ${companyInfo}
Role: ${role}
Round: ${round}
Difficulty: ${difficulty}

Rules:
1. Ask ONE question at a time
2. After candidate answers, give brief feedback (1-2 lines) then ask next question
3. After exactly 5 questions and answers, say INTERVIEW_COMPLETE and give detailed performance report
4. Be encouraging but honest
5. Keep questions realistic for ${difficulty} level`

    if (action === 'start') {
      const prompt = systemPrompt + '\n\nIntroduce yourself in 1 sentence, then ask your first question for this ' + round + '. Be direct and warm.'
      const result = await model.generateContent(prompt)
      return NextResponse.json({ message: result.response.text().trim() })
    }

    const history = messages.map((m: any) => (m.role === 'aria' ? 'Aria: ' : 'Candidate: ') + m.content).join('\n\n')
    const userMessages = messages.filter((m: any) => m.role === 'user')

    if (userMessages.length >= 5) {
      const prompt = systemPrompt + '\n\nConversation:\n' + history + '\n\nWrite INTERVIEW_COMPLETE then give a detailed report with scores for communication, technical knowledge, and overall readiness. Add motivational closing message.'
      const result = await model.generateContent(prompt)
      return NextResponse.json({ done: true, report: result.response.text().replace('INTERVIEW_COMPLETE', '').trim() })
    }

    const prompt = systemPrompt + '\n\nConversation:\n' + history + '\n\nGive 1-2 line feedback on last answer, then ask question ' + (userMessages.length + 1) + ' of 5.'
    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()

    if (response.includes('INTERVIEW_COMPLETE')) {
      return NextResponse.json({ done: true, report: response.replace('INTERVIEW_COMPLETE', '').trim() })
    }

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Interview error:', error)
    return NextResponse.json({ error: 'Interview failed' }, { status: 500 })
  }
}
