'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { guestCart, GuestCartItem } from '@/lib/guest-cart'
import { trackInitiateCheckout } from '@/components/FacebookPixel'

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shippingFee, setShippingFee] = useState(50)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999)
  const [taxRate, setTaxRate] = useState(0)
  const [productMap, setProductMap] = useState<Record<string, { images: string[] }>>({})
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    loadCart()
    loadSettings()
    loadProducts()
    
    // Listen for cart updates
    const handleCartUpdate = () => loadCart()
    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  const loadCart = () => {
    setCartItems(guestCart.getItems())
  }

  const loadProducts = async () => {
    try {
      // Add cache busting to ensure fresh data
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/products?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (!res.ok) {
        console.error('[CART] Failed to fetch products:', res.status)
        setProductsLoaded(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      console.log('[CART] Loaded products:', data.map((p: any) => ({ id: p.id, name: p.name, images: p.images })))
      
      const map: Record<string, { images: string[] }> = {}
      for (const p of data || []) {
        // Store all products, even if they don't have images
        map[p.id] = { 
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [] 
        }
      }
      
      console.log('[CART] Product map:', map)
      console.log('[CART] Cart items:', guestCart.getItems().map(i => ({ productId: i.productId, variantId: i.variantId })))
      
      setProductMap(map)
      setProductsLoaded(true)
      setLoading(false)
    } catch (e) {
      console.error('[CART] Failed to load product images:', e)
      setProductsLoaded(true)
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const settings = await response.json()
        setShippingFee(settings.shippingFee || 50)
        setFreeShippingThreshold(settings.freeShippingThreshold || 999)
        setTaxRate(settings.taxRate || 0)
        console.log('[CART] Loaded settings:', { shippingFee: settings.shippingFee, threshold: settings.freeShippingThreshold, taxRate: settings.taxRate })
      }
    } catch (error) {
      console.error('[CART] Failed to load settings:', error)
    }
  }

  const updateQuantity = (productId: string, variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    guestCart.updateQuantity(productId, variantId, newQuantity)
  }

  const removeItem = (productId: string, variantId: string) => {
    guestCart.removeItem(productId, variantId)
  }

  const clearCart = () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    guestCart.clear()
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading cart...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 bg-gray-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-gray-border p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-gray-secondary" />
            <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
            <p className="text-gray-secondary mb-8">
              Add some premium trunks to get started!
            </p>
            <Link
              href="/shop"
              className="inline-block bg-text-black text-white px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee
  const tax = Math.round((subtotal + shipping) * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  const handleInitiateCheckout = () => {
    try {
      const contents = cartItems.map((item) => ({ id: item.variantId, quantity: item.quantity }))
      const contentIds = cartItems.map((item) => item.variantId)
      trackInitiateCheckout({
        content_ids: contentIds,
        contents,
        value: total,
        currency: 'INR',
        num_items: cartItems.reduce((n, i) => n + i.quantity, 0),
      })
    } catch {}
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm font-bold tracking-wider-xl uppercase text-gray-secondary hover:text-text-black underline"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const productImages = productMap[item.productId]?.images
              const firstImage = Array.isArray(productImages) && productImages.length > 0 ? productImages[0] : null
              
              return (
                <div
                  key={item.variantId}
                  className="bg-white border border-gray-border p-4 sm:p-6"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border border-gray-border flex-shrink-0 overflow-hidden">
                      {!productsLoaded ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-text-black rounded-full animate-spin" />
                        </div>
                      ) : firstImage ? (
                        <img 
                          src={firstImage}
                          alt="Product"
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="eager"
                          key={firstImage}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Trunk Core Series</h3>
                      <p className="text-xs sm:text-sm text-gray-secondary mb-3 sm:mb-4">
                        Size: {item.size} • Pack of {item.pack}
                        {item.packColors && item.packColors.length > 0 ? (
                          <span className="block mt-1 capitalize">
                            Colors: {item.packColors.join(', ')}
                          </span>
                        ) : (
                          <span> • Color: {item.color}</span>
                        )}
                      </p>

                      {/* Mobile Price (shown on mobile only) */}
                      <div className="sm:hidden mb-3">
                        <div className="text-lg font-black">₹{item.price * item.quantity}</div>
                        <div className="text-xs text-gray-secondary">₹{item.price} each</div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            disabled={item.quantity === 1}
                            className="p-1.5 sm:p-2 border border-gray-border hover:border-text-black transition-all disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="text-base sm:text-lg font-bold w-6 sm:w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="p-1.5 sm:p-2 border border-gray-border hover:border-text-black transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="p-2 text-gray-secondary hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Price (hidden on mobile) */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xl font-black">₹{item.price * item.quantity}</div>
                      <div className="text-sm text-gray-secondary">₹{item.price} each</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-text-black p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-black mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-secondary">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-secondary">Shipping</span>
                  <span className="font-bold">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-secondary">Tax ({taxRate}%)</span>
                    <span className="font-bold">₹{tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-gray-border" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-black">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 text-xs text-green-700">
                  🎉 You've qualified for free shipping!
                </div>
              )}

              <button
                onClick={handleInitiateCheckout}
                className="block w-full bg-text-black text-white py-4 text-center text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/shop"
                className="block w-full border-2 border-text-black text-text-black py-4 text-center text-sm font-bold tracking-wide uppercase hover:bg-gray-light transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
