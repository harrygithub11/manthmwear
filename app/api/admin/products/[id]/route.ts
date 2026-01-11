import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        productvariant: true,
        productfeature: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const formatted = {
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
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[ADMIN_PRODUCT_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, tagline, description, category, images, isActive, features, variants, forceDelete } = body

    // Validate images array size (warn if too large)
    const imagesString = JSON.stringify(images || [])
    const sizeInMB = new Blob([imagesString]).size / (1024 * 1024)
    
    if (sizeInMB > 10) {
      console.warn(`[ADMIN_PRODUCT_PUT] Large images payload: ${sizeInMB.toFixed(2)}MB`)
    }

    const { randomUUID } = require('crypto')

    // Delete existing features (safe to delete)
    await prisma.productfeature.deleteMany({ where: { productId: params.id } })
    
    // DON'T delete variants - they may be referenced in orders
    // Instead, we'll update existing ones and create new ones below

    // Update product with new data
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        tagline,
        description,
        category,
        images: imagesString,
        isActive: isActive ?? true,
        updatedAt: new Date(),
        productfeature: {
          create: (features || []).map((f: any) => ({
            id: f.id || randomUUID().replace(/-/g, ''),
            name: f.name,
            description: f.description
          }))
        }
      }
    })

    // Get list of variant IDs that should remain
    const activeVariantIds = (variants || []).map((v: any) => v.id).filter(Boolean)
    
    // Handle variants that are not in the new list
    if (activeVariantIds.length > 0) {
      // Get variants that will be removed
      const variantsToRemove = await prisma.productvariant.findMany({
        where: {
          productId: params.id,
          id: { notIn: activeVariantIds }
        },
        include: {
          orderitem: true
        }
      })

      for (const variant of variantsToRemove) {
        if (forceDelete && variant.orderitem.length === 0) {
          // Safe to delete - no orders reference this variant
          await prisma.productvariant.delete({
            where: { id: variant.id }
          })
        } else {
          // Deactivate instead of delete (has orders or not forced)
          await prisma.productvariant.update({
            where: { id: variant.id },
            data: {
              isActive: false,
              updatedAt: new Date()
            }
          })
        }
      }
    }

    // Handle variants with upsert (update if exists, create if new)
    for (const v of (variants || [])) {
      const variantId = v.id || randomUUID().replace(/-/g, '')
      
      // Prepare update data
      const updateData: any = {
        sku: v.sku,
        size: v.size,
        sizeRank: v.sizeRank ?? 99,
        color: v.color,
        colorCode: v.colorCode ?? '#CCCCCC',
        colorRank: v.colorRank ?? 99,
        pack: v.pack,
        price: Math.round(v.price * 100),
        stock: v.stock || 0,
        isActive: v.isActive ?? true,
        updatedAt: new Date()
      }
      
      // Handle shared stock fields
      if (v.useSharedStock !== undefined) {
        updateData.useSharedStock = v.useSharedStock
      }
      if (v.baseStock !== undefined) {
        updateData.baseStock = v.baseStock
      }
      
      await prisma.productvariant.upsert({
        where: { id: variantId },
        update: updateData,
        create: {
          id: variantId,
          productId: params.id,
          sku: v.sku,
          size: v.size,
          sizeRank: v.sizeRank ?? 99,
          color: v.color,
          colorCode: v.colorCode ?? '#CCCCCC',
          colorRank: v.colorRank ?? 99,
          pack: v.pack,
          price: Math.round(v.price * 100),
          stock: v.stock || 0,
          baseStock: v.baseStock,
          useSharedStock: v.useSharedStock ?? false,
          isActive: v.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true, productId: product.id })
  } catch (error: any) {
    console.error('[ADMIN_PRODUCT_PUT] Error:', error)
    console.error('[ADMIN_PRODUCT_PUT] Error message:', error.message)
    console.error('[ADMIN_PRODUCT_PUT] Error code:', error.code)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Product slug already exists' }, { status: 400 })
    }
    
    if (error.message?.includes('Packet') || error.message?.includes('packet')) {
      return NextResponse.json({ 
        error: 'Images are too large. Please use smaller images or image URLs instead.' 
      }, { status: 413 })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to update product' 
    }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const forceDelete = url.searchParams.get('force') === 'true'

    // Check if product has orders
    const orderItems = await prisma.orderitem.count({
      where: {
        productvariant: {
          productId: params.id
        }
      }
    })

    if (orderItems > 0 && !forceDelete) {
      // Don't delete, just deactivate
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Product deactivated (has existing orders). Use force=true to permanently delete.' 
      })
    }

    if (forceDelete && orderItems > 0) {
      // Force delete - first delete all order items referencing this product
      await prisma.orderitem.deleteMany({
        where: {
          productvariant: {
            productId: params.id
          }
        }
      })
    }

    // Safe to delete (or forced)
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: forceDelete ? 'Product force deleted successfully' : 'Product deleted successfully' 
    })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
