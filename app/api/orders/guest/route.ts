import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestCheckout, customerInfo, items, paymentMethod, couponCode } = body

    console.log('[GUEST_ORDER] Received request:', { guestCheckout, customerInfo: customerInfo?.email, itemsCount: items?.length, paymentMethod, couponCode })

    if (!guestCheckout || !customerInfo || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Validate customer info
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 })
    }

    // Load settings from database
    let shippingFee = 50
    let freeShippingThreshold = 999
    let taxRate = 0
    let razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || ''
    let prepaidDiscount = 0

    try {
      const settings = await prisma.sitesettings.findFirst()
      if (settings) {
        shippingFee = settings.shippingFee / 100 // Convert paise to rupees
        freeShippingThreshold = settings.freeShippingThreshold / 100
        taxRate = settings.taxRate || 0
        razorpayKeyId = settings.razorpayKeyId || razorpayKeyId
        razorpayKeySecret = settings.razorpayKeySecret || razorpayKeySecret
        prepaidDiscount = settings.prepaidDiscount || 0
        console.log('[GUEST_ORDER] Using DB settings:', { shippingFee, freeShippingThreshold, taxRate, prepaidDiscount, razorpayConfigured: !!razorpayKeyId })
      }
    } catch (error) {
      console.log('[GUEST_ORDER] Using default settings:', error)
    }

    // Calculate total (prices are already in rupees, convert to paise for database)
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee

    // Calculate Prepaid Discount
    let prepaidDiscountAmount = 0
    if (paymentMethod === 'ONLINE' || paymentMethod === 'online' || paymentMethod === 'PREPAID') {
      prepaidDiscountAmount = prepaidDiscount / 100 // Convert paise to rupees
    }

    // Validate and apply coupon if provided
    let couponDiscount = 0
    let validatedCoupon = null
    
    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() }
        })

        if (coupon && coupon.isActive) {
          // Check expiry
          if (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) {
            // Check usage limit
            if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
              // Check minimum order value
              const subtotalInPaise = Math.round(subtotal * 100)
              if (subtotalInPaise >= coupon.minOrderValue) {
                // Calculate discount
                if (coupon.discountType === 'PERCENTAGE') {
                  couponDiscount = Math.floor((subtotalInPaise * coupon.discountValue) / 100)
                  if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
                    couponDiscount = coupon.maxDiscount
                  }
                } else if (coupon.discountType === 'FIXED') {
                  couponDiscount = coupon.discountValue
                  if (couponDiscount > subtotalInPaise) {
                    couponDiscount = subtotalInPaise
                  }
                }
                
                couponDiscount = couponDiscount / 100 // Convert to rupees
                validatedCoupon = coupon
                console.log('[GUEST_ORDER] Coupon applied:', { code: couponCode, discount: couponDiscount })
              } else {
                console.log('[GUEST_ORDER] Coupon min order value not met')
              }
            } else {
              console.log('[GUEST_ORDER] Coupon usage limit reached')
            }
          } else {
            console.log('[GUEST_ORDER] Coupon expired')
          }
        } else {
          console.log('[GUEST_ORDER] Coupon not found or inactive')
        }
      } catch (error) {
        console.error('[GUEST_ORDER] Coupon validation error:', error)
      }
    }

    const totalDiscount = prepaidDiscountAmount + couponDiscount
    const tax = Math.round((subtotal + shipping - totalDiscount) * (taxRate / 100) * 100) / 100
    const total = Math.max(0, subtotal + shipping + tax - totalDiscount)

    console.log('[GUEST_ORDER] Order totals:', { subtotal, shipping, tax, prepaidDiscount: prepaidDiscountAmount, couponDiscount, totalDiscount, total, taxRate, threshold: freeShippingThreshold })

    // Generate order number
    const orderNumber = `MANTHM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Find or create guest user
    let user = await prisma.user.findUnique({
      where: { email: customerInfo.email }
    })

    if (!user) {
      const userId = randomUUID().replace(/-/g, '')
      user = await prisma.user.create({
        data: {
          id: userId,
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Prepare shipping address with pack colors
    const shippingAddress = JSON.stringify({
      name: customerInfo.name,
      phone: customerInfo.phone,
      line1: customerInfo.address,
      city: customerInfo.city,
      state: customerInfo.state,
      postalCode: customerInfo.postalCode,
      country: customerInfo.country || 'India',
      packColors: items.map((item: any) => ({
        variantId: item.variantId,
        packColors: item.packColors || []
      }))
    })

    // For COD, create order immediately
    if (paymentMethod === 'COD') {
      console.log('[GUEST_ORDER] Creating COD order...')

      // Find actual variant IDs from database
      const orderItems = []
      for (const item of items) {
        console.log('[GUEST_ORDER] Looking for variant:', { productId: item.productId, pack: item.pack, size: item.size, color: item.color })

        // First find product by slug if productId is a slug
        let productId = item.productId
        if (!productId.startsWith('c')) { // If it's a slug like 'trunk-core'
          const product = await prisma.product.findFirst({
            where: { slug: item.productId }
          })
          if (product) {
            productId = product.id
            console.log('[GUEST_ORDER] Found product by slug:', productId)
          }
        }

        // Find variant by product, pack, size, color
        const variant = await prisma.productvariant.findFirst({
          where: {
            productId: productId,
            pack: item.pack,
            size: item.size,
            color: item.color.toLowerCase(),
          }
        })

        if (!variant) {
          console.error('[GUEST_ORDER] Variant not found:', { productId, pack: item.pack, size: item.size, color: item.color })
          throw new Error(`Variant not found for ${item.size} ${item.color} pack of ${item.pack}`)
        }

        console.log('[GUEST_ORDER] Found variant:', variant.id)
        orderItems.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: Math.round(item.price * 100),
          subtotal: Math.round(item.price * item.quantity * 100),
        })
      }

      const orderId = randomUUID().replace(/-/g, '')

      const order = await prisma.order.create({
        data: {
          id: orderId,
          userId: user.id,
          orderNumber,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          paymentMethod: 'cod',
          subtotal: Math.round(subtotal * 100), // Convert to paise
          shipping: Math.round(shipping * 100),
          total: Math.round(total * 100),
          discount: Math.round(totalDiscount * 100),
          couponCode: validatedCoupon?.code || null,
          shippingAddress,
          updatedAt: new Date(),
          orderitem: {
            create: orderItems.map(item => ({
              id: randomUUID().replace(/-/g, ''),
              ...item
            }))
          }
        },
        include: {
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

      console.log('[GUEST_ORDER] Order created:', order.id)

      // Create coupon usage record if coupon was applied
      if (validatedCoupon && couponDiscount > 0) {
        try {
          await prisma.couponusage.create({
            data: {
              couponId: validatedCoupon.id,
              orderId: order.id,
              userId: user.id,
              discount: Math.round(couponDiscount * 100) // Convert to paise
            }
          })

          // Increment coupon usage count
          await prisma.coupon.update({
            where: { id: validatedCoupon.id },
            data: { usageCount: { increment: 1 } }
          })

          console.log('[GUEST_ORDER] Coupon usage recorded')
        } catch (error) {
          console.error('[GUEST_ORDER] Failed to record coupon usage:', error)
        }
      }

      // Update stock for each variant using shared stock system
      for (const orderItem of orderItems) {
        const variant = await prisma.productvariant.findUnique({
          where: { id: orderItem.variantId }
        })

        if (!variant) continue

        if (variant.useSharedStock && variant.baseStock != null) {
          // Shared stock: deduct quantity × pack from baseStock
          const deduction = orderItem.quantity * variant.pack
          const newBaseStock = variant.baseStock - deduction

          // Update all variants with same color/size
          await prisma.productvariant.updateMany({
            where: {
              productId: variant.productId,
              color: variant.color,
              size: variant.size,
              useSharedStock: true,
            },
            data: {
              baseStock: newBaseStock,
              updatedAt: new Date()
            }
          })
        } else {
          // Regular stock: deduct from stock field
          await prisma.productvariant.update({
            where: { id: orderItem.variantId },
            data: {
              stock: {
                decrement: orderItem.quantity
              },
              updatedAt: new Date()
            }
          })
        }
      }

      // Send email notifications
      try {
        console.log('[GUEST_ORDER] Sending email notifications...')

        // Prepare order data for emails
        const orderForEmail = {
          ...order,
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone
          },
          shippingAddress: JSON.parse(shippingAddress),
          items: order.orderitem.map(item => ({
            variant: item.productvariant,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          })),
          createdAt: new Date()
        }

        // Send customer confirmation email
        await sendOrderConfirmation(orderForEmail)
        console.log('[GUEST_ORDER] Customer email sent')

        // Send admin notification email
        await sendAdminOrderNotification(orderForEmail)
        console.log('[GUEST_ORDER] Admin email sent')
      } catch (emailError) {
        // Don't fail the order if email fails
        console.error('[GUEST_ORDER] Email sending failed:', emailError)
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'Order placed successfully',
      })
    }

    // For online payment, initialize Razorpay
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('[GUEST_ORDER] Razorpay credentials not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const Razorpay = require('razorpay')

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    console.log('[GUEST_ORDER] Razorpay initialized with key:', razorpayKeyId.substring(0, 12) + '...')

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: 'INR',
      receipt: orderNumber,
    })

    // Create order in database with PENDING status
    console.log('[GUEST_ORDER] Creating online payment order...')

    // Find actual variant IDs from database
    const onlineOrderItems = []
    for (const item of items) {
      console.log('[GUEST_ORDER] Looking for variant (online):', { productId: item.productId, pack: item.pack, size: item.size, color: item.color })

      // First find product by slug if productId is a slug
      let productId = item.productId
      if (!productId.startsWith('c')) { // If it's a slug like 'trunk-core'
        const product = await prisma.product.findFirst({
          where: { slug: item.productId }
        })
        if (product) {
          productId = product.id
          console.log('[GUEST_ORDER] Found product by slug:', productId)
        }
      }

      const variant = await prisma.productvariant.findFirst({
        where: {
          productId: productId,
          pack: item.pack,
          size: item.size,
          color: item.color.toLowerCase(),
        }
      })

      if (!variant) {
        console.error('[GUEST_ORDER] Variant not found:', { productId, pack: item.pack, size: item.size, color: item.color })
        throw new Error(`Variant not found for ${item.size} ${item.color} pack of ${item.pack}`)
      }

      console.log('[GUEST_ORDER] Found variant:', variant.id)
      onlineOrderItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: Math.round(item.price * 100),
        subtotal: Math.round(item.price * item.quantity * 100),
      })
    }

    const onlineOrderId = randomUUID().replace(/-/g, '')

    const order = await prisma.order.create({
      data: {
        id: onlineOrderId,
        userId: user.id,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'online',
        paymentId: razorpayOrder.id,
        subtotal: Math.round(subtotal * 100),
        shipping: Math.round(shipping * 100),
        total: Math.round(total * 100),
        discount: Math.round(totalDiscount * 100),
        couponCode: validatedCoupon?.code || null,
        shippingAddress,
        updatedAt: new Date(),
        orderitem: {
          create: onlineOrderItems.map(item => ({
            id: randomUUID().replace(/-/g, ''),
            ...item
          }))
        }
      }
    })

    console.log('[GUEST_ORDER] Online order created:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: razorpayKeyId,
      amount: razorpayOrder.amount,
    })
  } catch (error: any) {
    console.error('[GUEST_ORDER_ERROR] ==========================================')
    console.error('[GUEST_ORDER_ERROR] Type:', typeof error)
    console.error('[GUEST_ORDER_ERROR] Error:', error)
    console.error('[GUEST_ORDER_ERROR] Message:', error?.message)
    console.error('[GUEST_ORDER_ERROR] Stack:', error?.stack)
    console.error('[GUEST_ORDER_ERROR] Name:', error?.name)
    console.error('[GUEST_ORDER_ERROR] Code:', error?.code)
    console.error('[GUEST_ORDER_ERROR] ==========================================')

    return NextResponse.json(
      {
        error: 'Failed to create order',
        message: error?.message || String(error),
        code: error?.code,
        name: error?.name
      },
      { status: 500 }
    )
  }
}
