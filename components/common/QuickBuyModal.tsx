'use client'

import { useMemo, useState, useEffect } from 'react'
import { X, AlertCircle, Check, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/toast'
import { guestCart } from '@/lib/guest-cart'
import ColorDot from '@/components/common/ColorDot'
import { trackAddToCart } from '@/components/FacebookPixel'

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

export type QuickBuyProduct = {
  id: string
  name: string
  slug?: string
  tagline?: string
  images: string[]
  variants: Array<{
    id: string
    sku: string
    size: string
    color: string
    colorCode?: string
    pack: number
    price: number
    stock: number
    sizeRank?: number
  }>
}

export default function QuickBuyModal({ product, onClose, initialSelected, initialPackColors }: { product: QuickBuyProduct; onClose: () => void; initialSelected?: { size?: string; color?: string; pack?: number }; initialPackColors?: string[] }) {
  console.log('[QuickBuyModal] Received props:', {
    productId: product?.id,
    productName: product?.name,
    initialSelected,
    initialPackColors
  })
  
  const sizeOrder: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }
  const [availableColors, setAvailableColors] = useState<string[]>([])
  
  const sortedVariants = useMemo(() => {
    const v = [...(product?.variants || [])]
    v.sort((a, b) => (a.sizeRank ?? sizeOrder[a.size] ?? 99) - (b.sizeRank ?? sizeOrder[b.size] ?? 99) || a.pack - b.pack || a.color.localeCompare(b.color))
    return v
  }, [product])

  const uniqueSizes = useMemo(() => Array.from(new Set(sortedVariants.map(v => v.size))).sort((a, b) => (sizeOrder[a] ?? 99) - (sizeOrder[b] ?? 99)), [sortedVariants])
  const uniquePacks = useMemo(() => Array.from(new Set(sortedVariants.map(v => v.pack))).sort((a, b) => a - b), [sortedVariants])
  
  // For colors: get from variants or fetch from API
  const uniqueColors = useMemo(() => {
    const colors = Array.from(new Set(sortedVariants.map(v => v.color)))
    console.log('[QuickBuyModal] uniqueColors calculated:', colors)
    // If only "Custom Pack" exists, use fetched colors
    if (colors.length === 1 && colors[0] === 'Custom Pack') {
      return availableColors.length > 0 ? availableColors : ['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee']
    }
    // Sort colors in proper order
    const colorOrder = ['Black', 'Royal Blue', 'Dark Green', 'Maroon', 'Grey', 'Coffee']
    return colors.sort((a, b) => {
      const aIndex = colorOrder.indexOf(a)
      const bIndex = colorOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [sortedVariants, availableColors])

  // Fetch available colors from Pack of 1 products
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
            console.log('[QuickBuyModal] Available colors (in stock):', sortedColors)
          } else {
            console.log('[QuickBuyModal] No colors in stock')
          }
        }
      } catch (error) {
        console.error('Failed to fetch colors:', error)
      }
    }
    
    // Only fetch if we have Custom Pack variants
    const hasCustomPack = sortedVariants.some(v => v.color === 'Custom Pack')
    if (hasCustomPack) {
      fetchColors()
    }
  }, [sortedVariants])

  const [selectedSize, setSelectedSize] = useState<string>(initialSelected?.size && uniqueSizes.includes(initialSelected.size) ? initialSelected.size : uniqueSizes[0])
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    // For Pack of 1, prioritize initialSelected.color even if not in uniqueColors yet
    const color = initialSelected?.color || uniqueColors[0] || 'Black'
    console.log('[QuickBuyModal] Initializing selectedColor:', color, {
      initialSelectedColor: initialSelected?.color,
      uniqueColors,
      fallback: uniqueColors[0] || 'Black'
    })
    return color
  })
  const [selectedPack, setSelectedPack] = useState<number>(initialSelected?.pack && uniquePacks.includes(initialSelected.pack) ? initialSelected.pack : uniquePacks[0])
  const [packColors, setPackColors] = useState<string[]>(() => {
    // For Pack of 1, use initialSelected.color if available
    let colors: string[]
    if (initialPackColors && initialPackColors.length > 0) {
      colors = initialPackColors
    } else if (initialSelected?.color) {
      colors = [initialSelected.color]
    } else {
      colors = [uniqueColors[0] || 'Black']
    }
    console.log('[QuickBuyModal] Initializing packColors:', colors, {
      initialPackColors,
      initialSelectedColor: initialSelected?.color,
      uniqueColors
    })
    return colors
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sync state with initialSelected when modal opens or product changes
  useEffect(() => {
    console.log('[QuickBuyModal] useEffect - Syncing with initialSelected:', {
      productId: product?.id,
      initialSelected,
      currentSelectedColor: selectedColor,
      uniqueColors
    })
    
    // Update color
    if (initialSelected?.color) {
      console.log('[QuickBuyModal] Setting selectedColor to', initialSelected.color)
      setSelectedColor(initialSelected.color)
      setPackColors([initialSelected.color])
      
      // Update image to match color
      if (uniqueColors.length > 0) {
        const imageIndex = getImageIndexForColor(initialSelected.color, product.images.length, uniqueColors)
        setCurrentImageIndex(imageIndex)
      }
    }
    
    // Update size
    if (initialSelected?.size) {
      setSelectedSize(initialSelected.size)
    }
    
    // Update pack
    if (initialSelected?.pack) {
      setSelectedPack(initialSelected.pack)
    }
  }, [product?.id, initialSelected?.color, initialSelected?.size, initialSelected?.pack, uniqueColors.length])

  // Helper function to get image index for a color
  const getImageIndexForColor = (color: string, totalImages: number, allColors: string[]): number => {
    if (totalImages === 0) return 0
    const colorIndex = allColors.findIndex(c => c.toLowerCase() === color.toLowerCase())
    if (colorIndex === -1) return 0
    if (colorIndex < totalImages) return colorIndex
    return colorIndex % totalImages
  }
  
  // For pack 2 & 3, we need to find variant by size and pack only (color is "Custom Pack" in DB)
  const currentVariant = useMemo(() => {
    if (selectedPack > 1) {
      // For multi-packs, find by size and pack only
      return sortedVariants.find(v => v.size === selectedSize && v.pack === selectedPack)
    }
    // For pack of 1, match exact color
    return sortedVariants.find(v => v.size === selectedSize && v.color === selectedColor && v.pack === selectedPack)
  }, [sortedVariants, selectedSize, selectedColor, selectedPack])
  const [quantity, setQuantity] = useState(1)

  // Initialize pack colors on mount only if not provided
  useEffect(() => {
    if (initialPackColors && initialPackColors.length > 0) {
      // Use provided colors
      setPackColors(initialPackColors)
    } else if (selectedPack === 1) {
      setPackColors([selectedColor])
    } else {
      // For pack 2 & 3, use first available color
      setPackColors(Array(selectedPack).fill(uniqueColors[0]))
    }
  }, []) // Only run on mount

  // Reset pack colors when pack size changes
  const handlePackChange = (pack: number) => {
    setSelectedPack(pack)
    if (pack === 1) {
      setPackColors([selectedColor])
    } else {
      // For pack 2 & 3, use first available color
      setPackColors(Array(pack).fill(uniqueColors[0]))
    }
  }

  // Update pack color at specific index
  const updatePackColor = (index: number, color: string) => {
    const newColors = [...packColors]
    newColors[index] = color
    setPackColors(newColors)
    // Switch to the image that matches this color
    const imageIndex = getImageIndexForColor(color, product.images.length, availableColors)
    setCurrentImageIndex(imageIndex)
  }

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
      const variant = sortedVariants.find(v => 
        v.size === selectedSize && 
        v.color === color && 
        v.pack === selectedPack
      )
      return variant && variant.stock > 0
    })
  }, [selectedPack, selectedSize, packColors, sortedVariants, currentVariant])

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
      const variant = sortedVariants.find(v => 
        v.size === selectedSize && 
        v.color === color && 
        v.pack === selectedPack
      )
      return variant?.stock ?? 0
    })
    
    return Math.min(...stocks)
  }, [selectedPack, selectedSize, packColors, sortedVariants, currentVariant])

  const isOutOfStock = !areAllColorsInStock || availableStock === 0
  const isLowStock = !isOutOfStock && availableStock <= 5

  const confirmAddToCart = () => {
    if (!currentVariant) {
      toast.error('Please select a variant')
      return
    }
    if (!areAllColorsInStock) {
      toast.error('One or more selected colors are out of stock')
      return
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`)
      return
    }

    // For packs > 1, validate all colors are selected
    if (selectedPack > 1 && packColors.length !== selectedPack) {
      toast.error(`Please select ${selectedPack} colors`)
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

    // Facebook Pixel: AddToCart
    try {
      trackAddToCart({
        content_name: product.name,
        content_ids: [currentVariant.id],
        content_type: 'product',
        value: Number(currentVariant.price) * quantity,
        currency: 'INR',
      })
    } catch (e) {
      // ignore pixel errors
    }

    const colorSummary = selectedPack === 1 ? selectedColor : packColors.join(', ')
    toast.success(`Added ${quantity} pack(s) to cart! (${colorSummary})`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-lg rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative border-b border-gray-border flex-shrink-0">
          {product.images && product.images.length > 0 && (
            <div className="absolute inset-0 opacity-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.images[currentImageIndex] || product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative p-4 sm:p-6">
            <button onClick={onClose} className="absolute right-2 top-2 sm:right-4 sm:top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-3 sm:gap-4">
              {product.images && product.images.length > 0 && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 border-gray-border rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[currentImageIndex] || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-8">
                <h2 className="text-lg sm:text-2xl font-black mb-1 truncate">{product.name}</h2>
                {product.tagline && <p className="text-xs sm:text-sm text-gray-secondary truncate">{product.tagline}</p>}
                <div className="mt-1 sm:mt-2 text-xs text-gray-secondary">{sortedVariants.length} variants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-4 sm:space-y-6">
            {/* Pack */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3">Select Pack</label>
              <div className="grid grid-cols-3 gap-2">
                {uniquePacks.map((p) => {
                  const packVariant = sortedVariants.find(v => v.size === selectedSize && v.pack === p)
                  return (
                    <button key={String(p)} onClick={() => handlePackChange(p)} className={cn('py-3 sm:py-4 px-2 sm:px-4 border-2 transition-all text-left', selectedPack === p ? 'border-text-black bg-text-black text-white' : 'border-gray-border hover:border-text-black active:border-text-black')}>
                      <div className="font-bold text-xs sm:text-sm">Pack of {p}</div>
                      {packVariant && (
                        <div className={cn('text-xs mt-1', selectedPack === p ? 'text-white/80' : 'text-gray-500')}>₹{packVariant.price}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Selection */}
            {selectedPack === 1 ? (
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((c) => {
                    const variant = sortedVariants.find((v: any) => v.color === c)
                    return (
                      <ColorDot
                        key={c}
                        color={c}
                        colorCode={variant?.colorCode || getColorCode(c)}
                        selected={selectedColor === c}
                        onClick={() => { 
                          setSelectedColor(c); 
                          setPackColors([c]);
                          const imageIndex = getImageIndexForColor(c, product.images.length, uniqueColors);
                          setCurrentImageIndex(imageIndex);
                        }}
                        size="lg"
                        showLabel
                      />
                    )
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3">
                  Select Colors for Pack of {selectedPack}
                  <span className="block text-xs font-normal text-gray-500 mt-1">Choose {selectedPack} colors (can be same or different)</span>
                </label>
                <div className="space-y-3">
                  {Array.from({ length: selectedPack }).map((_, index) => (
                    <div key={index} className="border border-gray-border p-3 rounded">
                      <div className="text-xs font-bold mb-2 text-gray-600">Item {index + 1}</div>
                      <div className="flex flex-wrap gap-3">
                        {uniqueColors.map((c) => {
                          // Find variant with this color to check stock
                          const variant = sortedVariants.find((v: any) => 
                            v.color.toLowerCase() === c.toLowerCase() && 
                            v.size === selectedSize && 
                            v.pack === selectedPack
                          )
                          const hasStock = variant && variant.stock > 0
                          const isDisabled = selectedSize && !hasStock
                          
                          return (
                            <div key={c} className="relative">
                              <div className={isDisabled ? 'opacity-30 cursor-not-allowed' : ''}>
                                <ColorDot
                                  color={c}
                                  colorCode={variant?.colorCode || getColorCode(c)}
                                  selected={packColors[index] === c}
                                  onClick={() => {
                                    if (isDisabled) {
                                      toast.error(`${c} is out of stock in size ${selectedSize}`)
                                      return
                                    }
                                    updatePackColor(index, c)
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
            )}

            {/* Size */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3">Select Size</label>
              <div className="grid grid-cols-4 gap-2">
                {uniqueSizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={cn('py-2 sm:py-3 px-2 text-xs sm:text-sm font-bold border-2 transition-all', selectedSize === s ? 'border-text-black bg-text-black text-white' : 'border-gray-border hover:border-text-black active:border-text-black')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>



            {/* Selected Configuration Summary */}
            {selectedPack && (
              <div className="border-2 border-text-black p-3 sm:p-4 bg-gray-50">
                <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base">Your Selection</div>
                    <div className="text-xs sm:text-sm text-gray-secondary mt-1">
                      Size {selectedSize} • Pack of {selectedPack}
                    </div>
                    {selectedPack === 1 ? (
                      <div className="text-xs sm:text-sm text-gray-secondary capitalize">
                        Color: {selectedColor}
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-secondary mt-1">
                        Colors: {packColors.map((c, i) => (
                          <span key={i} className="capitalize">
                            {c}{i < packColors.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {currentVariant && (
                    <div className="text-xl sm:text-2xl font-black flex-shrink-0">₹{currentVariant.price}</div>
                  )}
                </div>
                {currentVariant && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span className="hidden xs:inline">Out of Stock</span>
                        <span className="xs:hidden">Out</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>Only {availableStock} left</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded">
                        <Check className="w-3 h-3" />
                        <span className="hidden xs:inline">In Stock ({availableStock})</span>
                        <span className="xs:hidden">In Stock</span>
                      </span>
                    )}
                    <span className="text-xs bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-border">
                      <span className="hidden xs:inline">SKU: </span>{currentVariant.sku}
                    </span>
                    {currentVariant.pack > 1 && (
                      <span className="text-xs bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-gray-border">
                        ₹{Math.round(currentVariant.price / currentVariant.pack)} each
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-border p-4 sm:p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-bold">Quantity</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-gray-border hover:border-text-black active:border-text-black flex items-center justify-center transition-colors touch-manipulation" 
                disabled={quantity <= 1} 
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 sm:w-16 text-center font-bold text-base sm:text-lg">{quantity}</div>
              <button 
                onClick={() => setQuantity(q => Math.min(availableStock, q + 1))} 
                className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-gray-border hover:border-text-black active:border-text-black flex items-center justify-center transition-colors touch-manipulation" 
                disabled={availableStock <= quantity} 
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={confirmAddToCart} 
              disabled={!currentVariant || (currentVariant?.stock ?? 0) === 0} 
              className="flex-1 bg-text-black text-white py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-gray-800 active:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => { confirmAddToCart(); window.location.href = '/cart' }} 
              disabled={!currentVariant || (currentVariant?.stock ?? 0) === 0} 
              className="flex-1 border-2 border-text-black text-text-black py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-gray-light active:bg-gray-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
