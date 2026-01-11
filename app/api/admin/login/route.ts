import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Get admin password hash from database
    let settings = await prisma.sitesettings.findFirst()
    
    console.log('[ADMIN_LOGIN] Settings found:', settings ? 'Yes' : 'No')
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.sitesettings.create({
        data: {}
      })
      console.log('[ADMIN_LOGIN] Created default settings')
    }

    // Default hash for "admin123"
    const passwordHash = settings.adminPasswordHash || '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    
    console.log('[ADMIN_LOGIN] Password hash from DB:', passwordHash ? passwordHash.substring(0, 20) + '...' : 'null')
    console.log('[ADMIN_LOGIN] Password length:', password.length)
    
    // Verify password
    const isValid = await bcrypt.compare(password, passwordHash)
    
    console.log('[ADMIN_LOGIN] Password valid:', isValid)

    if (isValid) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64')
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: 'Login successful' 
      })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('[ADMIN_LOGIN_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
