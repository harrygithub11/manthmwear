import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    })

    if (!session || session.expires < new Date()) {
      // Session expired or invalid
      return NextResponse.json({ user: null })
    }

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone
      }
    })
  } catch (error) {
    console.error('[AUTH_SESSION]', error)
    return NextResponse.json({ user: null })
  }
}
