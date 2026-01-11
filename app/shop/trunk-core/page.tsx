'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { products } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Minus, Plus, ChevronDown } from 'lucide-react'
import { guestCart } from '@/lib/guest-cart'
import { toast } from '@/components/toast'

function ProductDetailPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packParam = searchParams.get('pack')
  
  const product = products.trunkCore
  const [selectedPack, setSelectedPack] = useState(packParam ? parseInt(packParam) : 2)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>('fabric')
  const [mainSrc, setMainSrc] = useState<string>('')
  const imgWrapRef = useRef<HTMLDivElement | null>(null)
  const [origin, setOrigin] = useState<string>('50% 50%')
  // lens zoom states
  const [lensVisible, setLensVisible] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const LENS_SIZE = 160 // px

  const productId = products.trunkCore.id

  const variantId = selectedSize
    ? `${selectedPack}|${selectedSize}|${selectedColor}`
    : ''

  const addToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size before adding to cart')
      return
    }

    const currentPrice = product.pricing.find((p) => p.pack === selectedPack)?.price || 0
    
    guestCart.addItem({
      productId,
      variantId,
      quantity,
      pack: selectedPack,
      size: selectedSize,
      color: selectedColor,
      price: currentPrice,
    })

    toast.success('Added to cart successfully!')
    setTimeout(() => router.push('/cart'), 500)
  }

  const buyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size before buying')
      return
    }

    const currentPrice = product.pricing.find((p) => p.pack === selectedPack)?.price || 0
    
    guestCart.addItem({
      productId,
      variantId,
      quantity,
      pack: selectedPack,
      size: selectedSize,
      color: selectedColor,
      price: currentPrice,
    })

    toast.success('Added to cart!')
    setTimeout(() => router.push('/checkout'), 500)
  }

  useEffect(() => {
    if (packParam) {
      setSelectedPack(parseInt(packParam))
    }
  }, [packParam])

  const currentPrice = product.pricing.find((p) => p.pack === selectedPack)?.price || 0

  // update main image when pack changes
  useEffect(() => {
    const src = selectedPack === 1
      ? '/Packs/Packof1.jpg'
      : selectedPack === 2
      ? '/Packs/Packof2.jpg'
      : '/Packs/Packof3.jpg'
    setMainSrc(src)
  }, [selectedPack])

  // preload all pack images once for smoother switching
  useEffect(() => {
    const sources = ['/Packs/Packof1.jpg', '/Packs/Packof2.jpg', '/Packs/Packof3.jpg']
    sources.forEach((s) => {
      const img = new Image()
      img.src = s
    })
  }, [])

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Gallery */}
          <div className="space-y-4">
            {/* Main Image with zoom */}
            <div
              ref={imgWrapRef}
              className="group relative aspect-square bg-gray-light border border-gray-border overflow-hidden"
              onMouseMove={(e) => {
                const el = imgWrapRef.current
                if (!el) return
                const rect = el.getBoundingClientRect()
                const relX = e.clientX - rect.left
                const relY = e.clientY - rect.top
                const x = (relX / rect.width) * 100
                const y = (relY / rect.height) * 100
                setOrigin(`${x}% ${y}%`)
                setLensPos({ x: relX - LENS_SIZE / 2, y: relY - LENS_SIZE / 2 })
              }}
              onMouseEnter={() => setLensVisible(true)}
              onMouseLeave={() => setLensVisible(false)}
            >
              {mainSrc ? (
                <img
                  src={mainSrc}
                  alt={`Main image for Pack of ${selectedPack}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  style={{ transformOrigin: origin }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" />
              )}
              {/* Lens magnifier */}
              {lensVisible && (
                <div
                  className="pointer-events-none absolute rounded-full border-2 border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-10"
                  style={{
                    width: LENS_SIZE,
                    height: LENS_SIZE,
                    left: Math.max(0, Math.min(lensPos.x, (imgWrapRef.current?.clientWidth || 0) - LENS_SIZE)),
                    top: Math.max(0, Math.min(lensPos.y, (imgWrapRef.current?.clientHeight || 0) - LENS_SIZE)),
                    backgroundImage: `url(${mainSrc})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${(imgWrapRef.current?.clientWidth || 0) * 2}px ${(imgWrapRef.current?.clientHeight || 0) * 2}px`,
                    backgroundPosition: origin,
                    filter: 'brightness(1.05) contrast(1.05)',
                  }}
                />
              )}
              <div className="absolute left-3 top-3 bg-white/90 text-text-black text-xs font-bold tracking-wider-xl uppercase px-2 py-1">
                Pack of {selectedPack}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[
                selectedPack === 1 ? '/Packs/Packof1.jpg' : selectedPack === 2 ? '/Packs/Packof2.jpg' : '/Packs/Packof3.jpg',
                selectedPack === 1 ? '/Packs/Packof1.jpg' : selectedPack === 2 ? '/Packs/Packof2.jpg' : '/Packs/Packof3.jpg',
                selectedPack === 1 ? '/Packs/Packof1.jpg' : selectedPack === 2 ? '/Packs/Packof2.jpg' : '/Packs/Packof3.jpg',
              ].map((src, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMainSrc(src)}
                  className={
                    `relative aspect-square border overflow-hidden transition-colors ` +
                    (src === mainSrc ? 'border-text-black' : 'border-gray-border hover:border-text-black')
                  }
                >
                  <img src={src} alt={`Thumbnail ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
          {/* Right: Product Info */}
          <div>
            <div className="mb-6">
              <div className="inline-block border border-text-black px-3 py-1 text-xs font-bold tracking-wider-xl uppercase mb-4">
                Made in India
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-3">{product.name}</h1>
              <p className="text-lg text-gray-secondary mb-4">{product.tagline}</p>
              
              {/* USPs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-light text-sm font-medium">2× Softer Than Cotton</span>
                <span className="px-3 py-1 bg-gray-light text-sm font-medium">Air Max</span>
                <span className="px-3 py-1 bg-gray-light text-sm font-medium">Odour-free</span>
              </div>

              {/* Price */}
              <div className="text-4xl font-black mb-8">₹{currentPrice}</div>
            </div>

            {/* Pack Selector */}
            <div className="mb-6">
              <div className="text-sm font-bold tracking-wider-xl uppercase mb-3">Select Pack</div>
              <div className="grid grid-cols-3 gap-3">
                {product.pricing.map((pack) => (
                  <button
                    key={pack.pack}
                    onClick={() => setSelectedPack(pack.pack)}
                    className={cn(
                      'p-4 border-2 transition-all text-left',
                      selectedPack === pack.pack
                        ? 'border-text-black bg-gray-light'
                        : 'border-gray-border hover:border-gray-secondary'
                    )}
                  >
                    <div className="text-sm font-bold">{pack.label}</div>
                    <div className="text-lg font-black mt-1">₹{pack.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold tracking-wider-xl uppercase">Select Size</div>
                <a href="/fit-guide" className="text-sm underline hover:text-gray-secondary">
                  Size Guide
                </a>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    className={cn(
                      'py-3 border-2 font-bold transition-all',
                      selectedSize === size.size
                        ? 'border-text-black bg-text-black text-white'
                        : 'border-gray-border hover:border-text-black'
                    )}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-8">
              <div className="text-sm font-bold tracking-wider-xl uppercase mb-3">Select Color</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'px-4 py-2 border-2 text-sm font-medium transition-all',
                      selectedColor === color.value
                        ? 'border-text-black bg-gray-light'
                        : 'border-gray-border hover:border-gray-secondary'
                    )}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <div className="text-sm font-bold tracking-wider-xl uppercase mb-3">Quantity</div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-border hover:border-text-black transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-border hover:border-text-black transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={addToCart}
              disabled={!selectedSize}
              className={cn(
                'w-full py-4 text-base font-bold tracking-wide uppercase transition-colors mb-4',
                !selectedSize
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-text-black text-white hover:bg-gray-800'
              )}
            >
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={!selectedSize}
              className={cn(
                'w-full py-4 text-base font-bold tracking-wide uppercase transition-colors border-2',
                !selectedSize
                  ? 'border-gray-border text-gray-500 cursor-not-allowed'
                  : 'border-text-black text-text-black hover:bg-gray-light'
              )}
            >
              Buy Now
            </button>

            {/* Accordions */}
            <div className="mt-12 space-y-4">
              {/* Fabric & Tech */}
              <div className="border border-gray-border">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full flex items-center justify-between p-4 text-left font-bold hover:bg-gray-light transition-colors"
                >
                  Fabric & Technology
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      openAccordion === 'fabric' && 'rotate-180'
                    )}
                  />
                </button>
                {openAccordion === 'fabric' && (
                  <div className="p-4 pt-0 space-y-3 text-sm text-gray-secondary">
                    <div>
                      <strong>Composition:</strong>
                      <ul className="mt-2 space-y-1">
                        {product.fabric.composition.map((comp) => (
                          <li key={comp.material}>
                            • {comp.percentage}% {comp.material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>IntelliCraft Technology:</strong>
                      <ul className="mt-2 space-y-1">
                        {product.fabric.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Size & Care */}
              <div className="border border-gray-border">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between p-4 text-left font-bold hover:bg-gray-light transition-colors"
                >
                  Size & Care
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      openAccordion === 'care' && 'rotate-180'
                    )}
                  />
                </button>
                {openAccordion === 'care' && (
                  <div className="p-4 pt-0 space-y-3 text-sm text-gray-secondary">
                    <p>• Machine wash cold with similar colors</p>
                    <p>• Do not bleach</p>
                    <p>• Tumble dry low</p>
                    <p>• Do not iron</p>
                    <p>• Do not dry clean</p>
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="border border-gray-border">
                <button
                  onClick={() => toggleAccordion('delivery')}
                  className="w-full flex items-center justify-between p-4 text-left font-bold hover:bg-gray-light transition-colors"
                >
                  Delivery & Payment
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      openAccordion === 'delivery' && 'rotate-180'
                    )}
                  />
                </button>
                {openAccordion === 'delivery' && (
                  <div className="p-4 pt-0 space-y-3 text-sm text-gray-secondary">
                    <p>• Free shipping on orders over ₹999</p>
                    <p>• Delivery within 5-7 business days</p>
                    <p>• No returns due to hygiene standards</p>
                    <p>• Secure payment options</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 pt-16 border-t border-gray-border">
          <h2 className="text-3xl font-black text-center mb-12">Product Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.features.map((feature) => (
              <div key={feature.name} className="bg-gray-light p-6 border border-gray-border">
                <h3 className="text-lg font-bold mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense>
      <ProductDetailPageInner />
    </Suspense>
  )
}
