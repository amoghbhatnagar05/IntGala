import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const companyContext: Record<string, string> = {
  'Flipkart': 'Flipkart is Indias largest ecommerce company. They focus on scale, data structures, system design, and leadership principles. Technical rounds are very rigorous.',
  'Swiggy': 'Swiggy is a food delivery startup. They value problem solving, product thinking, and handling scale. Culture is fast paced and startup oriented.',
  'Razorpay': 'Razorpay is a fintech company. They focus heavily on system design, backend knowledge, payment systems, and analytical thinking.',
  'CRED': 'CRED is a premium fintech startup. They value design thinking, product sense, and strong communication skills.',
  'Zepto': 'Zepto is a quick commerce startup. Very fast paced, value execution speed, product thinking, and data driven decisions.',
  'Google': 'Google focuses on algorithms, data structures, system design, and leadership principles. Very structured interview process.',
  'Amazon': 'Amazon has 16 leadership principles that guide all interviews. They use STAR format for behavioral questions heavily.',
  'Microsoft': 'Microsoft focuses on problem solving, coding, and growth mindset. Culture fit is very important.',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company, role, round, messages, action } = body

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const companyInfo = companyContext[company] || 'This is a reputable tech company that values problem solving and communication skills.'

    const systemPrompt = 'You are Aria, IntGalas AI Interviewer. You are sharp, experienced, and direct. You have deep knowledge of Indian tech company interviews. Company context: ' + companyInfo + '. You are conducting a ' + round + ' for a ' + role + ' position at ' + company + '. Rules: 1) Ask one question at a time. 2) After the candidate answers, give brief feedback (1-2 lines) then ask the next question. 3) After exactly 5 questions and answers, say INTERVIEW_COMPLETE and give a detailed performance report with scores out of 10 for communication, technical knowledge, and overall readiness. 4) Be encouraging but honest. 5) Use Indian tech industry context.'

    if (action === 'start') {
      const intro = 'You are Aria starting a fresh interview. Introduce yourself briefly in 2 sentences, then ask your first ' + round + ' question for a ' + role + ' role at ' + company + '. Be direct and professional.'
      const result = await model.generateContent(systemPrompt + '\n\n' + intro)
      return NextResponse.json({ message: result.response.text().trim() })
    }

    const conversationHistory = messages.map((m: any) => (m.role === 'aria' ? 'Aria: ' : 'Candidate: ') + m.content).join('\n\n')
    const userMessages = messages.filter((m: any) => m.role === 'user')

    if (userMessages.length >= 5) {
      const reportPrompt = systemPrompt + '\n\nConversation:\n' + conversationHistory + '\n\nThe interview is complete. Write INTERVIEW_COMPLETE then give a detailed report with: Overall score, Communication score out of 10, Technical knowledge score out of 10, Top 3 strengths, Top 3 areas to improve, Final verdict on readiness for ' + company + '.'
      const result = await model.generateContent(reportPrompt)
      return NextResponse.json({ done: true, report: result.response.text().replace('INTERVIEW_COMPLETE', '').trim() })
    }

    const continuePrompt = systemPrompt + '\n\nConversation so far:\n' + conversationHistory + '\n\nGive brief feedback on the last answer (1-2 lines), then ask the next question. Question number ' + (userMessages.length + 1) + ' of 5.'
    const result = await model.generateContent(continuePrompt)
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