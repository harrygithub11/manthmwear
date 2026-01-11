import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/cart/[id] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quantity } = body

    if (quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }

    const cartItem = await prisma.cartitem.update({
      where: {
        id: params.id,
        userId,
      },
      data: { 
        quantity,
        updatedAt: new Date()
      },
      include: { product: true },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('[CART_PATCH]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.cartitem.delete({
      where: {
        id: params.id,
        userId,
      },
    })

    return NextResponse.json({ message: 'Item removed' })
  } catch (error) {
    console.error('[CART_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
