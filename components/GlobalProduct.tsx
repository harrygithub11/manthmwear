'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShoppingCart, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from '@/components/toast'
import QuickBuyModal, { QuickBuyProduct } from '@/components/common/QuickBuyModal'
import ColorDot from '@/components/common/ColorDot'

// Helper function to get color code from color name
const getColorCode = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'royal blue': '#1E3A8A',
    'dark green': '#064E3B',
    'maroon': '#7F1D1D',
    'grey': '#6B7280',
    'gray': '#6B7280',
    'coffee': '#6F4E37',
    'white': '#FFFFFF',
    'blue': '#1E40AF',
    'green': '#16A34A',
    'red': '#DC2626',
    'orange': '#EA580C',
    'yellow': '#CA8A04',
    'purple': '#9333EA',
    'pink': '#EC4899',
  }
  return colorMap[colorName.toLowerCase()] || '#CCCCCC'
}

// Helper function to get image index for a color based on fixed sequence
const getImageIndexForColor = (color: string, totalImages: number): number => {
  if (totalImages === 0) return 0
  
  // Fixed color-to-image mapping (images uploaded in sequence)
  const colorToImageMap: Record<string, number> = {
    'black': 0,           // Image 1
    'blue': 1,            // Image 2  
    'royal blue': 1,      // Image 2
    'green': 2,           // Image 3
    'dark green': 2,      // Image 3
    'maroon': 3,          // Image 4
    'grey': 4,            // Image 5
    'gray': 4,            // Image 5
    'coffee': 5           // Image 6
  }
  
  const imageIndex = colorToImageMap[color.toLowerCase()]
  
  // If color not found in map, default to first image
  if (imageIndex === undefined) return 0
  
  // If we don't have enough images, cycle through available ones
  if (imageIndex >= totalImages) return imageIndex % totalImages
  
  return imageIndex
}

export default function GlobalProduct() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [quickBuyModal, setQuickBuyModal] = useState<any | null>(null)
  const [imgIndexByProduct, setImgIndexByProduct] = useState<Record<string, number>>({})
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({})
  const [packColors, setPackColors] = useState<{ [key: string]: string[] }>({})
  const [availableColors, setAvailableColors] = useState<string[]>(['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee'])
  const [manuallyInteracted, setManuallyInteracted] = useState<Record<string, boolean>>({})

  const bumpImg = (productId: string, delta: number, images: string[]) => {
    setImgIndexByProduct((prev) => {
      const total = Array.isArray(images) ? images.length : 0
      if (total <= 1) return prev
      const cur = prev[productId] ?? 0
      const next = (cur + delta + total) % total
      return { ...prev, [productId]: next }
    })
    // Mark this product as manually interacted to stop auto-rotation
    setManuallyInteracted(prev => ({ ...prev, [productId]: true }))
  }

  useEffect(() => {
    fetchProducts()
    fetchAvailableColors()
  }, [])

  // Fetch available colors with stock check
  const fetchAvailableColors = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const products = await res.json()
        const allColors = new Set<string>()
        products.forEach((p: any) => {
          p.variants?.forEach((v: any) => {
            // Include all Pack of 1 colors that are active (no stock check for Pack 2/3 display)
            if (v.pack === 1 && v.color && v.color !== 'Custom Pack' && v.isActive) {
              allColors.add(v.color)
            }
          })
        })
        if (allColors.size > 0) {
          // Sort colors in consistent order
          const colorOrder = ['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee']
          const sortedColors = Array.from(allColors).sort((a, b) => {
            const aIndex = colorOrder.indexOf(a)
            const bIndex = colorOrder.indexOf(b)
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
          setAvailableColors(sortedColors)
          console.log('[ShopPage] Available colors (in stock):', sortedColors)
        } else {
          console.log('[ShopPage] No colors in stock')
        }
      }
    } catch (error) {
      console.error('Failed to fetch colors:', error)
    }
  }

  // Auto-rotate product images every 3s when multiple images are available
  // BUT skip Pack of 1 with real colors (they use color-based image switching)
  useEffect(() => {
    if (!products || products.length === 0) return
    const t = setInterval(() => {
      setImgIndexByProduct((prev) => {
        const next: Record<string, number> = { ...prev }
        for (const p of products) {
          // Skip auto-rotation if user has manually interacted with this product
          if (manuallyInteracted[p.id]) continue
          
          // Check if this is Pack of 1 with real colors
          const selectedVariantId = selectedVariants[p.id] || p.variants[0]?.id
          const selectedVariant = p.variants.find((v: any) => v.id === selectedVariantId) || p.variants[0]
          const packSize = selectedVariant?.pack || 1
          const uniqueColors = Array.from(new Set(p.variants.map((v: any) => v.color)))
          const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
          
          // Skip image rotation for Pack of 1 with real colors (color rotation handles images)
          if (packSize === 1 && !isCustomPack && uniqueColors.length > 0) {
            continue
          }
          
          const imgs = Array.isArray(p.images) ? p.images : []
          if (imgs.length > 1) {
            const cur = prev[p.id] ?? 0
            next[p.id] = (cur + 1) % imgs.length
          } else if (imgs.length === 1) {
            next[p.id] = 0
          }
        }
        return next
      })
    }, 3000)
    return () => clearInterval(t)
  }, [products, manuallyInteracted, selectedVariants])

  // Auto-rotate colors for pack products every 3s
  useEffect(() => {
    if (!products || products.length === 0) return
    
    const t = setInterval(() => {
      setPackColors((prev) => {
        const next: Record<string, string[]> = {}
        
        // Process each expanded pack product
        products.forEach((p) => {
          const availablePacks = Array.from(new Set(p.variants.map((v: any) => Number(v.pack)))) as number[]
          
          availablePacks.forEach((packSize: number) => {
            const packKey = `${p.id}-${packSize}`
            const productKey = `${p.id}-pack-${packSize}`
            
            // Skip if user has manually interacted with this product
            if (manuallyInteracted[productKey] || manuallyInteracted[p.id]) {
              next[packKey] = prev[packKey] || []
              return
            }
            
            const uniqueColors = Array.from(new Set(p.variants.filter((v: any) => v.pack === packSize).map((v: any) => v.color)))
            const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
            
            if (packSize === 1) {
              if (isCustomPack) {
                // Custom Pack: random color
                const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
                next[packKey] = [randomColor]
              } else if (uniqueColors.length > 0) {
                // Real colors: cycle through
                const currentColor = prev[packKey]?.[0]
                const currentIndex = uniqueColors.findIndex(c => c === currentColor)
                const nextIndex = (currentIndex + 1) % uniqueColors.length
                next[packKey] = [uniqueColors[nextIndex] as string]
              }
            } else if (packSize === 2 || packSize === 3) {
              // Pack of 2/3: generate random combinations
              const shuffled = [...availableColors].sort(() => Math.random() - 0.5)
              const newColors: string[] = []
              
              for (let i = 0; i < packSize; i++) {
                // Pick a color, trying to avoid duplicates
                let color = shuffled[i % shuffled.length]
                let attempts = 0
                while (newColors.includes(color) && attempts < 10 && shuffled.length >= packSize) {
                  color = shuffled[Math.floor(Math.random() * shuffled.length)]
                  attempts++
                }
                newColors.push(color)
              }
              
              next[packKey] = newColors
              console.log(`[AUTO-ROTATE] Pack ${packSize} for ${p.name}: ${newColors.join(', ')}`)
            }
          })
        })
        
        return next
      })
    }, 3000)
    
    return () => clearInterval(t)
  }, [products, manuallyInteracted, availableColors])

  // Initialize pack colors for products
  useEffect(() => {
    if (!products || products.length === 0) return
    const newPackColors: { [key: string]: string[] } = {}
    products.forEach(product => {
      const packSizes = Array.from(new Set(product.variants.map((v: any) => v.pack)))
      packSizes.forEach(packSize => {
        const key = `${product.id}-${packSize}`
        if (!packColors[key]) {
          // Initialize with first color for Pack of 1 with real colors
          const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color)))
          const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
          if (packSize === 1 && !isCustomPack && uniqueColors.length > 0) {
            // Sort colors by colorRank from database
            const sortedColors = uniqueColors.sort((a, b) => {
              const variantA = product.variants.find((v: any) => v.color === a)
              const variantB = product.variants.find((v: any) => v.color === b)
              const rankA = variantA?.colorRank ?? 999
              const rankB = variantB?.colorRank ?? 999
              return rankA - rankB
            })
            newPackColors[key] = [sortedColors[0] as string]
          } else {
            newPackColors[key] = Array(packSize).fill(availableColors[0]) as string[]
          }
        }
      })
    })
    if (Object.keys(newPackColors).length > 0) {
      setPackColors(prev => ({ ...prev, ...newPackColors }))
    }
  }, [products, availableColors])

  // Sync selected variant with auto-rotating color for Pack of 1
  useEffect(() => {
    if (!products || products.length === 0) return
    products.forEach(product => {
      const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id
      const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0]
      const packSize = selectedVariant?.pack || 1
      const packKey = `${product.id}-${packSize}`
      
      // Only sync for Pack of 1 with real colors when not manually interacted
      if (packSize === 1 && !manuallyInteracted[product.id]) {
        const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color)))
        const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
        
        if (!isCustomPack && uniqueColors.length > 0) {
          const currentColor = packColors[packKey]?.[0]
          if (currentColor && currentColor !== selectedVariant?.color) {
            // Find variant with the auto-rotating color
            const variantWithColor = product.variants.find((v: any) => 
              v.color === currentColor && v.size === selectedVariant?.size && v.pack === packSize
            )
            if (variantWithColor) {
              setSelectedVariants(prev => ({ ...prev, [product.id]: variantWithColor.id }))
              
              // Also update the image to match the color
              const imageIndex = getImageIndexForColor(currentColor, product.images.length)
              setImgIndexByProduct(prev => ({ ...prev, [product.id]: imageIndex }))
            }
          }
        }
      }
    })
  }, [packColors, products, manuallyInteracted])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        // Normalize and sort variants so sizes are always S -> M -> L -> XL
        const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
        const normalized = (data || []).map((p: any) => {
          const variants = Array.isArray(p.variants) ? [...p.variants] : []
          variants.sort((a: any, b: any) => {
            const ar = typeof a.sizeRank === 'number' ? a.sizeRank : (sizeOrder[a.size] || 99)
            const br = typeof b.sizeRank === 'number' ? b.sizeRank : (sizeOrder[b.size] || 99)
            if (ar !== br) return ar - br
            if (a.color && b.color) return String(a.color).localeCompare(String(b.color))
            return 0
          })

          // Also ensure pack ascending for consistent defaults
          variants.sort((a: any, b: any) => {
            const ar = typeof a.sizeRank === 'number' ? a.sizeRank : (sizeOrder[a.size] || 99)
            const br = typeof b.sizeRank === 'number' ? b.sizeRank : (sizeOrder[b.size] || 99)
            return ar - br || (a.pack || 0) - (b.pack || 0) || String(a.color).localeCompare(String(b.color))
          })

          return { ...p, variants }
        })
        setProducts(normalized)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory
    return categoryMatch
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const handleAddToCart = (product: any, selectedVariantId?: string) => {
    // Handle pack products (they have originalId) vs regular products
    const originalId = product.originalId || product.id
    const packSize = product.pack || 1
    
    // Transform product data to match QuickBuyProduct interface
    const quickBuyProduct = {
      id: originalId,
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      images: product.images || [],
      variants: product.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        pack: v.pack,
        price: v.price,
        stock: v.stock,
        sizeRank: v.sizeRank
      }))
    }
    
    // Find selected variant or use first one
    const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
    const variantsSorted = [...quickBuyProduct.variants].sort((a: any, b: any) => 
      (a.sizeRank ?? sizeOrder[a.size] ?? 99) - (b.sizeRank ?? sizeOrder[b.size] ?? 99) || 
      a.pack - b.pack || 
      String(a.color).localeCompare(String(b.color))
    )
    const current = selectedVariantId 
      ? variantsSorted.find(v => v.id === selectedVariantId) || variantsSorted[0]
      : variantsSorted[0]
    
    // Use originalId for pack colors key
    const packKey = `${originalId}-${packSize}`
    const currentColors = packColors[packKey] || []
    
    // For pack of 1, use the auto-rotating color instead of variant color
    let initialColor = current?.color
    if (packSize === 1 && currentColors.length > 0) {
      initialColor = currentColors[0] // Use the auto-rotating color
    }
    
    setQuickBuyModal({ 
      ...quickBuyProduct, 
      initialSelected: { size: current?.size, color: initialColor, pack: current?.pack },
      initialPackColors: currentColors
    })
  }

  const handleSelectVariant = (productId: string, variantId: string, color?: string, totalImages?: number) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }))
    // Switch to the image that matches this color
    if (color && totalImages) {
      const actualProductId = productId.split('-')[0]
      const imageIndex = getImageIndexForColor(color, totalImages)
      setImgIndexByProduct(prev => ({ ...prev, [actualProductId]: imageIndex }))
      // Mark this product as manually interacted to stop auto-rotation
      setManuallyInteracted(prev => ({ ...prev, [actualProductId]: true }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg font-bold">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters */}
        <div className="bg-white border border-gray-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-secondary" />
            <h3 className="text-lg font-black">Filters</h3>
          </div>
          
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-bold mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 text-sm font-bold border-2 transition-all capitalize',
                      selectedCategory === category
                        ? 'bg-text-black text-white border-text-black'
                        : 'bg-white text-text-black border-gray-border hover:border-text-black'
                    )}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>


          </div>

          <div className="mt-4 pt-4 border-t border-gray-border text-sm text-gray-secondary">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {/* Product Grid */}
        {(() => {
          // Expand products into individual pack products
          const expandedProducts: any[] = []
          filteredProducts.forEach((product) => {
            const availablePacks = Array.from(new Set(product.variants.map((v: any) => Number(v.pack)))) as number[]
            availablePacks.sort((a, b) => a - b)
            
            availablePacks.forEach((pack: number) => {
              const packVariants = product.variants.filter((v: any) => v.pack === pack)
              if (packVariants.length > 0) {
                expandedProducts.push({
                  ...product,
                  id: `${product.id}-pack-${pack}`, // Unique ID for each pack
                  originalId: product.id, // Keep original ID for reference
                  pack: pack,
                  name: `${product.name} - Pack of ${pack}`,
                  variants: packVariants,
                  packPrice: packVariants[0]?.price || 0
                })
              }
            })
          })
          
          return expandedProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {expandedProducts.map((packProduct) => (
              <div
                key={packProduct.id}
                className="group border-2 border-gray-border hover:border-text-black transition-all duration-200"
              >
                {/* Product Image */}
                <Link href={`/products/${packProduct.slug}?pack=${packProduct.pack}`} className="block">
                  <div className="aspect-square bg-gray-light relative overflow-hidden cursor-pointer">
                    {(() => {
                      const productKey = packProduct.id
                      const packSize = packProduct.pack
                      const packKey = `${packProduct.originalId}-${packSize}`
                      const currentPackColors = packColors[packKey] || []
                      const uniqueColors = Array.from(new Set(packProduct.variants.map((v: any) => v.color)))
                      const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
                      
                      if (packProduct.images.length === 0) {
                        return (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )
                      }
                      
                      // Pack of 1: Single Image
                      if (packSize === 1) {
                        return (
                          <>
                            <img
                              src={packProduct.images[imgIndexByProduct[packProduct.originalId] ?? 0]}
                              alt={packProduct.name}
                              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            {packProduct.images.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); bumpImg(packProduct.originalId, -1, packProduct.images) }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 border border-gray-border"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); bumpImg(packProduct.originalId, 1, packProduct.images) }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 border border-gray-border"
                                  aria-label="Next image"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </>
                        )
                      }
                      
                      // Pack of 2: Always show split image with selected colors
                      if (packSize === 2) {
                        // Always show split image for Pack of 2
                        return (
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: 2 }).map((_, idx: number) => {
                              const color = currentPackColors[idx] || (isCustomPack ? availableColors[0] : uniqueColors[0])
                              const imageIndex = getImageIndexForColor(String(color), packProduct.images.length)
                              return (
                                <div key={`${idx}-${color}`} className="relative w-1/2 h-full transition-all duration-500">
                                  <img
                                    src={packProduct.images[imageIndex]}
                                    alt={String(color)}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    loading="lazy"
                                  />
                                  {/* Color indicator */}
                                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 text-xs font-bold rounded">
                                    <div 
                                      className="w-3 h-3 border border-gray-300 rounded-full" 
                                      style={{ backgroundColor: getColorCode(String(color)) }}
                                    />
                                    <span className="text-gray-800">{idx + 1}</span>
                                  </div>
                                </div>
                              )
                            })}
                            {/* Auto-rotation indicator */}
                            {!manuallyInteracted[packProduct.originalId] && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs font-bold rounded">
                                AUTO
                              </div>
                            )}
                          </div>
                        )
                      }
                      
                      // Pack of 3: Always show grid image with selected colors
                      if (packSize === 3) {
                        // Always show grid for Pack of 3
                        return (
                          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                            {Array.from({ length: 3 }).map((_, idx: number) => {
                              const color = currentPackColors[idx] || (isCustomPack ? availableColors[0] : uniqueColors[0])
                              const imageIndex = getImageIndexForColor(String(color), packProduct.images.length)
                              return (
                                <div 
                                  key={`${idx}-${color}`}
                                  className={cn("relative transition-all duration-500", idx === 2 ? "col-span-2" : "")}
                                >
                                  <img
                                    src={packProduct.images[imageIndex]}
                                    alt={String(color)}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    loading="lazy"
                                  />
                                  {/* Color indicator */}
                                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 text-xs font-bold rounded">
                                    <div 
                                      className="w-3 h-3 border border-gray-300 rounded-full" 
                                      style={{ backgroundColor: getColorCode(String(color)) }}
                                    />
                                    <span className="text-gray-800">{idx + 1}</span>
                                  </div>
                                </div>
                              )
                            })}
                            {/* Auto-rotation indicator */}
                            {!manuallyInteracted[packProduct.originalId] && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs font-bold rounded">
                                AUTO
                              </div>
                            )}
                          </div>
                        )
                      }
                      
                      // Fallback
                      return (
                        <img
                          src={packProduct.images[imgIndexByProduct[packProduct.originalId] ?? 0]}
                          alt={packProduct.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      )
                    })()}
                    {packProduct.category && (
                      <div className="absolute left-3 top-3 bg-white/90 text-text-black text-xs font-bold tracking-wider-xl uppercase px-2 py-1 z-10">
                        {packProduct.category}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${packProduct.slug}?pack=${packProduct.pack}`}>
                    <h3 className="text-lg font-bold mb-1 line-clamp-1 hover:underline cursor-pointer">{packProduct.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-secondary mb-3 line-clamp-1">{packProduct.tagline}</p>
                  
                  {(() => {
                    const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
                    const productKey = packProduct.id
                    const selectedVariantId = selectedVariants[productKey] || packProduct.variants[0]?.id
                    const selectedVariant = packProduct.variants.find((v: any) => v.id === selectedVariantId) || packProduct.variants[0]
                    const packSize = packProduct.pack
                    const packKey = `${packProduct.originalId}-${packSize}`
                    const currentPackColors = packColors[packKey] || Array(packSize).fill(availableColors[0])
                    const uniqueColors = Array.from(new Set(packProduct.variants.map((v: any) => v.color)))
                    const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
                    
                    return (
                      <>
                        <div className="text-xl font-black mb-2">
                          ₹{selectedVariant?.price || packProduct.packPrice}
                        </div>

                        {/* Color Selection for Individual Pack Product */}
                        {(() => {
                          // Sort colors by colorRank from database
                          const sortedUniqueColors = uniqueColors.sort((a, b) => {
                            const variantA = packProduct.variants.find((v: any) => v.color === a)
                            const variantB = packProduct.variants.find((v: any) => v.color === b)
                            const rankA = variantA?.colorRank ?? 999
                            const rankB = variantB?.colorRank ?? 999
                            return rankA - rankB
                          })
                          
                          const colorsToShow = (!isCustomPack && sortedUniqueColors.length > 0) ? sortedUniqueColors : availableColors
                          
                          if (packSize === 1) {
                            // Pack of 1: Single color selection
                            const currentColor = currentPackColors[0] || selectedVariant?.color
                            return (
                              <div className="mb-3">
                                <div className="text-xs font-bold uppercase text-gray-secondary mb-2">
                                  Color: {currentColor || 'Select'}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {colorsToShow.map((color) => (
                                    <ColorDot
                                      key={String(color)}
                                      color={String(color)}
                                      colorCode={getColorCode(String(color))}
                                      selected={currentColor === color}
                                      onClick={() => {
                                        setPackColors(prev => ({ ...prev, [packKey]: [String(color)] }))
                                        setManuallyInteracted(prev => ({ ...prev, [packProduct.originalId]: true, [productKey]: true }))
                                        // Update image to match selected color
                                        const imageIndex = getImageIndexForColor(String(color), packProduct.images.length)
                                        setImgIndexByProduct(prev => ({ ...prev, [packProduct.originalId]: imageIndex }))
                                      }}
                                      size="sm"
                                    />
                                  ))}
                                </div>
                              </div>
                            )
                          } else {
                            // Pack of 2/3: Multi-color selection (original format)
                            return (
                              <div className="mb-3">
                                <div className="text-xs font-bold uppercase text-gray-secondary mb-2">
                                  Choose {packSize} Colors
                                </div>
                                <div className="space-y-2">
                                  {Array.from({ length: packSize }).map((_, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <span className="text-xs font-bold w-4">{index + 1}:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {colorsToShow.slice(0, 6).map((color) => (
                                          <ColorDot
                                            key={String(color)}
                                            color={String(color)}
                                            colorCode={getColorCode(String(color))}
                                            selected={currentPackColors[index] === color}
                                            onClick={() => {
                                              const newColors = [...currentPackColors]
                                              newColors[index] = String(color)
                                              setPackColors(prev => ({ ...prev, [packKey]: newColors }))
                                              setManuallyInteracted(prev => ({ ...prev, [packProduct.originalId]: true, [productKey]: true }))
                                            }}
                                            size="sm"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        })()}



                        {/* Size Selector */}
                        {(() => {
                          const uniqueSizes = Array.from(new Set(packProduct.variants.map((v: any) => v.size)))
                            .sort((a: any, b: any) => (sizeOrder[a] || 99) - (sizeOrder[b] || 99))
                          
                          if (uniqueSizes.length > 0) {
                            return (
                              <div className="mb-3">
                                <div className="text-xs font-bold uppercase text-gray-secondary mb-2">
                                  Size: {selectedVariant?.size || 'Select'}
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {uniqueSizes.map((size) => {
                                    const variantWithSize = packProduct.variants.find((v: any) => v.size === size)
                                    if (!variantWithSize) return null
                                    return (
                                      <button
                                        key={String(size)}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleSelectVariant(productKey, variantWithSize.id)
                                        }}
                                        className={cn(
                                          "py-2 text-xs font-bold border-2 transition-all",
                                          selectedVariant?.size === size
                                            ? "border-text-black bg-text-black text-white"
                                            : "border-gray-border hover:border-text-black"
                                        )}
                                      >
                                        {String(size)}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        })()}

                        {/* Quick Buy Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(packProduct, selectedVariantId)
                          }}
                          className="w-full bg-text-black text-white py-3 text-sm font-bold tracking-wider-xl uppercase hover:bg-gray-800 transition-colors"
                        >
                          Quick Buy
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>
              ))}
            </div>
          ) : (
          <div className="text-center py-16">
            <div className="text-xl font-bold mb-2">No products found</div>
            <div className="text-gray-secondary mb-6">Try adjusting your filters</div>
            <button
              onClick={() => {
                setSelectedCategory('all')
              }}
              className="px-6 py-3 bg-text-black text-white font-bold hover:bg-gray-800"
            >
              Clear Filters
            </button>
          </div>
        ) })()}

        {/* Quick Buy Modal */}
        {quickBuyModal && (
          <QuickBuyModal 
            product={quickBuyModal} 
            onClose={() => setQuickBuyModal(null)}
            initialSelected={(quickBuyModal as any).initialSelected}
            initialPackColors={(quickBuyModal as any).initialPackColors}
          />
        )}
      </div>
  )
}
