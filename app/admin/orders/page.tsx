'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Eye, Search, Filter, Download, Truck, FileText, Trash2 } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isShipping, setIsShipping] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchOrders()
  }, [router, filter])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders${filter !== 'all' ? `?status=${filter}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
        toast.success('Order status updated')

        // Update selectedOrder if it's the one being changed
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId))
        toast.success('Order deleted successfully')
        if (selectedOrder?.id === orderId) {
          setShowDetailModal(false)
          setSelectedOrder(null)
        }
      } else {
        toast.error('Failed to delete order')
      }
    } catch (error) {
      toast.error('Failed to delete order')
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })

      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
          )
        )
        toast.success('Payment status updated')

        // Update selectedOrder if it's the one being changed
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus })
        }
      } else {
        toast.error('Failed to update payment status')
      }
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  const handleShipOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to create a shipment for this order with RapidShyp?')) return

    setIsShipping(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Shipment created successfully!')

        // Refresh orders and update selected order
        await fetchOrders()

        // Slightly hacky: find the updated order in the new list would be better
        // but fetchOrders updates 'orders' state, we need to update selectedOrder too
        // For now, let's just close modal or try to update selectedOrder locally
        // Updating selectedOrder with shipment info requires matching the structure
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedShipment = data.shipment
          setSelectedOrder({ ...selectedOrder, shipment: updatedShipment, status: 'PROCESSING' })
        }

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

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export')
      return
    }

    const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Phone', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Items', 'Created At']
    const rows = filteredOrders.map(o => {
      // Build items string with pack colors
      const itemsStr = o.items.map((item: any) => {
        let packColors: string[] = []
        try {
          if (o.shippingAddress && typeof o.shippingAddress === 'string') {
            const shippingData = JSON.parse(o.shippingAddress)
            const packColorData = shippingData.packColors?.find((pc: any) => pc.variantId === item.variantId)
            packColors = packColorData?.packColors || []
          }
        } catch (e) {
          // Ignore
        }

        const colorInfo = packColors.length > 0
          ? `Colors: ${packColors.join(', ')}`
          : item.color !== 'Custom Pack'
            ? `Color: ${item.color}`
            : 'Custom Pack'

        return `${item.name} (Size: ${item.size}, Pack: ${item.pack}, ${colorInfo}, Qty: ${item.quantity})`
      }).join(' | ')

      return [
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.customerPhone,
        o.total,
        o.paymentMethod,
        o.paymentStatus,
        o.status,
        itemsStr,
        new Date(o.createdAt).toLocaleString()
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `orders_${filter}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${filteredOrders.length} orders`)
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading orders...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2">Orders Management</h1>
            <p className="text-gray-secondary">View and manage all customer orders</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-border hover:border-text-black font-bold transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-text-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-secondary" />
              <input
                type="text"
                placeholder="Search orders by number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-border focus:border-text-black outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${filter === status
                    ? 'bg-text-black text-white'
                    : 'border border-gray-border hover:border-text-black'
                    }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-light border-b border-gray-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-light transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-secondary">{order.customerEmail}</div>
                      <div className="text-xs text-gray-secondary">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{order.total}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold">{order.paymentMethod}</div>
                      <div className={`text-xs ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-bold tracking-wider uppercase border-2 border-gray-border px-3 py-2 outline-none focus:border-text-black"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="p-2 border-2 border-gray-border hover:border-text-black transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 border-2 border-red-200 text-red-600 hover:border-red-600 transition-colors"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-gray-secondary">
                <div className="font-bold mb-2">No orders found</div>
                <div className="text-sm">Try adjusting your filters or search term</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-text-black text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Order Details</h2>
                <p className="text-sm text-white/80">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="border border-gray-border p-4">
                <h3 className="font-black mb-4">Customer Information</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-secondary">Name</div>
                    <div className="font-bold">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <div className="text-gray-secondary">Email</div>
                    <div className="font-bold">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <div className="text-gray-secondary">Phone</div>
                    <div className="font-bold">{selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-gray-secondary">Order Date</div>
                    <div className="font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div className="border border-gray-border p-4">
                  <h3 className="font-black mb-4">Shipping Address</h3>
                  <div className="text-sm">
                    <div className="font-bold">{selectedOrder.address.name}</div>
                    <div>{selectedOrder.address.line1}</div>
                    {selectedOrder.address.line2 && <div>{selectedOrder.address.line2}</div>}
                    <div>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postalCode}</div>
                    <div>{selectedOrder.address.country}</div>
                    <div className="mt-2 text-gray-secondary">Phone: {selectedOrder.address.phone}</div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border border-gray-border p-4">
                <h3 className="font-black mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, index: number) => {
                    // Try to get pack colors from shipping address
                    let packColors: string[] = []
                    let shippingData: any = null

                    try {
                      if (selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress === 'string') {
                        shippingData = JSON.parse(selectedOrder.shippingAddress)

                        // Find packColors for this specific variant
                        if (shippingData.packColors && Array.isArray(shippingData.packColors)) {
                          const packColorData = shippingData.packColors.find((pc: any) => pc.variantId === item.variantId)
                          if (packColorData && Array.isArray(packColorData.packColors)) {
                            packColors = packColorData.packColors
                          }
                        }
                      }
                    } catch (e) {
                      // Silently fail - old orders won't have this data
                    }

                    // Determine what to display
                    const showPackColors = packColors.length > 0
                    const displayColor = showPackColors
                      ? `Colors: ${packColors.join(', ')}`
                      : item.color !== 'Custom Pack'
                        ? `Color: ${item.color}`
                        : 'Custom Pack (colors not recorded)'

                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-light">
                        <div className="flex-1">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-sm text-gray-secondary">
                            Size: {item.size} • Pack: {item.pack}
                            <span className={showPackColors ? "block mt-1 capitalize" : ""}>
                              {showPackColors ? '' : ' • '}{displayColor}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div>Qty: {item.quantity}</div>
                          <div className="font-bold">₹{item.price * item.quantity}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Fulfillment / RapidShyp */}
              <div className="border border-gray-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black">Fulfillment</h3>
                </div>

                {selectedOrder.shipment ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-blue-800 font-bold">Status: {selectedOrder.shipment.status}</span>
                        <span className="text-xs text-blue-600 font-mono">{selectedOrder.shipment.shipmentId}</span>
                      </div>

                      <div className="space-y-2 text-sm text-blue-900">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Courier:</span>
                          <span className="font-bold">{selectedOrder.shipment.courierName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">AWB:</span>
                          <span className="font-mono font-bold">{selectedOrder.shipment.awb}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedOrder.shipment.labelUrl && (
                        <a
                          href={selectedOrder.shipment.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-text-black text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Download Label
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-secondary">
                      Ready to ship? Create shipment with RapidShyp.
                    </p>
                    <button
                      onClick={() => handleShipOrder(selectedOrder.id)}
                      disabled={isShipping}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isShipping ? (
                        <>Loading...</>
                      ) : (
                        <>Ship via RapidShyp</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border border-gray-border p-4">
                <h3 className="font-black mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold">{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Prepaid Discount</span>
                      <span className="font-bold">-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-border pt-2 mt-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="font-black">Total</span>
                    <span className="font-black">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="border border-gray-border p-4">
                <h3 className="font-black mb-4">Payment & Status</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-secondary mb-2">Payment Method</div>
                    <div className="font-bold uppercase">{selectedOrder.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-secondary mb-2">Payment Status</div>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                      className={`w-full px-3 py-2 border-2 border-gray-border focus:border-text-black outline-none font-bold uppercase text-sm ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-gray-secondary mb-2">Order Status</div>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-border focus:border-text-black outline-none font-bold uppercase text-sm"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
