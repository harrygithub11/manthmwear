import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch order detail from database
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        orderitem: {
          include: {
            productvariant: {
              include: {
                product: true
              }
            }
          }
        },
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const shippingAddr = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null

    // Format order detail for customer view
    const orderDetail = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || 'cod',
      razorpayOrderId: order.paymentId || null,
      razorpayPaymentId: order.paymentId || null,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax || 0,
      discount: 0,
      total: order.total,
      shippingAddress: shippingAddr,
      user: order.user ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
      } : null,
      items: order.orderitem.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        variant: {
          id: item.productvariant.id,
          sku: item.productvariant.sku,
          size: item.productvariant.size,
          color: item.productvariant.color,
          pack: item.productvariant.pack,
          product: {
            id: item.productvariant.product.id,
            name: item.productvariant.product.name,
            slug: item.productvariant.product.slug,
            images: item.productvariant.product.images ? JSON.parse(item.productvariant.product.images as string) : []
          }
        }
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }

    return NextResponse.json(orderDetail)
  } catch (error) {
    console.error('[ORDER_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}
