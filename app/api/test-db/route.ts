import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const products = await prisma.product.findMany({
      take: 1,
      include: {
        productvariant: {
          take: 3
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database connected',
      products: products.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        variants: p.productvariant.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          pack: v.pack,
          price: v.price
        }))
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 })
  }
}
