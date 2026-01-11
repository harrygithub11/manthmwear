import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status, paymentStatus } = body

    if (!status && !paymentStatus) {
      return NextResponse.json({ error: 'Status or paymentStatus required' }, { status: 400 })
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    // Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: status ? 'Order status updated' : 'Payment status updated',
      orderId: updatedOrder.id,
      newStatus: updatedOrder.status,
      newPaymentStatus: updatedOrder.paymentStatus,
    })
  } catch (error) {
    console.error('[ADMIN_ORDER_PATCH]', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
        shipment: true,
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const shippingAddr = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null

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
      shipment: order.shipment || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }

    return NextResponse.json(orderDetail)
  } catch (error) {
    console.error('[ADMIN_ORDER_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete order items first
    await prisma.orderitem.deleteMany({
      where: { orderId: params.id }
    })

    // Delete the order
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('[ADMIN_ORDER_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
