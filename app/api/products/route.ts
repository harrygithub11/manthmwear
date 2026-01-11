import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET all active products (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'all' ? { category } : {}),
      },
      include: {
        productvariant: {
          where: { isActive: true },
          orderBy: { pack: 'asc' }
        },
        productfeature: true,
      },
      orderBy: featured === 'true' ? { createdAt: 'desc' } : { name: 'asc' }
    })

    // Only return products that have at least one available variant
    const availableProducts = products.filter(p => p.productvariant.length > 0)

    const formatted = availableProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      description: product.description,
      category: product.category,
      images: product.images ? JSON.parse(product.images as string) : [],
      variants: product.productvariant.map(v => {
        const baseStock = (v as any).baseStock
        const useSharedStock = (v as any).useSharedStock
        
        // Calculate stock based on shared stock system
        const calculatedStock = useSharedStock && baseStock != null
          ? Math.floor(baseStock / v.pack)
          : v.stock
        
        return {
          id: v.id,
          sku: v.sku,
          size: v.size,
          sizeRank: (v as any).sizeRank,
          color: v.color,
          colorCode: v.colorCode,
          colorRank: (v as any).colorRank,
          pack: v.pack,
          price: v.price / 100, // Convert from paise to rupees
          stock: calculatedStock, // Use calculated stock
          baseStock: baseStock,
          useSharedStock: useSharedStock,
          isActive: v.isActive,
        }
      }),
      features: product.productfeature.map(f => ({
        name: f.name,
        description: f.description
      })),
      minPrice: Math.min(...product.productvariant.map(v => v.price)) / 100,
      maxPrice: Math.max(...product.productvariant.map(v => v.price)) / 100,
      inStock: product.productvariant.reduce((sum, v) => sum + v.stock, 0) > 0
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[PRODUCTS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
