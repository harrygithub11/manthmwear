'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Package, MapPin, CreditCard, Clock, User, ArrowLeft, Save, Trash2, Truck, FileText } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isShipping, setIsShipping] = useState(false)
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchOrder()
  }, [params.id, router])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const data = await response.json()
      setOrder(data)
      setOrderStatus(data.status)
      setPaymentStatus(data.paymentStatus)
    } catch (err) {
      toast.error('Failed to load order details')
      console.error(err)
    } finally {
      setLoading(false)
    }

  }


  const handleShipOrder = async () => {
    if (!confirm('Are you sure you want to create a shipment for this order with RapidShyp?')) return

    setIsShipping(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${params.id}/ship`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Shipment created successfully!')
        fetchOrder() // Refresh to see the new shipment
      } else {
        toast.error(data.error || 'Failed to create shipment')
        console.error(data)
      }
    } catch (error) {
      toast.error('An error occurred while creating shipment')
      console.error(error)
    } finally {
      setIsShipping(false)
    }
  }

  const handleUpdateStatus = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: orderStatus,
          paymentStatus: paymentStatus
        }),
      })

      if (response.ok) {
        toast.success('Order updated successfully')
        fetchOrder()
      } else {
        toast.error('Failed to update order')
      }
    } catch (error) {
      toast.error('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Order deleted successfully')
        router.push('/admin/orders')
      } else {
        toast.error('Failed to delete order')
      }
    } catch (error) {
      toast.error('Failed to delete order')
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
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-black mx-auto mb-4"></div>
            <p className="text-gray-secondary">Loading order details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-black mb-2">Order Not Found</h1>
            <p className="text-gray-secondary mb-6">This order does not exist.</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="px-6 py-3 bg-text-black text-white rounded hover:bg-gray-800"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center gap-2 text-gray-secondary hover:text-text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-2">Order Details</h1>
              <p className="text-gray-secondary">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={handleDeleteOrder}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded"
            >
              <Trash2 className="w-4 h-4" />
              Delete Order
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-gray-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6" />
                <h2 className="text-xl font-black">Order Items</h2>
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

            {/* Customer Info */}
            {order.user && (
              <div className="bg-white border border-gray-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6" />
                  <h2 className="text-xl font-black">Customer Information</h2>
                </div>

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
                  <div className="flex justify-between">
                    <span className="text-gray-secondary">User ID</span>
                    <span className="font-mono text-xs">{order.user.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Fulfillment / RapidShyp */}
            <div className="bg-white border border-gray-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black">Fulfillment</h2>
              </div>

              {order.shipment ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-blue-800 font-bold">Status: {order.shipment.status}</span>
                      <span className="text-xs text-blue-600 font-mono">{order.shipment.shipmentId}</span>
                    </div>

                    <div className="space-y-2 text-sm text-blue-900">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Courier:</span>
                        <span className="font-bold">{order.shipment.courierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">AWB:</span>
                        <span className="font-mono font-bold">{order.shipment.awb}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {order.shipment.labelUrl && (
                      <a
                        href={order.shipment.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-text-black text-white text-sm font-bold rounded hover:bg-gray-800 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Download Label
                      </a>
                    )}
                    {order.shipment.manifestUrl && (
                      <a
                        href={order.shipment.manifestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-text-black text-sm font-bold rounded hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Download Manifest
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-secondary">
                    Order is ready to ship? Create a shipment with RapidShyp.
                  </p>
                  <button
                    onClick={handleShipOrder}
                    disabled={isShipping}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isShipping ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Shipment...
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5" />
                        Ship via RapidShyp
                      </>
                    )}
                  </button>
                  {order.status !== 'CONFIRMED' && order.status !== 'PROCESSING' && (
                    <p className="text-xs text-red-500 mt-2">
                      Note: Order status typically needs to be Confirmed or Processing.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Status Controls */}
            <div className="bg-white border border-gray-border p-6">
              <h2 className="text-xl font-black mb-4">Update Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Order Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-text-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

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
                  <div>
                    <span className="text-gray-secondary block mb-1">Razorpay Order ID</span>
                    <span className="font-mono text-xs break-all">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <span className="text-gray-secondary block mb-1">Payment ID</span>
                    <span className="font-mono text-xs break-all">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6" />
                <h2 className="text-xl font-black">Timeline</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-secondary block">Order Placed</span>
                  <span className="font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-secondary block">Last Updated</span>
                  <span className="font-bold">{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-secondary block">Order ID</span>
                  <span className="font-mono text-xs break-all">{order.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
