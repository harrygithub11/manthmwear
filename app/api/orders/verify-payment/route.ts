import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    console.log('[VERIFY_PAYMENT] Received:', { razorpay_order_id, razorpay_payment_id })

    // Verify signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay key not configured' }, { status: 500 })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('[VERIFY_PAYMENT] Invalid signature')
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    console.log('[VERIFY_PAYMENT] Signature verified')

    // Find order by paymentId
    const existingOrder = await prisma.order.findFirst({
      where: { paymentId: razorpay_order_id }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
        updatedAt: new Date()
      },
      include: {
        user: true,
        orderitem: {
          include: {
            productvariant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    // Create coupon usage record if coupon was applied
    if (existingOrder.couponCode && existingOrder.discount > 0) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { code: existingOrder.couponCode }
        })

        if (coupon) {
          // Check if usage already recorded (prevent duplicates)
          const existingUsage = await prisma.couponusage.findFirst({
            where: {
              couponId: coupon.id,
              orderId: order.id
            }
          })

          if (!existingUsage) {
            await prisma.couponusage.create({
              data: {
                couponId: coupon.id,
                orderId: order.id,
                userId: order.userId,
                discount: existingOrder.discount
              }
            })

            // Increment coupon usage count
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } }
            })

            console.log('[VERIFY_PAYMENT] Coupon usage recorded')
          }
        }
      } catch (error) {
        console.error('[VERIFY_PAYMENT] Failed to record coupon usage:', error)
      }
    }

    // Update stock for each item
    for (const item of order.orderitem) {
      await prisma.productvariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          },
          updatedAt: new Date()
        }
      })
    }

    // Send email notifications
    try {
      console.log('[VERIFY_PAYMENT] Sending emails...')
      
      const shippingAddr = JSON.parse(order.shippingAddress as string)
      
      const emailData = {
        customerName: order.user.name,
        customerEmail: order.user.email,
        customerPhone: order.user.phone || '',
        orderNumber: order.orderNumber,
        items: order.orderitem.map((item: any) => ({
          name: item.productvariant.product.name,
          variant: `${item.productvariant.size} - ${item.productvariant.color}`,
          quantity: item.quantity,
          price: (item.priceAtOrder / 100).toFixed(2)
        })),
        subtotal: (order.subtotal / 100).toFixed(2),
        shipping: (order.shipping / 100).toFixed(2),
        total: (order.total / 100).toFixed(2),
        shippingAddress: `${shippingAddr.line1}, ${shippingAddr.city}`,
        id: order.id
      }

      await sendOrderConfirmation(emailData)
      console.log('[VERIFY_PAYMENT] Customer email sent')

      await sendAdminOrderNotification({
        ...emailData,
        paymentMethod: 'Online Payment'
      })
      console.log('[VERIFY_PAYMENT] Admin email sent')
    } catch (emailError) {
      console.error('[VERIFY_PAYMENT] Email error:', emailError)
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('[VERIFY_PAYMENT_ERROR]', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
