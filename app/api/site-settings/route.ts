import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/site-settings - Public endpoint to fetch site settings
export async function GET() {
  try {
    // Get settings from database
    let settings = await prisma.sitesettings.findFirst()

    // If no settings exist, create default from env
    if (!settings) {
      settings = await prisma.sitesettings.create({
        data: {
          siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'MANTHM',
          siteTagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Premium Men\'s Underwear',
          domain: process.env.NEXT_PUBLIC_APP_URL || 'manthm.com',
          contactEmail: process.env.CONTACT_EMAIL || 'contact@manthmwear.com',
          contactPhone: process.env.CONTACT_PHONE || '',
          currency: process.env.CURRENCY || 'INR',
          currencySymbol: process.env.CURRENCY_SYMBOL || '₹',
          shippingFee: parseInt(process.env.SHIPPING_FEE || '5000'),
          freeShippingThreshold: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '99900'),
          emailFrom: process.env.EMAIL_FROM || '',
          adminNotificationEmail: process.env.ADMIN_EMAIL || '',
        }
      })
    }

    // Convert paise to rupees for frontend
    const shippingFee = settings.shippingFee / 100
    const freeShippingThreshold = settings.freeShippingThreshold / 100
    const taxRate = settings.taxRate || 0
    const prepaidDiscount = (settings.prepaidDiscount || 0) / 100

    console.log('[SITE_SETTINGS_API] DB values:', {
      shippingFeePaise: settings.shippingFee,
      shippingFeeRupees: shippingFee,
      thresholdPaise: settings.freeShippingThreshold,
      thresholdRupees: freeShippingThreshold,
      taxRate: taxRate,
      prepaidDiscount: prepaidDiscount,
      razorpayConfigured: !!(settings.razorpayKeyId)
    })

    // Return public-safe settings (convert paise to rupees for frontend)
    return NextResponse.json({
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      domain: settings.domain,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      shippingFee: shippingFee, // Convert paise to rupees
      freeShippingThreshold: freeShippingThreshold, // Convert paise to rupees
      taxRate: taxRate,
      prepaidDiscount: prepaidDiscount, // Convert paise to rupees
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      razorpayKeyId: settings.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      codEnabled: settings.codEnabled ?? true,
      onlinePaymentEnabled: settings.onlinePaymentEnabled ?? true,
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      _debug: {
        source: 'database',
        timestamp: new Date().toISOString(),
        rawShippingFee: settings.shippingFee,
        version: '3.0'
      }
    })
  } catch (error) {
    console.error('[SITE_SETTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}
