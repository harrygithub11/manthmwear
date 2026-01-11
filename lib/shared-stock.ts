// Shared Stock Management Utilities

import { prisma } from './prisma'

/**
 * Update base stock for a color/size combination
 * This will automatically update all pack variants
 */
export async function updateBaseStock(
  productId: string,
  color: string,
  size: string,
  newBaseStock: number
) {
  // Update all variants for this color/size
  await prisma.productvariant.updateMany({
    where: {
      productId,
      color,
      size,
      useSharedStock: true,
    },
    data: {
      baseStock: newBaseStock,
    },
  })

  return {
    success: true,
    baseStock: newBaseStock,
    pack1Available: Math.floor(newBaseStock / 1),
    pack2Available: Math.floor(newBaseStock / 2),
    pack3Available: Math.floor(newBaseStock / 3),
  }
}

/**
 * Get calculated stock for a variant
 */
export function getCalculatedStock(
  baseStock: number | null,
  pack: number,
  useSharedStock: boolean,
  fallbackStock: number
): number {
  if (useSharedStock && baseStock != null) {
    return Math.floor(baseStock / pack)
  }
  return fallbackStock
}

/**
 * Deduct stock when order is placed
 * For shared stock: deduct quantity × pack from baseStock
 * For regular stock: deduct quantity from stock
 */
export async function deductStock(
  variantId: string,
  quantity: number
) {
  const variant = await prisma.productvariant.findUnique({
    where: { id: variantId },
  })

  if (!variant) {
    throw new Error('Variant not found')
  }

  if (variant.useSharedStock && variant.baseStock != null) {
    // Shared stock: deduct quantity × pack from baseStock
    const deduction = quantity * variant.pack
    const newBaseStock = variant.baseStock - deduction

    if (newBaseStock < 0) {
      throw new Error('Insufficient stock')
    }

    // Update all variants with same color/size
    await prisma.productvariant.updateMany({
      where: {
        productId: variant.productId,
        color: variant.color,
        size: variant.size,
        useSharedStock: true,
      },
      data: {
        baseStock: newBaseStock,
      },
    })

    return {
      success: true,
      deducted: deduction,
      newBaseStock,
    }
  } else {
    // Regular stock: deduct from stock field
    const newStock = variant.stock - quantity

    if (newStock < 0) {
      throw new Error('Insufficient stock')
    }

    await prisma.productvariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    })

    return {
      success: true,
      deducted: quantity,
      newStock,
    }
  }
}

/**
 * Get stock summary for a color/size
 */
export async function getStockSummary(
  productId: string,
  color: string,
  size: string
) {
  const variants = await prisma.productvariant.findMany({
    where: {
      productId,
      color,
      size,
      isActive: true,
    },
    orderBy: { pack: 'asc' },
  })

  const pack1 = variants.find(v => v.pack === 1)
  const baseStock = pack1?.baseStock ?? 0

  return {
    color,
    size,
    baseStock,
    useSharedStock: pack1?.useSharedStock ?? false,
    availability: {
      pack1: Math.floor(baseStock / 1),
      pack2: Math.floor(baseStock / 2),
      pack3: Math.floor(baseStock / 3),
    },
    variants: variants.map(v => ({
      id: v.id,
      pack: v.pack,
      sku: v.sku,
      calculatedStock: v.useSharedStock && v.baseStock != null
        ? Math.floor(v.baseStock / v.pack)
        : v.stock,
    })),
  }
}
