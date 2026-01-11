import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const customers = await prisma.user.findMany({
      include: {
        order: {
          select: {
            total: true,
            createdAt: true
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.order.length,
      totalSpent: customer.order.reduce((sum, order) => sum + order.total, 0) / 100,
      lastOrder: customer.order.length > 0 ? customer.order[0].createdAt.toISOString() : null,
      addresses: customer.address.length,
      joinedAt: customer.createdAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[ADMIN_CUSTOMERS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
