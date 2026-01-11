import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all coupons
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    if (!token.startsWith('YWRtaW4')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { couponusage: true }
        }
      }
    })

    return NextResponse.json(coupons)
  } catch (error: any) {
    console.error('[COUPONS_GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new coupon
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    if (!token.startsWith('YWRtaW4')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      oneTimePerUser,
      expiryDate,
      isActive
    } = body

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, discount type, and discount value are required' },
        { status: 400 }
      )
    }

    // Validate discount type
    if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Discount type must be PERCENTAGE or FIXED' },
        { status: 400 }
      )
    }

    // Validate discount value
    if (discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseInt(discountValue),
        minOrderValue: minOrderValue ? parseInt(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        oneTimePerUser: oneTimePerUser || false,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error: any) {
    console.error('[COUPONS_POST]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
