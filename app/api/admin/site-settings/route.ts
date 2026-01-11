import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

// GET /api/admin/site-settings - Get all settings for admin
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let settings = await prisma.sitesettings.findFirst()
    
    if (!settings) {
      // Create default settings
      settings = await prisma.sitesettings.create({
        data: {
          siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'MANTHM',
          siteTagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Premium Men\'s Underwear',
          domain: process.env.NEXT_PUBLIC_APP_URL || 'manthm.com',
          contactEmail: process.env.CONTACT_EMAIL || 'contact@manthmwear.com',
          contactPhone: process.env.CONTACT_PHONE || '',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[ADMIN_SITE_SETTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/site-settings - Update site settings
export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Get existing settings or create new
    let settings = await prisma.sitesettings.findFirst()
    
    if (!settings) {
      // Create new settings
      settings = await prisma.sitesettings.create({
        data: body
      })
    } else {
      // Update existing settings
      settings = await prisma.sitesettings.update({
        where: { id: settings.id },
        data: body
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('[ADMIN_SITE_SETTINGS_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
