import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, userId, subtotal } = body

    if (!code || !userId || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Code, userId, and subtotal are required' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code', valid: false },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'This coupon is no longer active', valid: false },
        { status: 400 }
      )
    }

    // Check expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired', valid: false },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit', valid: false },
        { status: 400 }
      )
    }

    // Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      const minAmount = (coupon.minOrderValue / 100).toFixed(2)
      return NextResponse.json(
        { 
          error: `Minimum order value of ₹${minAmount} required for this coupon`,
          valid: false 
        },
        { status: 400 }
      )
    }

    // Check one-time per user restriction
    if (coupon.oneTimePerUser) {
      const previousUsage = await prisma.couponusage.findFirst({
        where: {
          couponId: coupon.id,
          userId: userId
        }
      })

      if (previousUsage) {
        return NextResponse.json(
          { error: 'You have already used this coupon', valid: false },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.floor((subtotal * coupon.discountValue) / 100)
      
      // Apply max discount cap if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue
      
      // Discount cannot exceed subtotal
      if (discount > subtotal) {
        discount = subtotal
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount,
      message: `Coupon applied! You saved ₹${(discount / 100).toFixed(2)}`
    })
  } catch (error: any) {
    console.error('[COUPON_VALIDATE]', error)
    return NextResponse.json({ error: error.message, valid: false }, { status: 500 })
  }
}
