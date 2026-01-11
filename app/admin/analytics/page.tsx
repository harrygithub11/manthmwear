'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, DollarSign, ShoppingBag, Package, Users, Calendar } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AnalyticsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading analytics...</div>
        </div>
      </AdminLayout>
    )
  }

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const statusCounts = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  const paymentMethods = {
    cod: orders.filter(o => o.paymentMethod?.toLowerCase() === 'cod').length,
    online: orders.filter(o => o.paymentMethod?.toLowerCase() === 'online').length,
  }

  // Recent orders by date
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const ordersByDate = last7Days.map(date => ({
    date,
    count: orders.filter(o => o.createdAt.split('T')[0] === date).length
  }))

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Analytics & Reports</h1>
          <p className="text-gray-secondary">Insights into your business performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">Total Revenue</span>
            </div>
            <div className="text-3xl font-black">₹{totalRevenue.toFixed(0)}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">Total Orders</span>
            </div>
            <div className="text-3xl font-black">{totalOrders}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">Avg Order Value</span>
            </div>
            <div className="text-3xl font-black">₹{avgOrderValue.toFixed(0)}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-orange-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">Delivered</span>
            </div>
            <div className="text-3xl font-black">{statusCounts.delivered}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Breakdown */}
          <div className="bg-white border border-gray-border p-6">
            <h2 className="text-xl font-black mb-6">Order Status</h2>
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold uppercase">{status}</span>
                    <span className="text-sm font-black">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-text-black" 
                      style={{width: `${totalOrders > 0 ? (count / totalOrders) * 100 : 0}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white border border-gray-border p-6">
            <h2 className="text-xl font-black mb-6">Payment Methods</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">Cash on Delivery</span>
                  <span className="text-sm font-black">{paymentMethods.cod}</span>
                </div>
                <div className="h-3 bg-gray-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600" 
                    style={{width: `${totalOrders > 0 ? (paymentMethods.cod / totalOrders) * 100 : 0}%`}}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">Online Payment</span>
                  <span className="text-sm font-black">{paymentMethods.online}</span>
                </div>
                <div className="h-3 bg-gray-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600" 
                    style={{width: `${totalOrders > 0 ? (paymentMethods.online / totalOrders) * 100 : 0}%`}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Over Last 7 Days */}
        <div className="bg-white border border-gray-border p-6">
          <h2 className="text-xl font-black mb-6">Orders (Last 7 Days)</h2>
          <div className="flex items-end justify-between h-64 gap-4">
            {ordersByDate.map((day, index) => {
              const maxCount = Math.max(...ordersByDate.map(d => d.count), 1)
              const height = (day.count / maxCount) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div 
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                      style={{height: `${height}%`}}
                      title={`${day.count} orders`}
                    />
                  </div>
                  <div className="text-xs font-bold text-gray-secondary">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-black">{day.count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
