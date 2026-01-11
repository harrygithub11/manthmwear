import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

// POST - Change admin password
export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update or create settings with new password
    let settings = await prisma.sitesettings.findFirst()

    if (settings) {
      await prisma.sitesettings.update({
        where: { id: settings.id },
        data: {
          adminPasswordHash: hashedPassword,
        },
      })
    } else {
      await prisma.sitesettings.create({
        data: {
          adminPasswordHash: hashedPassword,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('[ADMIN_CHANGE_PASSWORD] Error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
