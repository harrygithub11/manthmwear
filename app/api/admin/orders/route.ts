import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    console.log('[ADMIN_ORDERS] Fetching orders with status filter:', statusFilter)

    // Build where clause
    const where: any = {}
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter
    }

    // Test database connection
    await prisma.$connect()
    console.log('[ADMIN_ORDERS] Database connected successfully')

    // Fetch orders from database
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('[ADMIN_ORDERS] Found orders:', orders.length)

    // Format orders for admin dashboard
    const formattedOrders = orders.map(order => {
      const shippingAddr = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || shippingAddr?.name || 'Guest',
        customerEmail: order.user?.email || 'N/A',
        customerPhone: order.user?.phone || shippingAddr?.phone || 'N/A',
        items: order.orderitem.map(item => ({
          variantId: item.variantId, // Add variantId for packColors matching
          name: item.productvariant.product.name,
          size: item.productvariant.size,
          color: item.productvariant.color,
          pack: item.productvariant.pack,
          quantity: item.quantity,
          price: item.price / 100, // Convert paise to rupees for display
        })),
        shipment: order.shipment || null,
        subtotal: order.subtotal / 100,
        shipping: order.shipping / 100,
        discount: (order.discount || 0) / 100, // Add discount for display
        total: order.total / 100,
        status: order.status,
        paymentMethod: order.paymentMethod || 'N/A',
        paymentStatus: order.paymentStatus,
        address: shippingAddr,
        shippingAddress: order.shippingAddress, // Add raw shippingAddress for packColors
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }
    })

    console.log('[ADMIN_ORDERS] Returning formatted orders')
    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET] Error:', error)
    console.error('[ADMIN_ORDERS_GET] Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
