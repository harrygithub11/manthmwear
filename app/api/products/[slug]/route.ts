import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        productvariant: {
          where: { isActive: true },
          orderBy: [{ pack: 'asc' }, { size: 'asc' }],
        },
        productfeature: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Normalize images to an array to match /api/products
    const formatted = {
      ...product,
      images: product?.images ? JSON.parse(product.images as unknown as string) : [],
    }
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[PRODUCT_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
