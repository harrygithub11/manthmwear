import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

// GET all products
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        productvariant: {
          orderBy: { pack: 'asc' }
        },
        productfeature: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      description: product.description,
      category: product.category,
      images: product.images ? JSON.parse(product.images as string) : [],
      isActive: product.isActive,
      variants: product.productvariant.map(v => {
        const baseStock = (v as any).baseStock
        const useSharedStock = (v as any).useSharedStock
        const calculatedStock = useSharedStock && baseStock != null
          ? Math.floor(baseStock / v.pack)
          : v.stock
        
        return {
          id: v.id,
          sku: v.sku,
          size: v.size,
          sizeRank: (v as any).sizeRank,
          color: v.color,
          colorCode: (v as any).colorCode,
          colorRank: (v as any).colorRank,
          pack: v.pack,
          price: v.price / 100,
          stock: calculatedStock,
          baseStock: baseStock,
          useSharedStock: useSharedStock,
          isActive: v.isActive,
        }
      }),
      features: product.productfeature,
      createdAt: product.createdAt.toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, tagline, description, category, images, features, variants } = body

    const { randomUUID } = require('crypto')
    const productId = randomUUID().replace(/-/g, '')
    
    const product = await prisma.product.create({
      data: {
        id: productId,
        name,
        slug,
        tagline,
        description,
        category,
        images: JSON.stringify(images || []),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        productfeature: {
          create: (features || []).map((f: any) => ({
            id: randomUUID().replace(/-/g, ''),
            name: f.name,
            description: f.description
          }))
        },
        productvariant: {
          create: (variants || []).map((v: any) => ({
            id: randomUUID().replace(/-/g, ''),
            sku: v.sku,
            size: v.size,
            color: v.color,
            pack: v.pack,
            price: Math.round(v.price * 100),
            stock: v.stock || 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        }
      }
    })

    return NextResponse.json({ success: true, productId: product.id })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_POST]', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
