import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search in products (MySQL doesn't support mode: 'insensitive', but it's case-insensitive by default)
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: searchTerm } },
              { tagline: { contains: searchTerm } },
              { description: { contains: searchTerm } },
              { category: { contains: searchTerm } },
            ]
          }
        ]
      },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        images: true,
        category: true,
      },
      take: 5
    })

    // Parse images
    const results = products.map(product => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      category: product.category,
      image: Array.isArray(product.images) 
        ? product.images[0] 
        : typeof product.images === 'string' 
        ? JSON.parse(product.images)[0] 
        : null,
      url: `/products/${product.slug}`
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[SEARCH_API] Error:', error)
    return NextResponse.json({ results: [] })
  }
}
