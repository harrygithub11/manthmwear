import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.newslettersubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        await prisma.newslettersubscriber.update({
          where: { email },
          data: { isActive: true }
        })
        return NextResponse.json(
          { success: true, message: 'Subscription reactivated' },
          { status: 200 }
        )
      }
    }

    // Create new subscriber
    await prisma.newslettersubscriber.create({
      data: { email }
    })

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[NEWSLETTER_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
