import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newslettersubscriber.findMany({
      orderBy: { subscribedAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('[ADMIN_NEWSLETTER] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
