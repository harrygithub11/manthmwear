import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create support ticket
    const ticket = await prisma.supportticket.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'NEW'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Support ticket submitted successfully',
        ticketId: ticket.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SUPPORT_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit support ticket' },
      { status: 500 }
    )
  }
}
