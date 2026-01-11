import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

// GET - Fetch payment settings
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let settings = await prisma.sitesettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.sitesettings.create({
        data: {
          codEnabled: true,
          onlinePaymentEnabled: true,
        },
      })
    }

    return NextResponse.json({
      siteName: settings.siteName || 'MANTHM',
      siteTagline: settings.siteTagline || 'Premium Men\'s Underwear',
      logoUrl: settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || '',
      domain: settings.domain || 'manthmwear.com',
      contactEmail: settings.contactEmail || 'contact@manthmwear.com',
      contactPhone: settings.contactPhone || '',
      codEnabled: settings.codEnabled,
      onlinePaymentEnabled: settings.onlinePaymentEnabled,
      razorpayKeyId: settings.razorpayKeyId || '',
      razorpayKeySecret: settings.razorpayKeySecret || '',
      shippingFee: settings.shippingFee / 100, // Convert paise to rupees
      freeShippingThreshold: settings.freeShippingThreshold / 100, // Convert paise to rupees
      taxRate: settings.taxRate || 0,
      prepaidDiscount: (settings.prepaidDiscount || 0) / 100, // Convert paise to rupees
      currency: settings.currency || 'INR',
      currencySymbol: settings.currencySymbol || '₹',
      instagramUrl: settings.instagramUrl || '',
      facebookUrl: settings.facebookUrl || '',
      twitterUrl: settings.twitterUrl || '',
      metaTitle: settings.metaTitle || '',
      metaDescription: settings.metaDescription || '',
      metaKeywords: settings.metaKeywords || '',
      emailFrom: settings.emailFrom || '',
      adminNotificationEmail: settings.adminNotificationEmail || '',
      maintenanceMode: settings.maintenanceMode || false,
      maintenanceMessage: settings.maintenanceMessage || '',
    })
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update payment settings
export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      siteName,
      siteTagline,
      logoUrl,
      faviconUrl,
      domain,
      contactEmail,
      contactPhone,
      codEnabled,
      onlinePaymentEnabled,
      razorpayKeyId,
      razorpayKeySecret,
      shippingFee,
      freeShippingThreshold,
      taxRate,
      prepaidDiscount,
      currency,
      currencySymbol,
      instagramUrl,
      facebookUrl,
      twitterUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
      emailFrom,
      adminNotificationEmail,
      maintenanceMode,
      maintenanceMessage
    } = body

    // Validation
    if (!codEnabled && !onlinePaymentEnabled) {
      return NextResponse.json(
        { error: 'At least one payment method must be enabled' },
        { status: 400 }
      )
    }

    if (onlinePaymentEnabled && (!razorpayKeyId || !razorpayKeySecret)) {
      return NextResponse.json(
        { error: 'Razorpay credentials are required for online payments' },
        { status: 400 }
      )
    }

    // Convert rupees to paise for storage
    const shippingFeePaise = Math.round((shippingFee || 50) * 100)
    const freeShippingThresholdPaise = Math.round((freeShippingThreshold || 999) * 100)
    const prepaidDiscountPaise = Math.round((prepaidDiscount || 0) * 100)

    // Update or create settings
    let settings = await prisma.sitesettings.findFirst()

    const updateData = {
      siteName: siteName || 'MANTHM',
      siteTagline: siteTagline || null,
      logoUrl: logoUrl || null,
      faviconUrl: faviconUrl || null,
      domain: domain || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      codEnabled,
      onlinePaymentEnabled,
      razorpayKeyId,
      razorpayKeySecret,
      shippingFee: shippingFeePaise,
      freeShippingThreshold: freeShippingThresholdPaise,
      taxRate: taxRate || 0,
      prepaidDiscount: prepaidDiscountPaise,
      currency: currency || 'INR',
      currencySymbol: currencySymbol || '₹',
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      twitterUrl: twitterUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      emailFrom: emailFrom || null,
      adminNotificationEmail: adminNotificationEmail || null,
      maintenanceMode: maintenanceMode || false,
      maintenanceMessage: maintenanceMessage || null,
    }

    if (settings) {
      settings = await prisma.sitesettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    } else {
      settings = await prisma.sitesettings.create({
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('[ADMIN_SETTINGS_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
