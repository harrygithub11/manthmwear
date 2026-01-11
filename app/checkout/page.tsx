'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { guestCart } from '@/lib/guest-cart'
import { toast } from '@/components/toast'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CheckoutForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [shippingFee, setShippingFee] = useState(50)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999)
  const [taxRate, setTaxRate] = useState(0)
  const [prepaidDiscount, setPrepaidDiscount] = useState(0)
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [productMap, setProductMap] = useState<Record<string, { images: string[] }>>({})
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [codEnabled, setCodEnabled] = useState(true)
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true)
  const [formData, setFormData] = useState<CheckoutForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    const items = guestCart.getItems()
    loadProducts()
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    setCartItems(items)

    // Fetch shipping settings and Razorpay key
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(settings => {
        console.log('[CHECKOUT] Loaded settings:', settings)
        setShippingFee(settings.shippingFee || 50)
        setFreeShippingThreshold(settings.freeShippingThreshold || 999)
        setTaxRate(settings.taxRate || 0)
        setPrepaidDiscount(settings.prepaidDiscount || 0)
        setRazorpayKeyId(settings.razorpayKeyId || '')
        setCodEnabled(settings.codEnabled ?? true)
        setOnlinePaymentEnabled(settings.onlinePaymentEnabled ?? true)

        // Auto-select available payment method
        if (!settings.codEnabled && settings.onlinePaymentEnabled) {
          setPaymentMethod('online')
        } else if (settings.codEnabled && !settings.onlinePaymentEnabled) {
          setPaymentMethod('cod')
        }

        console.log('[CHECKOUT] Payment methods - COD:', settings.codEnabled, 'Online:', settings.onlinePaymentEnabled)
      })
      .catch((error) => {
        console.error('[CHECKOUT] Failed to load settings:', error)
        console.log('Using default shipping settings')
      })

    setLoading(false)
  }, [router])

  const loadProducts = async () => {
    try {
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/products?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (!res.ok) return
      const data = await res.json()
      const map: Record<string, { images: string[] }> = {}
      for (const p of data || []) {
        map[p.id] = {
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : []
        }
      }
      setProductMap(map)
      setProductsLoaded(true)
    } catch (e) {
      console.error('[CHECKOUT] Failed to load product images:', e)
      setProductsLoaded(true)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits)'
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    // Check if Razorpay script is loaded for online payment
    if (paymentMethod === 'online' && !razorpayLoaded) {
      toast.error('Payment system is loading. Please wait...')
      return
    }

    if (paymentMethod === 'online' && !window.Razorpay) {
      toast.error('Payment system not available. Please refresh the page or try COD.')
      return
    }

    setProcessing(true)

    try {
      // Create guest order
      const orderPayload = {
        guestCheckout: true,
        customerInfo: formData,
        items: cartItems,
        paymentMethod: paymentMethod.toUpperCase(),
        couponCode: appliedCoupon?.code || null,
      }

      console.log('[CHECKOUT] Sending order payload:', JSON.stringify(orderPayload, null, 2))

      const orderRes = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        console.error('[CHECKOUT] Order failed:', err)
        throw new Error(err?.message || err?.error || 'Failed to create order')
      }

      const result = await orderRes.json()

      // If COD, redirect to success page
      if (paymentMethod === 'cod') {
        guestCart.clear()
        toast.success('Order placed successfully!')
        setTimeout(() => router.push(`/orders/success?orderId=${result.orderId}`), 500)
        return
      }

      // Online payment: Initialize Razorpay
      const { razorpayOrderId, amount, orderId } = result
      const keyToUse = razorpayKeyId || result.razorpayKeyId

      if (!keyToUse) {
        toast.error('⚠️ Online payment is not configured. Please use Cash on Delivery or contact support.')
        throw new Error('Razorpay key not configured')
      }

      console.log('[CHECKOUT] Initializing Razorpay with key:', keyToUse.substring(0, 12) + '...')

      const options = {
        key: keyToUse,
        amount: amount,
        currency: 'INR',
        name: 'MANTHM',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            }),
          })

          if (verifyRes.ok) {
            guestCart.clear()
            toast.success('Payment successful!')
            setTimeout(() => router.push(`/orders/success?orderId=${orderId}`), 500)
          } else {
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled')
            setProcessing(false)
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('[CHECKOUT] Payment failed:', error)

      // Extract and format error message
      let errorMessage = 'Unknown error occurred'
      let userMessage = ''

      if (error?.message) {
        errorMessage = error.message

        // User-friendly messages
        if (errorMessage.includes('Razorpay key not configured')) {
          userMessage = '⚠️ Online payment unavailable. Please use Cash on Delivery.'
        } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
          userMessage = '🌐 Network error. Check your connection and try again.'
        } else if (errorMessage.includes('timeout')) {
          userMessage = '⏱️ Request timeout. Please try again.'
        } else if (errorMessage.includes('Payment gateway not configured')) {
          userMessage = '⚠️ Payment system not configured. Please contact support or use COD.'
        } else {
          userMessage = errorMessage
        }
      } else if (typeof error === 'string') {
        errorMessage = error
        userMessage = error
      } else if (error?.error) {
        errorMessage = error.error
        userMessage = error.error
      }

      toast.error(userMessage || `Payment failed: ${errorMessage}`)

      // Show alert for critical errors
      if (userMessage.includes('not configured') || userMessage.includes('unavailable')) {
        setTimeout(() => {
          if (confirm('Online payment is currently unavailable. Would you like to use Cash on Delivery instead?')) {
            setPaymentMethod('cod')
          }
        }, 1000)
      }
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading checkout...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee
  // API returns prepaidDiscount in Rupees, so no need to divide by 100 again
  const prepaidDiscountAmount = paymentMethod === 'online' ? prepaidDiscount : 0
  const totalDiscount = prepaidDiscountAmount + couponDiscount
  const tax = Math.round((subtotal + shipping - totalDiscount) * (taxRate / 100) * 100) / 100
  const total = Math.max(0, Math.round((subtotal + shipping + tax - totalDiscount) * 100) / 100)

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      // Get user ID from session or use guest ID
      const userId = 'guest-' + Date.now() // For guest checkout
      
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          userId: userId,
          subtotal: Math.round(subtotal * 100) // Convert to paise
        })
      })

      const data = await res.json()

      if (data.valid) {
        setAppliedCoupon(data.coupon)
        setCouponDiscount(data.discount / 100) // Convert from paise to rupees
        toast.success(data.message || 'Coupon applied successfully!')
        setCouponError('')
      } else {
        setCouponError(data.error || 'Invalid coupon code')
        toast.error(data.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Coupon validation error:', error)
      setCouponError('Failed to validate coupon')
      toast.error('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponError('')
    toast.success('Coupon removed')
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          console.log('[RAZORPAY] Script loaded successfully')
          setRazorpayLoaded(true)
        }}
        onError={(e) => {
          console.error('[RAZORPAY] Script failed to load:', e)
          toast.error('Payment system unavailable. Please use Cash on Delivery.')
        }}
      />

      <div className="min-h-screen pt-20 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-black mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white border border-gray-border p-6">
                <h2 className="text-xl font-black mb-4">Customer Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border-2 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                        } outline-none`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border-2 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                          } outline-none`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Phone <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border-2 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                          } outline-none`}
                        placeholder="9876543210"
                      />
                      {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white border border-gray-border p-6">
                <h2 className="text-xl font-black mb-4">Delivery Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border-2 transition-colors ${errors.address ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                        } outline-none`}
                      placeholder="Street address, apartment, etc."
                    />
                    {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        City <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border-2 transition-colors ${errors.city ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                          } outline-none`}
                        placeholder="Mumbai"
                      />
                      {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        State <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`w-full px-4 py-3 border-2 transition-colors ${errors.state ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                          } outline-none`}
                        placeholder="Maharashtra"
                      />
                      {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Postal Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={`w-full px-4 py-3 border-2 transition-colors ${errors.postalCode ? 'border-red-500' : 'border-gray-border focus:border-text-black'
                          } outline-none`}
                        placeholder="400001"
                      />
                      {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-border p-6">
                <h2 className="text-xl font-black mb-4">Order Items</h2>

                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const productImages = productMap[item.productId]?.images
                    const firstImage = Array.isArray(productImages) && productImages.length > 0 ? productImages[0] : null

                    return (
                      <div key={item.variantId} className="flex gap-4">
                        <div className="relative w-16 h-16 bg-gray-50 border border-gray-border flex-shrink-0 overflow-hidden">
                          {!productsLoaded ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-text-black rounded-full animate-spin" />
                            </div>
                          ) : firstImage ? (
                            <img
                              src={firstImage}
                              alt="Product"
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="eager"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold">Trunk Core Series</div>
                          <div className="text-sm text-gray-secondary">
                            Size: {item.size} • Pack of {item.pack}
                            {item.packColors && item.packColors.length > 0 ? (
                              <span className="block mt-1 capitalize">
                                Colors: {item.packColors.join(', ')}
                              </span>
                            ) : (
                              <span> • Color: {item.color}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-secondary">
                            Qty: {item.quantity} × ₹{item.price}
                          </div>
                        </div>
                        <div className="font-bold">₹{item.price * item.quantity}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-text-black p-6 sticky top-24">
                <h2 className="text-xl font-black mb-6">Order Summary</h2>

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
                  {prepaidDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Prepaid Discount</span>
                      <span className="font-bold">-₹{prepaidDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-secondary">Tax ({taxRate}%)</span>
                      <span className="font-bold">₹{tax.toFixed(2)}</span>
                    </div>
                  )}
                  {shipping === 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 text-xs text-green-700">
                      🎉 Free shipping applied!
                    </div>
                  )}
                  {prepaidDiscountAmount > 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 text-xs text-green-700">
                      🎉 Prepaid discount applied!
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 text-xs text-green-700">
                      🎉 Coupon discount applied!
                    </div>
                  )}
                  <div className="h-px bg-gray-border" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-black">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6 pb-6 border-b border-gray-border">
                  <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-3">Have a Coupon?</h3>
                  
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase())
                            setCouponError('')
                          }}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border-2 border-gray-border focus:border-text-black outline-none text-sm font-mono uppercase"
                          disabled={couponLoading}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-text-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-sm text-green-800">
                            {appliedCoupon.code}
                          </div>
                          {appliedCoupon.description && (
                            <div className="text-xs text-green-700 mt-1">
                              {appliedCoupon.description}
                            </div>
                          )}
                          <div className="text-xs text-green-700 mt-1">
                            You saved ₹{couponDiscount.toFixed(2)}!
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6 pb-6 border-b border-gray-border">
                  <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-3">Payment Method</h3>

                  {!codEnabled && !onlinePaymentEnabled ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      ⚠️ No payment methods are currently available. Please contact support.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {onlinePaymentEnabled && (
                        <label className={`flex items-center gap-3 cursor-pointer p-3 border-2 rounded transition-colors ${paymentMethod === 'online' ? 'border-black bg-gray-50' : 'hover:bg-gray-light'
                          }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'online'}
                            onChange={() => setPaymentMethod('online')}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-sm flex items-center gap-2">
                              Online Payment
                              {!razorpayLoaded && paymentMethod === 'online' && (
                                <span className="text-xs text-orange-600 animate-pulse">⏳ Loading...</span>
                              )}
                              {razorpayLoaded && paymentMethod === 'online' && (
                                <span className="text-xs text-green-600">✓ Ready</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-secondary">UPI, Card, Net Banking</div>
                          </div>
                        </label>
                      )}

                      {codEnabled && (
                        <label className={`flex items-center gap-3 cursor-pointer p-3 border-2 rounded transition-colors ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'hover:bg-gray-light'
                          }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-sm">Cash on Delivery</div>
                            <div className="text-xs text-gray-secondary">Pay when you receive</div>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing || (paymentMethod === 'online' && !razorpayLoaded)}
                  className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : paymentMethod === 'online' && !razorpayLoaded ? (
                    'Loading Payment System...'
                  ) : paymentMethod === 'cod' ? (
                    'Place Order (COD)'
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>

                <div className="text-xs text-center text-gray-secondary">
                  {paymentMethod === 'online' ? '🔒 Secure payment powered by Razorpay' : '💵 Pay cash on delivery'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
