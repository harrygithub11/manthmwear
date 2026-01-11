import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Delete old sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id }
    })

    // Create new session
    const sessionToken = randomUUID()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30) // 30 days

    await prisma.session.create({
      data: {
        id: randomUUID().replace(/-/g, ''),
        sessionToken,
        userId: user.id,
        expires
      }
    })

    // Return user data (without password)
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })

    // Set session cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error) {
    console.error('[AUTH_LOGIN]', error)
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 }
    )
  }
}
