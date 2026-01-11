'use client'

import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Package, ArrowLeft, Truck } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading orders...</div>
      </div>
    )
  }

  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-black">My Orders</h1>
            <p className="text-gray-secondary">View and track your order history</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white text-center py-16 border-2 border-gray-border shadow-sm">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-secondary mb-6">Start shopping to see your orders here</p>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 bg-text-black text-white font-bold hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border-2 border-gray-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="font-black text-xl mb-1">Order #{order.orderNumber}</div>
                    <div className="text-sm text-gray-secondary">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl mb-2">₹{(order.total / 100).toFixed(2)}</div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-border pt-4">
                  <div className="font-bold mb-3">Order Items:</div>
                  {order.orderitem && order.orderitem.length > 0 ? (
                    <div className="space-y-2">
                      {order.orderitem.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-3">
                          <div>
                            <div className="font-bold">{item.productvariant?.product?.name || 'Product'}</div>
                            <div className="text-gray-secondary">
                              Size: {item.productvariant?.size} •
                              Color: {item.productvariant?.color} •
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="font-bold">₹{(item.subtotal / 100).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-secondary">No items found</div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-border mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-secondary">Subtotal:</span>
                    <span className="font-bold">₹{(order.subtotal / 100).toFixed(2)}</span>
                  </div>
                  {order.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-secondary">Shipping:</span>
                      <span className="font-bold">₹{(order.shipping / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-secondary">Tax:</span>
                      <span className="font-bold">₹{(order.tax / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black border-t border-gray-border pt-2">
                    <span>Total:</span>
                    <span>₹{(order.total / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipment Details */}
                {order.shipment && (
                  <div className="border-t border-gray-border mt-4 pt-4">
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900 mb-1">
                          Shipment Status: {order.shipment.status}
                        </div>
                        <div className="text-sm text-gray-600">
                          Courier: {order.shipment.courierName}
                        </div>
                        <div className="text-sm text-gray-600">
                          AWB Number: <span className="font-mono font-bold text-gray-800">{order.shipment.awb}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {order.paymentMethod && (
                  <div className="mt-4 text-sm text-gray-secondary">
                    Payment Method: <span className="font-bold text-text-black">{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
