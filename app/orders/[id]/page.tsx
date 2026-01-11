'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, MapPin, CreditCard, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      
      if (response.status === 404) {
        setError('Order not found')
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError('Failed to load order details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-black mx-auto mb-4"></div>
          <p className="text-gray-secondary">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">Order Not Found</h1>
          <p className="text-gray-secondary mb-6">{error || 'This order does not exist or you do not have access to it.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-text-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-secondary hover:text-text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-2">Order Details</h1>
              <p className="text-gray-secondary">Order #{order.orderNumber}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6" />
              <h2 className="text-xl font-black">Order Summary</h2>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-border last:border-0">
                  <div className="w-20 h-20 bg-gray-light border border-gray-border flex items-center justify-center">
                    {item.variant.product.images?.[0] ? (
                      <img
                        src={item.variant.product.images[0]}
                        alt={item.variant.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.variant.product.name}</h3>
                    <p className="text-sm text-gray-secondary">
                      {item.variant.size} • {item.variant.color} • Pack of {item.variant.pack}
                    </p>
                    <p className="text-sm text-gray-secondary">SKU: {item.variant.sku}</p>
                    <p className="text-sm font-bold mt-1">
                      Qty: {item.quantity} × ₹{(item.price / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">₹{(item.subtotal / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-secondary">Subtotal</span>
                <span className="font-bold">₹{(order.subtotal / 100).toFixed(2)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-secondary">Shipping</span>
                  <span className="font-bold">₹{(order.shipping / 100).toFixed(2)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-secondary">Tax</span>
                  <span className="font-bold">₹{(order.tax / 100).toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">-₹{(order.discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2 border-t border-gray-border">
                <span className="font-black">Total</span>
                <span className="font-black">₹{(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6" />
              <h2 className="text-xl font-black">Shipping Address</h2>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.shippingAddress.name}</p>
              <p className="text-gray-secondary">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-gray-secondary">{order.shippingAddress.line2}</p>
              )}
              <p className="text-gray-secondary">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-secondary">{order.shippingAddress.country}</p>
              <p className="text-gray-secondary mt-2">
                <span className="font-bold">Phone:</span> {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment & Order Info */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Payment Info */}
            <div className="bg-white border border-gray-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6" />
                <h2 className="text-xl font-black">Payment</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-secondary">Method</span>
                  <span className="font-bold capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-secondary">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-secondary">Payment ID</span>
                    <span className="font-mono text-xs">{order.razorpayOrderId.slice(0, 20)}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white border border-gray-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6" />
                <h2 className="text-xl font-black">Timeline</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-secondary">Order Placed</span>
                  <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-secondary">Last Updated</span>
                  <span className="font-bold">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.user && (
            <div className="bg-white border border-gray-border p-6">
              <h2 className="text-xl font-black mb-4">Customer Information</h2>
              
              <div className="space-y-2 text-sm">
                {order.user.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-secondary">Name</span>
                    <span className="font-bold">{order.user.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-secondary">Email</span>
                  <span className="font-bold">{order.user.email}</span>
                </div>
                {order.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-secondary">Phone</span>
                    <span className="font-bold">{order.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded">
            <h3 className="font-black mb-2">Need Help?</h3>
            <p className="text-sm text-gray-secondary mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <Link
              href="/support"
              className="inline-block px-6 py-2 bg-text-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-bold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
