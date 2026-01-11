'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Check, AlertCircle, Truck, Shield, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { guestCart } from '@/lib/guest-cart'
import { toast } from '@/components/toast'
import ColorDot from '@/components/common/ColorDot'
import { trackViewContent, trackAddToCart } from '@/components/FacebookPixel'

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

interface ProductDetailClientProps {
  product: any
  initialPack?: number
}

export default function ProductDetailClient({ 
  product: initialProduct, 
  initialPack 
}: ProductDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedPack, setSelectedPack] = useState<number>(initialPack || 1)
  const [packColors, setPackColors] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description')
  const [availableColors, setAvailableColors] = useState<string[]>(['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee'])
  const [userSelectedColors, setUserSelectedColors] = useState(false)

  // Fetch available colors with stock check
  useEffect(() => {
    const fetchColors = async () => {
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

  // Helper function to get image index for a color
  const getImageIndexForColor = (color: string, totalImages: number, allColors: string[]): number => {
    if (totalImages === 0) return 0
    
    // Find the index of this color in the list of all available colors
    const colorIndex = allColors.findIndex(c => c.toLowerCase() === color.toLowerCase())
    
    if (colorIndex === -1) return 0
    
    // Map color index to image index
    // If we have enough images, use direct mapping
    if (colorIndex < totalImages) return colorIndex
    
    // Otherwise, cycle through available images
    return colorIndex % totalImages
  }

  const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }

  // Auto-scroll thumbnail carousel when image changes
  useEffect(() => {
    const carousel = document.getElementById('thumbnail-carousel')
    const thumbnail = carousel?.children[currentImageIndex] as HTMLElement
    if (thumbnail) {
      thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentImageIndex])

  // Process product data
  const product = useMemo(() => {
    const images: string[] = Array.isArray(initialProduct.images) ? initialProduct.images : []
    const variants = (initialProduct.productvariant || initialProduct.variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      pack: v.pack,
      price: typeof v.price === 'number' ? v.price / 100 : v.price,
      stock: v.stock,
      sizeRank: v.sizeRank,
    }))

    const sortedVariants = [...variants].sort((a: any, b: any) => 
      (a.sizeRank ?? sizeOrder[a.size] ?? 99) - (b.sizeRank ?? sizeOrder[b.size] ?? 99) || 
      a.pack - b.pack || 
      String(a.color).localeCompare(String(b.color))
    )

    return {
      ...initialProduct,
      images,
      variants: sortedVariants
    }
  }, [initialProduct])

  const uniquePacks = useMemo(() => {
    const packs = Array.from(new Set(product.variants.map((v: any) => v.pack as number))) as number[]
    return packs.sort((a, b) => a - b)
  }, [product.variants])

  // Track Facebook Pixel ViewContent event when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0]
      trackViewContent({
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: firstVariant.price,
        currency: 'INR'
      })
    }
  }, [product])

  const uniqueSizes = useMemo(() => {
    const sizes = product.variants
      .filter((v: any) => v.pack === selectedPack)
      .map((v: any) => v.size as string)
    const uniqueSizeArray = Array.from(new Set(sizes)) as string[]
    return uniqueSizeArray.sort((a, b) => (sizeOrder[a] ?? 99) - (sizeOrder[b] ?? 99))
  }, [product.variants, selectedPack])

  const uniqueColors = useMemo(() => {
    const colors = product.variants
      .filter((v: any) => v.pack === selectedPack)
      .map((v: any) => v.color)
    const colorSet = Array.from(new Set(colors))
    const isCustom = colorSet.length === 1 && colorSet[0] === 'Custom Pack'
    
    if (isCustom) return []
    
    // Sort colors in proper order
    const colorOrder = ['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee']
    return colorSet.sort((a, b) => {
      const aIndex = colorOrder.indexOf(String(a))
      const bIndex = colorOrder.indexOf(String(b))
      if (aIndex === -1 && bIndex === -1) return String(a).localeCompare(String(b))
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [product.variants, selectedPack])

  const isCustomPack = uniqueColors.length === 0

  // Initialize selections
  useEffect(() => {
    if (uniquePacks.length > 0 && !uniquePacks.includes(selectedPack)) {
      setSelectedPack(uniquePacks[0] as number)
    }
  }, [uniquePacks, selectedPack])

  useEffect(() => {
    if (isCustomPack) {
      setPackColors(Array(selectedPack).fill(availableColors[0]))
      setUserSelectedColors(false) // Reset flag when pack changes
    } else if (uniqueColors.length > 0) {
      setPackColors([uniqueColors[0] as string])
    }
  }, [selectedPack, isCustomPack, uniqueColors, availableColors])

  useEffect(() => {
    if (uniqueSizes.length > 0 && !uniqueSizes.includes(selectedSize)) {
      setSelectedSize(uniqueSizes[0] as string)
    }
  }, [uniqueSizes, selectedSize])

  // Auto-rotate colors for Pack of 1 with actual colors (not custom pack)
  useEffect(() => {
    // Only for Pack of 1 with real colors, and only if user hasn't selected colors
    if (selectedPack !== 1 || isCustomPack || userSelectedColors || uniqueColors.length === 0) {
      return
    }
    
    // Initial color
    if (uniqueColors.length > 0) {
      setPackColors([uniqueColors[0] as string])
    }
    
    // Start rotation through available colors
    const timer = setInterval(() => {
      setPackColors(prev => {
        const currentColor = prev[0]
        const currentIndex = uniqueColors.findIndex(c => c === currentColor)
        const nextIndex = (currentIndex + 1) % uniqueColors.length
        return [uniqueColors[nextIndex] as string]
      })
    }, 4000)
    
    return () => clearInterval(timer)
  }, [selectedPack, isCustomPack, userSelectedColors, uniqueColors])

  // Update image when Pack of 1 color auto-rotates
  useEffect(() => {
    if (selectedPack === 1 && !isCustomPack && !userSelectedColors && packColors.length > 0 && uniqueColors.length > 0) {
      const color = packColors[0]
      const imageIndex = getImageIndexForColor(color, product.images.length, uniqueColors as string[])
      setCurrentImageIndex(imageIndex)
    }
  }, [packColors, selectedPack, isCustomPack, userSelectedColors, uniqueColors, product.images.length])

  // Auto-rotate pack colors for custom packs (Pack of 1, 2, 3) every 4s
  useEffect(() => {
    // Only auto-rotate for custom packs, and only if user hasn't selected colors
    if (!isCustomPack || userSelectedColors) {
      return
    }
    
    // Initial random colors
    const initialColors = Array.from({ length: selectedPack }, () => 
      availableColors[Math.floor(Math.random() * availableColors.length)]
    )
    setPackColors(initialColors)
    
    // Then start interval
    const timer = setInterval(() => {
      // Generate random color combination for all pack sizes
      if (selectedPack === 1) {
        // Pack of 1: cycle through single colors
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
        setPackColors([randomColor])
      } else {
        // Pack of 2/3: generate random color combinations
        const randomColors = Array.from({ length: selectedPack }, () => 
          availableColors[Math.floor(Math.random() * availableColors.length)]
        )
        setPackColors(randomColors)
      }
    }, 4000)
    
    return () => clearInterval(timer)
  }, [selectedPack, isCustomPack, userSelectedColors]) // Removed availableColors from deps to avoid re-triggering

  const currentVariant = useMemo(() => {
    if (selectedPack > 1) {
      // For Pack 2/3, find the first variant with matching size and pack
      return product.variants.find((v: any) => v.size === selectedSize && v.pack === selectedPack)
    }
    const selectedColor = packColors[0] || uniqueColors[0]
    return product.variants.find((v: any) => 
      v.size === selectedSize && v.color === selectedColor && v.pack === selectedPack
    )
  }, [product.variants, selectedSize, selectedPack, packColors, uniqueColors])

  // For Pack 2/3, check if all selected colors have stock
  const areAllColorsInStock = useMemo(() => {
    if (selectedPack === 1) {
      return (currentVariant?.stock ?? 0) > 0
    }
    
    // For Pack 2/3, check each selected color
    if (!selectedSize || packColors.length !== selectedPack) {
      return false
    }
    
    return packColors.every(color => {
      const variant = product.variants.find((v: any) => 
        v.size === selectedSize && 
        v.color === color && 
        v.pack === selectedPack
      )
      return variant && variant.stock > 0
    })
  }, [selectedPack, selectedSize, packColors, product.variants, currentVariant])

  // Calculate actual available stock for Pack 2/3 (minimum across all selected colors)
  const availableStock = useMemo(() => {
    if (selectedPack === 1) {
      return currentVariant?.stock ?? 0
    }
    
    // For Pack 2/3, find minimum stock across all selected colors
    if (!selectedSize || packColors.length !== selectedPack) {
      return 0
    }
    
    const stocks = packColors.map(color => {
      const variant = product.variants.find((v: any) => 
        v.size === selectedSize && 
        v.color === color && 
        v.pack === selectedPack
      )
      return variant?.stock ?? 0
    })
    
    return Math.min(...stocks)
  }, [selectedPack, selectedSize, packColors, product.variants, currentVariant])

  const isOutOfStock = !areAllColorsInStock || availableStock === 0
  const isLowStock = !isOutOfStock && availableStock <= 5

  const handleAddToCart = () => {
    if (!currentVariant) {
      toast.error('Please select all options')
      return
    }
    if (isOutOfStock) {
      toast.error('This variant is out of stock')
      return
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    guestCart.addItem({
      productId: product.id,
      variantId: currentVariant.id,
      quantity,
      pack: currentVariant.pack,
      size: currentVariant.size,
      color: currentVariant.color,
      price: currentVariant.price,
      packColors: selectedPack > 1 ? packColors : undefined,
    })

    const colorSummary = selectedPack === 1 ? packColors[0] : packColors.join(', ')
    toast.success(`Added ${quantity} pack(s) to cart! (${colorSummary})`)

    // Track Facebook Pixel AddToCart event
    trackAddToCart({
      content_name: product.name,
      content_ids: [currentVariant.id],
      content_type: 'product',
      value: (currentVariant.price / 100) * quantity,
      currency: 'INR'
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/cart'
  }

  const rawDesc: string = typeof product.description === 'string' ? product.description : ''
  const formattedDesc = rawDesc
    .replace(/(What(?:'|'|`|\u2019)s\s+Special)/gi, '<strong>$1</strong>')
    .replace(/(^|\n)(Fabric)(?=\s*\n|\s*:|\s)/gi, '$1<strong>$2</strong>')
    .replace(/\n/g, '<br />')

  return (
    <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/shop" className="text-sm text-gray-secondary hover:text-text-black inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white border border-gray-200 overflow-hidden group rounded-lg shadow-sm">
              {product.images.length > 0 ? (
                <>
                  {/* Pack of 1: Single Image */}
                  {selectedPack === 1 && (
                    <div className="relative w-full h-full">
                      <img
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                  )}

                  {/* Pack of 2: Split Image (50/50) - Always show with defaults */}
                  {selectedPack === 2 && (
                    <div className="relative w-full h-full flex">
                      {Array.from({ length: 2 }).map((_, idx) => {
                        const colorList = isCustomPack ? availableColors : (uniqueColors as string[])
                        const color = packColors[idx] || colorList[0]
                        const imageIndex = getImageIndexForColor(color, product.images.length, colorList)
                        return (
                          <div key={idx} className="relative w-1/2 h-full">
                            <img
                              src={product.images[imageIndex]}
                              alt={color}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {color}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Pack of 3: Grid Layout (2 top, 1 bottom) - Always show with defaults */}
                  {selectedPack === 3 && (
                    <div className="relative w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
                      {Array.from({ length: 3 }).map((_, idx) => {
                        const colorList = isCustomPack ? availableColors : (uniqueColors as string[])
                        const color = packColors[idx] || colorList[0]
                        const imageIndex = getImageIndexForColor(color, product.images.length, colorList)
                        return (
                          <div 
                            key={idx} 
                            className={cn(
                              "relative",
                              idx === 2 ? "col-span-2" : ""
                            )}
                          >
                            <img
                              src={product.images[imageIndex]}
                              alt={color}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {color}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Navigation Arrows - Only for Pack of 1 */}
                  {selectedPack === 1 && product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter - Only for Pack of 1 */}
                  {selectedPack === 1 && product.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">No Image Available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="relative group">
                {/* Scroll container */}
                <div 
                  id="thumbnail-carousel"
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1 pb-2" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx)
                        // Scroll thumbnail into view
                        const carousel = document.getElementById('thumbnail-carousel')
                        const thumbnail = carousel?.children[idx] as HTMLElement
                        if (thumbnail) {
                          thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                        }
                      }}
                      className={cn(
                        "relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md transition-all duration-300",
                        currentImageIndex === idx
                          ? "ring-2 ring-text-black"
                          : "ring-1 ring-gray-200 hover:ring-gray-400"
                      )}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} view ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {/* Selected overlay */}
                      {currentImageIndex === idx && (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Scroll buttons */}
                {product.images.length > 5 && (
                  <>
                    <button
                      onClick={() => {
                        const carousel = document.getElementById('thumbnail-carousel')
                        if (carousel) {
                          carousel.scrollBy({ left: -200, behavior: 'smooth' })
                        }
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const carousel = document.getElementById('thumbnail-carousel')
                        if (carousel) {
                          carousel.scrollBy({ left: 200, behavior: 'smooth' })
                        }
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Gradient indicators */}
                    <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                  </>
                )}
              </div>
            )}

            {/* Image Dots Indicator (for mobile) */}
            {product.images.length > 1 && (
              <div className="flex justify-center gap-1.5 lg:hidden">
                {product.images.map((_img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      currentImageIndex === idx
                        ? "w-6 bg-text-black"
                        : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">{product.name}</h1>
              {product.tagline && (
                <p className="text-lg text-gray-secondary">{product.tagline}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-black">₹{currentVariant?.price || product.minPrice}</div>
              {currentVariant?.pack && currentVariant.pack > 1 && (
                <div className="text-sm text-gray-secondary">
                  ₹{Math.round((currentVariant.price || 0) / currentVariant.pack)} each
                </div>
              )}
            </div>

            {/* Stock Status */}
            {currentVariant && (
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded">
                    <AlertCircle className="w-4 h-4" />
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded">
                    <AlertCircle className="w-4 h-4" />
                    Only {availableStock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded">
                    <Check className="w-4 h-4" />
                    In Stock ({availableStock} available)
                  </span>
                )}
              </div>
            )}

            <div className="border-t border-gray-border pt-6 space-y-6">
              {/* Pack Selection - Only show if multiple packs available */}
              {uniquePacks.length > 1 && (
                <div>
                  <label className="block text-sm font-bold mb-3">Select Pack</label>
                  <div className="grid grid-cols-3 gap-3">
                    {uniquePacks.map((pack: any) => {
                      const packVariant = product.variants.find((v: any) => v.pack === pack && v.size === selectedSize)
                      return (
                        <button
                          key={String(pack)}
                          onClick={() => setSelectedPack(pack as number)}
                          className={cn(
                            "py-4 px-4 border-2 transition-all text-left",
                            selectedPack === pack
                              ? "border-text-black bg-text-black text-white"
                              : "border-gray-border hover:border-text-black"
                          )}
                        >
                          <div className="font-bold text-sm">Pack of {String(pack)}</div>
                          {packVariant && (
                            <div className={cn("text-xs mt-1", selectedPack === pack ? "text-white/80" : "text-gray-500")}>
                              ₹{packVariant.price}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {selectedPack > 1 ? (
                // Pack of 2 or 3: Show multi-color selector
                <div>
                  <label className="block text-sm font-bold mb-3">
                    Choose {selectedPack} Color{selectedPack > 1 ? 's' : ''}
                    <span className="block text-xs font-normal text-gray-500 mt-1">
                      Select {selectedPack} color{selectedPack > 1 ? 's' : ''} (can be same or different)
                    </span>
                  </label>
                  <div className="space-y-3">
                    {Array.from({ length: selectedPack }).map((_, index) => (
                      <div key={index} className="border border-gray-border p-3 rounded">
                        <div className="text-xs font-bold mb-2 text-gray-600">Item {index + 1}</div>
                        <div className="flex flex-wrap gap-3">
                          {(uniqueColors.length > 0 ? uniqueColors : availableColors).map((color) => {
                            // Find a variant with this color to check stock
                            const variant = product.variants.find((v: any) => 
                              v.color.toLowerCase() === String(color).toLowerCase() && 
                              v.size === selectedSize && 
                              v.pack === selectedPack
                            )
                            const colorCode = variant?.colorCode || getColorCode(String(color))
                            const hasStock = variant && variant.stock > 0
                            const isDisabled = selectedSize && !hasStock
                            
                            return (
                              <div key={String(color)} className="relative">
                                <div className={isDisabled ? 'opacity-30 cursor-not-allowed' : ''}>
                                  <ColorDot
                                    color={String(color)}
                                    colorCode={colorCode}
                                    selected={packColors[index] === color}
                                    onClick={() => {
                                      if (isDisabled) {
                                        toast.error(`${color} is out of stock in size ${selectedSize}`)
                                        return
                                      }
                                      const newColors = [...packColors]
                                      newColors[index] = String(color)
                                      setPackColors(newColors)
                                      setUserSelectedColors(true) // Stop auto-rotation
                                      // Switch to the image that matches this color
                                      const colorList = uniqueColors.length > 0 ? (uniqueColors as string[]) : availableColors
                                      const imageIndex = getImageIndexForColor(String(color), product.images.length, colorList)
                                      setCurrentImageIndex(imageIndex)
                                    }}
                                    size="md"
                                    showLabel
                                  />
                                </div>
                                {isDisabled && (
                                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full leading-tight">
                                    OUT
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : uniqueColors.length > 0 && (
                // Pack of 1: Show single color selector
                <div>
                  <label className="block text-sm font-bold mb-3">Select Color</label>
                  <div className="flex flex-wrap gap-3">
                    {uniqueColors.map((color: any) => {
                      const variant = product.variants.find((v: any) => v.color === color)
                      return (
                        <ColorDot
                          key={String(color)}
                          color={String(color)}
                          colorCode={variant?.colorCode || getColorCode(String(color))}
                          selected={packColors[0] === color}
                          onClick={() => {
                            setPackColors([color as string])
                            setUserSelectedColors(true) // Stop auto-rotation
                            // Switch to the image that matches this color
                            const imageIndex = getImageIndexForColor(String(color), product.images.length, uniqueColors as string[])
                            setCurrentImageIndex(imageIndex)
                          }}
                          size="lg"
                          showLabel
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-bold mb-3">Select Size</label>
                <div className="grid grid-cols-4 gap-3">
                  {uniqueSizes.map((size: any) => (
                    <button
                      key={String(size)}
                      onClick={() => setSelectedSize(size as string)}
                      className={cn(
                        "py-3 text-sm font-bold border-2 transition-all",
                        selectedSize === size
                          ? "border-text-black bg-text-black text-white"
                          : "border-gray-border hover:border-text-black"
                      )}
                    >
                      {String(size)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 border-2 border-gray-border hover:border-text-black flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-16 text-center font-bold text-xl">{quantity}</div>
                  <button
                    onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                    disabled={availableStock <= quantity}
                    className="w-12 h-12 border-2 border-gray-border hover:border-text-black flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!currentVariant || isOutOfStock}
                  className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!currentVariant || isOutOfStock}
                  className="w-full border-2 border-text-black text-text-black py-4 text-sm font-bold tracking-wider uppercase hover:bg-gray-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

            </div>

            {/* Features */}
            <div className="border-t border-gray-border pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-gray-secondary" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-gray-secondary" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-gray-secondary" />
                <span>100% authentic products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="border-t border-gray-border">
          <div className="flex gap-8 border-b border-gray-border">
            {(['description', 'details', 'care'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-text-black text-text-black"
                    : "border-transparent text-gray-secondary hover:text-text-black"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formattedDesc }} />
            )}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-bold text-gray-secondary mb-1">SKU</div>
                    <div className="text-sm">{currentVariant?.sku || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-secondary mb-1">Category</div>
                    <div className="text-sm capitalize">{product.category || 'Underwear'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-secondary mb-1">Material</div>
                    <div className="text-sm">Premium Cotton Blend</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-secondary mb-1">Made In</div>
                    <div className="text-sm">India</div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'care' && (
              <div className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Machine wash cold with like colors</li>
                  <li>Do not bleach</li>
                  <li>Tumble dry low</li>
                  <li>Do not iron</li>
                  <li>Do not dry clean</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
