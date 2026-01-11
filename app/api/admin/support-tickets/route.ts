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

    const tickets = await prisma.supportticket.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('[ADMIN_SUPPORT_TICKETS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportticket.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('[ADMIN_SUPPORT_TICKETS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    )
  }
}
