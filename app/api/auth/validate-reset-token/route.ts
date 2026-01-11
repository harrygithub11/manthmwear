import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token hasn't expired
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token is valid' 
    })
  } catch (error) {
    console.error('[VALIDATE_TOKEN_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
