import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        id: randomUUID().replace(/-/g, ''),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        updatedAt: new Date()
      }
    })

    // Create session
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
    console.error('[AUTH_SIGNUP]', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
