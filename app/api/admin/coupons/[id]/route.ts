import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single coupon
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    if (!token.startsWith('YWRtaW4')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        couponusage: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                createdAt: true
              }
            }
          },
          orderBy: { usedAt: 'desc' }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('[COUPON_GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if coupon exists
    const existing = await prisma.coupon.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (codeExists) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Validate discount type if provided
    if (discountType && !['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Discount type must be PERCENTAGE or FIXED' },
        { status: 400 }
      )
    }

    // Validate discount value if provided
    if (discountValue !== undefined) {
      const type = discountType || existing.discountType
      if (type === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
        return NextResponse.json(
          { error: 'Percentage discount must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseInt(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: parseInt(minOrderValue) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseInt(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(oneTimePerUser !== undefined && { oneTimePerUser }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(coupon)
  } catch (error: any) {
    console.error('[COUPON_PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    if (!token.startsWith('YWRtaW4')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.coupon.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error: any) {
    console.error('[COUPON_DELETE]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
