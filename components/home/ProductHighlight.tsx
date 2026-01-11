'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { guestCart } from '@/lib/guest-cart'
import { toast } from '@/components/toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import QuickBuyModal from '@/components/common/QuickBuyModal'
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

// Helper function to get image index for a color
const getImageIndexForColor = (color: string, totalImages: number, allColors: string[]): number => {
  if (totalImages === 0) return 0
  const colorIndex = allColors.findIndex(c => c.toLowerCase() === color.toLowerCase())
  if (colorIndex === -1) return 0
  if (colorIndex < totalImages) return colorIndex
  return colorIndex % totalImages
}

export default function ProductHighlight() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<number | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgIndexByProduct, setImgIndexByProduct] = useState<Record<string, number>>({})
  const [quickBuyProduct, setQuickBuyProduct] = useState<any | null>(null)
  const [packColors, setPackColors] = useState<{ [key: string]: string[] }>({})
  const [availableColors, setAvailableColors] = useState<string[]>(['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee'])

  // Fetch available colors with stock check
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          const allColors = new Set<string>()
          data.forEach((p: any) => {
            p.variants?.forEach((v: any) => {
              // Include all Pack of 1 colors that are active (no stock check for Pack 2/3 display)
              if (v.pack === 1 && v.color && v.color !== 'Custom Pack' && v.isActive) {
                allColors.add(v.color)
              }
            })
          })
          if (allColors.size > 0) {
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
          }
        }
      } catch (error) {
        console.error('Failed to fetch colors:', error)
      }
    }
    fetchColors()
  }, [])
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
  }, [])

  // Auto-rotate product images every 3s if a product has multiple images
  // BUT skip Pack of 1 with real colors (they use color-based image switching)
  useEffect(() => {
    if (!products || products.length === 0) return
    const timer = setInterval(() => {
      setImgIndexByProduct((prev) => {
        const next: Record<string, number> = { ...prev }
        for (const p of products) {
          // Skip auto-rotation if user has manually interacted with this product
          if (manuallyInteracted[p.id]) continue
          
          // Check if this is Pack of 1 with real colors
          const uniqueColors = Array.from(new Set(p.variants.map((v: any) => v.color)))
          const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
          const packSizes = Array.from(new Set(p.variants.map((v: any) => v.pack)))
          const hasPackOf1 = packSizes.includes(1)
          
          // Skip image rotation for Pack of 1 with real colors (color rotation handles images)
          if (hasPackOf1 && !isCustomPack && uniqueColors.length > 0) {
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
    return () => clearInterval(timer)
  }, [products, manuallyInteracted])

  // Auto-rotate colors for all packs every 4s (random combinations)
  useEffect(() => {
    if (!products || products.length === 0) return
    const timer = setInterval(() => {
      setPackColors((prev) => {
        const next: Record<string, string[]> = { ...prev }
        for (const p of products) {
          // Skip if user has manually selected colors for this product
          if (manuallyInteracted[p.id]) continue
          
          // Get all pack sizes for this product
          const packSizes = Array.from(new Set(p.variants.map((v: any) => v.pack)))
          
          // Get unique colors for this product
          const uniqueColors = Array.from(new Set(p.variants.map((v: any) => v.color)))
          const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
          
          packSizes.forEach((packSize: any) => {
            const size = Number(packSize)
            const productKey = `${p.id}-${size}`
            
            // Rotate for all pack sizes (1, 2, and 3)
            if (size === 1) {
              if (isCustomPack) {
                // Custom Pack: use available colors
                const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
                next[productKey] = [randomColor]
              } else if (uniqueColors.length > 0) {
                // Real colors: cycle through product's actual colors
                const currentColor = prev[productKey]?.[0]
                const currentIndex = uniqueColors.findIndex(c => c === currentColor)
                const nextIndex = (currentIndex + 1) % uniqueColors.length
                next[productKey] = [uniqueColors[nextIndex] as string]
              }
            } else if (size === 2 || size === 3) {
              // Pack of 2/3: generate random color combinations
              const randomColors = Array.from({ length: size }, () => 
                availableColors[Math.floor(Math.random() * availableColors.length)]
              )
              next[productKey] = randomColors
            }
          })
        }
        return next
      })
    }, 4000) // Rotate every 4 seconds
    return () => clearInterval(timer)
  }, [products, manuallyInteracted, availableColors])

  // Initialize pack colors for products
  useEffect(() => {
    if (!products || products.length === 0) return
    setPackColors(prev => {
      const newPackColors: { [key: string]: string[] } = { ...prev }
      products.forEach(product => {
        const packSizes = Array.from(new Set(product.variants.map((v: any) => v.pack)))
        const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color)))
        const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
        
        packSizes.forEach(packSize => {
          const key = `${product.id}-${packSize}`
          const size = Number(packSize)
          // Only initialize if not already set
          if (!newPackColors[key]) {
            if (size === 1) {
              // Pack of 1: use first actual color if available, otherwise use available colors
              if (!isCustomPack && uniqueColors.length > 0) {
                newPackColors[key] = [uniqueColors[0] as string]
              } else {
                newPackColors[key] = [availableColors[0]]
              }
            } else {
              // Pack of 2/3: use random colors immediately
              const randomColors: string[] = []
              for (let i = 0; i < size; i++) {
                randomColors.push(availableColors[Math.floor(Math.random() * availableColors.length)])
              }
              newPackColors[key] = randomColors
            }
          }
        })
      })
      return newPackColors
    })
  }, [products, availableColors])

  // Sync selected variant with auto-rotating color for Pack of 1
  useEffect(() => {
    if (!products || products.length === 0) return
    products.forEach(product => {
      const packSizes = Array.from(new Set(product.variants.map((v: any) => v.pack)))
      packSizes.forEach(packSize => {
        const size = Number(packSize)
        const productKey = `${product.id}-${size}`
        const selectedVariantId = selectedVariants[productKey] || product.variants[0]?.id
        const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0]
        
        // Only sync for Pack of 1 with real colors when not manually interacted
        if (size === 1 && !manuallyInteracted[product.id]) {
          const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color)))
          const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
          
          if (!isCustomPack && uniqueColors.length > 0) {
            const currentColor = packColors[productKey]?.[0]
            if (currentColor && currentColor !== selectedVariant?.color) {
              // Find variant with the auto-rotating color
              const variantWithColor = product.variants.find((v: any) => 
                v.color === currentColor && v.size === selectedVariant?.size && v.pack === size
              )
              if (variantWithColor) {
                setSelectedVariants(prev => ({ ...prev, [productKey]: variantWithColor.id }))
                
                // Also update the image to match the color
                const imageIndex = getImageIndexForColor(currentColor, product.images.length, uniqueColors.map(String))
                setImgIndexByProduct(prev => ({ ...prev, [product.id]: imageIndex }))
              }
            }
          }
        }
      })
    })
  }, [packColors, products, manuallyInteracted])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true')
      if (response.ok) {
        const data = await response.json()
        // Normalize variants so sizes are S -> M -> L -> XL
        const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
        const normalized = (data || []).map((p: any) => {
          const variants = Array.isArray(p.variants) ? [...p.variants] : []
          variants.sort((a: any, b: any) => {
            const ar = typeof a.sizeRank === 'number' ? a.sizeRank : (sizeOrder[a.size] || 99)
            const br = typeof b.sizeRank === 'number' ? b.sizeRank : (sizeOrder[b.size] || 99)
            return ar - br || (a.pack || 0) - (b.pack || 0) || String(a.color).localeCompare(String(b.color))
          })
          return { ...p, variants }
        })
        setProducts(normalized)
        
        // Log warnings for products with issues (but still show them)
        const productsWithIssues = data.filter((p: any) => 
          !p.images || p.images.length === 0 || p.minPrice === 0
        )
        if (productsWithIssues.length > 0) {
          console.warn('[ProductHighlight] Products with missing images or price:', 
            productsWithIssues.map((p: any) => p.name)
          )
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-lg font-bold">Loading products...</div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  // Filter products by selected pack (null shows all)
  const productsByPack = products
    .filter(p => selectedPack === null || p.variants.some((v: any) => v.pack === selectedPack))
    .slice(0, 3) // Show max 3 products

  const openQuickBuy = (product: any) => {
    // Transform to QuickBuyProduct shape (prices already in rupees in /api/products)
    const qb = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      images: Array.isArray(product.images) ? product.images : [],
      variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        pack: v.pack,
        price: v.price,
        stock: v.stock,
        sizeRank: v.sizeRank,
      })) : [],
    }
    
    // Find the currently selected variant on the card (matching the card's logic exactly)
    const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
    const packVariants = (selectedPack === null ? product.variants : product.variants.filter((v: any) => v.pack === selectedPack))
      .sort((a: any, b: any) => {
        const ar = typeof a.sizeRank === 'number' ? a.sizeRank : (sizeOrder[a.size] || 99)
        const br = typeof b.sizeRank === 'number' ? b.sizeRank : (sizeOrder[b.size] || 99)
        return ar - br || String(a.color).localeCompare(String(b.color))
      })
    
    const key = `${product.id}-${selectedPack}`
    
    // First try to get the selected variant from the key
    let selectedVariantId = selectedVariants[key]
    
    // If not found and selectedPack is null (All filter), try to find from actual pack keys
    if (!selectedVariantId && selectedPack === null) {
      // Check if there's a selection for Pack of 1
      const pack1Key = `${product.id}-1`
      if (selectedVariants[pack1Key]) {
        selectedVariantId = selectedVariants[pack1Key]
      }
    }
    
    // Fallback to first variant
    if (!selectedVariantId) {
      selectedVariantId = packVariants[0]?.id
    }
    
    const current = packVariants.find((v: any) => v.id === selectedVariantId) || packVariants[0]
    
    // Get pack colors using the actual pack size
    const actualPackSize = current?.pack || 1
    const actualKey = `${product.id}-${actualPackSize}`
    
    // For Pack of 1, get the current color from packColors state (which reflects manual selection)
    let currentColors = packColors[actualKey] || []
    
    // If Pack of 1 and we have a selected color, ensure it's in the colors array
    if (actualPackSize === 1 && current?.color && currentColors.length === 0) {
      currentColors = [current.color]
    }
    
    console.log('[openQuickBuy] Final data:', {
      productId: product.id,
      productName: product.name,
      selectedPack,
      lookupKey: key,
      selectedVariantId,
      foundVariant: current,
      variantColor: current?.color,
      variantSize: current?.size,
      actualPackKey: actualKey,
      packColorsForKey: currentColors,
      allSelectedVariants: selectedVariants,
      allPackColors: packColors
    })
    
    setQuickBuyProduct({ ...qb, initialSelected: { size: current?.size, color: current?.color, pack: current?.pack }, initialPackColors: currentColors })
  }

  const handleSelectVariant = (productId: string, variantId: string, color?: string, totalImages?: number, allColors?: string[]) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }))
    // Switch to the image that matches this color
    if (color && totalImages && allColors) {
      const actualProductId = productId.split('-')[0]
      const imageIndex = getImageIndexForColor(color, totalImages, allColors)
      setImgIndexByProduct(prev => ({ ...prev, [actualProductId]: imageIndex }))
      // Mark this product as manually interacted to stop auto-rotation
      setManuallyInteracted(prev => ({ ...prev, [actualProductId]: true }))
    }
  }

  // Slider controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, products.length - 2))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, products.length - 2)) % Math.max(1, products.length - 2))
  }

  const sliderProducts = products.slice(currentSlide, currentSlide + 3)

  return (
    <>
      {/* Pack-based Products Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">Shop by Pack</h2>
            <p className="text-lg text-gray-secondary max-w-2xl mx-auto">
              Choose the perfect pack size for your needs
            </p>
          </div>

          {/* Pack Selector */}
          <div className="flex justify-center mb-12 px-4">
            <div className="inline-flex flex-col sm:flex-row border-2 border-gray-border w-full sm:w-auto max-w-2xl">
              <button
                onClick={() => setSelectedPack(null)}
                className={cn(
                  'px-4 sm:px-8 py-3 text-xs sm:text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap',
                  selectedPack === null ? 'bg-text-black text-white' : 'bg-white text-text-black hover:bg-gray-light active:bg-gray-light'
                )}
              >
                All
              </button>
              {[1, 2, 3].map((pack) => (
                <button
                  key={pack}
                  onClick={() => setSelectedPack(pack)}
                  className={cn(
                    'px-4 sm:px-8 py-3 text-xs sm:text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-t sm:border-t-0 sm:border-l border-gray-border',
                    selectedPack === pack
                      ? 'bg-text-black text-white'
                      : 'bg-white text-text-black hover:bg-gray-light active:bg-gray-light'
                  )}
                >
                  Pack of {pack}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards - 1 Row, 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {productsByPack.map((product) => {
              // Get variant(s) for selected pack
              const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
              const packVariants = (selectedPack === null ? product.variants : product.variants.filter((v: any) => v.pack === selectedPack))
                .sort((a: any, b: any) => {
                  const ar = typeof a.sizeRank === 'number' ? a.sizeRank : (sizeOrder[a.size] || 99)
                  const br = typeof b.sizeRank === 'number' ? b.sizeRank : (sizeOrder[b.size] || 99)
                  return ar - br || String(a.color).localeCompare(String(b.color))
                })
              // Try to get selected variant - first with selectedPack, then with actual pack sizes
              let selectedVariantId = selectedVariants[`${product.id}-${selectedPack}`]
              
              // If not found and selectedPack is null (All filter), try Pack of 1
              if (!selectedVariantId && selectedPack === null) {
                selectedVariantId = selectedVariants[`${product.id}-1`]
              }
              
              // Fallback to first variant
              if (!selectedVariantId) {
                selectedVariantId = packVariants[0]?.id
              }
              
              const selectedVariant = packVariants.find((v: any) => v.id === selectedVariantId)
              const uniqueSizes = Array.from(new Set(packVariants.map((v: any) => v.size)))
                .sort((a: any, b: any) => (sizeOrder[a] || 99) - (sizeOrder[b] || 99))
              
              // Use actual pack size in key, not selectedPack
              const actualPackSize = selectedVariant?.pack || 1

              return (
                <div
                  key={`${product.id}-${selectedPack}`}
                  className="border-2 border-gray-border hover:border-text-black transition-all duration-200"
                >
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative aspect-square bg-gray-light cursor-pointer group overflow-hidden">
                      {(() => {
                        const packSize = actualPackSize
                        const productKey = `${product.id}-${actualPackSize}`
                        const currentPackColors = packColors[productKey] || []
                        const uniqueColors = Array.from(new Set(packVariants.map((v: any) => v.color)))
                        
                        if (product.images.length === 0) {
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
                                src={product.images[imgIndexByProduct[product.id] ?? 0]}
                                alt={product.name}
                                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              {product.images.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); bumpImg(product.id, -1, product.images) }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 border border-gray-border"
                                    aria-label="Previous image"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); bumpImg(product.id, 1, product.images) }}
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
                        
                        // Pack of 2: Split Image (50/50) - Always show with defaults
                        if (packSize === 2) {
                          return (
                            <div className="absolute inset-0 flex">
                              {Array.from({ length: 2 }).map((_, idx: number) => {
                                const color = currentPackColors[idx] || availableColors[0]
                                const imageIndex = getImageIndexForColor(color, product.images.length, availableColors)
                                return (
                                  <div key={idx} className="relative w-1/2 h-full">
                                    <img
                                      src={product.images[imageIndex]}
                                      alt={color}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        
                        // Pack of 3: Grid Layout - Always show with defaults
                        if (packSize === 3) {
                          return (
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                              {Array.from({ length: 3 }).map((_, idx: number) => {
                                const color = currentPackColors[idx] || availableColors[0]
                                const imageIndex = getImageIndexForColor(color, product.images.length, availableColors)
                                return (
                                  <div 
                                    key={idx} 
                                    className={cn("relative", idx === 2 ? "col-span-2" : "")}
                                  >
                                    <img
                                      src={product.images[imageIndex]}
                                      alt={color}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )
                        }
                        
                        // Fallback
                        return (
                          <img
                            src={product.images[imgIndexByProduct[product.id] ?? 0]}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        )
                      })()}
                      {selectedVariant?.pack ? (
                        <div className="absolute left-3 top-3 bg-white/90 text-text-black text-xs font-bold tracking-wider-xl uppercase px-2 py-1 z-10">
                          Pack of {selectedVariant.pack}
                        </div>
                      ) : null}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xl font-bold mb-1 hover:underline cursor-pointer line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    {product.tagline && (
                      <p className="text-sm text-gray-secondary mb-3 line-clamp-1">{product.tagline}</p>
                    )}
                    <div className="text-2xl font-black mb-2">
                      ₹{selectedVariant?.price || 0}
                    </div>
                    
                    {/* Color Selector */}
                    {(() => {
                      const uniqueColors = Array.from(new Set(packVariants.map((v: any) => v.color)))
                      const isCustomPack = uniqueColors.length === 1 && uniqueColors[0] === 'Custom Pack'
                      const packSize = selectedVariant?.pack || 1
                      const productKey = `${product.id}-${packSize}`
                      
                      const currentPackColors = packColors[productKey] || Array(packSize).fill(availableColors[0])
                      
                      // Show color summary for multi-packs
                      const colorSummary = packSize > 1 && isCustomPack ? (
                        <div className="text-xs text-gray-secondary mb-3 uppercase font-bold">
                          Choose {packSize} Colors
                        </div>
                      ) : null
                      
                      // For Pack of 1 with actual colors (not Custom Pack)
                      if (packSize === 1 && !isCustomPack && uniqueColors.length > 0) {
                        const currentColor = currentPackColors[0] || selectedVariant?.color
                        const actualPackKey = `${product.id}-${packSize}`
                        return (
                          <div className="mb-4">
                            <div className="text-xs font-bold tracking-wider-xl uppercase text-gray-secondary mb-2">
                              Color: {currentColor || 'Select'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {uniqueColors.map((color) => {
                                const variantWithColor = packVariants.find((v: any) => v.color === color && v.size === selectedVariant?.size)
                                if (!variantWithColor) return null
                                return (
                                  <ColorDot
                                    key={String(color)}
                                    color={String(color)}
                                    colorCode={variantWithColor?.colorCode || getColorCode(String(color))}
                                    selected={currentColor === color}
                                    onClick={() => {
                                      console.log('[Home Color Click]', {
                                        productId: product.id,
                                        productKey,
                                        actualPackKey,
                                        color: String(color),
                                        variantId: variantWithColor.id
                                      })
                                      // Update selected variant (use productKey for selectedVariants state)
                                      handleSelectVariant(productKey, variantWithColor.id, String(color), product.images.length, uniqueColors.map(String))
                                      // Update pack colors to reflect manual selection (use actual pack key)
                                      setPackColors(prev => {
                                        const updated = { ...prev, [actualPackKey]: [String(color)] }
                                        console.log('[Home] Updated packColors:', updated)
                                        return updated
                                      })
                                    }}
                                    size="sm"
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )
                      }
                      
                      // For Pack of 2 or 3 (Custom Pack) - show multiple color dropdowns
                      if (packSize > 1 && isCustomPack) {
                        return (
                          <>
                            {colorSummary}
                            <div className="mb-4">
                            <div className="space-y-2">
                              {Array.from({ length: packSize }).map((_, index) => (
                                <div key={index}>
                                  <div className="text-xs text-gray-500 mb-1">Item {index + 1}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {availableColors.map((color) => (
                                      <ColorDot
                                        key={color}
                                        color={color}
                                        colorCode={getColorCode(color)}
                                        selected={currentPackColors[index] === color}
                                        onClick={() => {
                                          const newColors = [...currentPackColors]
                                          newColors[index] = color
                                          setPackColors(prev => ({ ...prev, [productKey]: newColors }))
                                          // Switch to the image that matches this color
                                          const imageIndex = getImageIndexForColor(color, product.images.length, availableColors)
                                          setImgIndexByProduct(prev => ({ ...prev, [product.id]: imageIndex }))
                                          // Mark this product as manually interacted to stop auto-rotation
                                          setManuallyInteracted(prev => ({ ...prev, [product.id]: true }))
                                        }}
                                        size="sm"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          </>
                        )
                      }
                      
                      return null
                    })()}

                    {/* Size Selector */}
                    {uniqueSizes.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold tracking-wider-xl uppercase text-gray-secondary mb-2">
                          Size: {selectedVariant?.size || 'Select'}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {uniqueSizes.map((size) => {
                            const variantWithSize = packVariants.find((v: any) => v.size === size && v.color === selectedVariant?.color)
                            if (!variantWithSize) return null
                            return (
                              <button
                                key={String(size)}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectVariant(`${product.id}-${selectedPack}`, variantWithSize.id) }}
                                className={cn(
                                  "py-2 text-sm font-bold border-2 transition-all",
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
                    )}

                    {/* Quick Buy Button (opens modal) */}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickBuy(product) }}
                      className="w-full bg-text-black text-white py-3 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors"
                    >
                      Quick Buy
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* View All Link */}
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-block text-sm font-bold tracking-wider-xl uppercase underline hover:text-gray-secondary transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Product Slider Section */}
      {products.length > 3 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black mb-4">More Products</h2>
              <p className="text-lg text-gray-secondary max-w-2xl mx-auto">
                Explore our complete collection
              </p>
            </div>

            {/* Slider */}
            <div className="relative">
              {/* Navigation Buttons */}
              {products.length > 3 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white border-2 border-gray-border hover:border-text-black p-3 transition-all"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white border-2 border-gray-border hover:border-text-black p-3 transition-all"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Slider Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sliderProducts.map((product) => {
                  const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id
                  const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId)

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group border-2 border-gray-border hover:border-text-black transition-all duration-200"
                    >
                      <div className="relative aspect-square bg-gray-light overflow-hidden">
                        {product.images.length > 0 && (
                          <img
                            src={product.images[imgIndexByProduct[product.id] ?? 0]}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                        {product.category && (
                          <div className="absolute left-3 top-3 bg-white/90 text-text-black text-xs font-bold tracking-wider-xl uppercase px-2 py-1">
                            {product.category}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-1 group-hover:underline line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-secondary mb-3 line-clamp-1">{product.tagline}</p>
                        <div className="text-2xl font-black">
                          ₹{product.minPrice} - ₹{product.maxPrice}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Slider Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.max(1, products.length - 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentSlide === index ? "bg-text-black w-8" : "bg-gray-border"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Shared Quick Buy Modal */}
      {quickBuyProduct && (
        <QuickBuyModal
          product={quickBuyProduct}
          onClose={() => setQuickBuyProduct(null)}
          initialSelected={(quickBuyProduct as any).initialSelected}
          initialPackColors={(quickBuyProduct as any).initialPackColors}
        />
      )}
    </>
  )
}
