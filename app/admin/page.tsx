'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, DollarSign, TrendingUp, Users, MessageSquare, Mail } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    fetchOrders()
    fetchSupportTickets()
    fetchSubscribers()
  }, [router])

  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/orders', {
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(`Failed to fetch orders: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      console.error('[ADMIN_DASHBOARD] Exception:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchSupportTickets = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/support-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSupportTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
    }
  }

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/newsletter-subscribers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    confirmedOrders: orders.filter(o => o.status === 'CONFIRMED').length,
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Dashboard Overview</h1>
          <p className="text-gray-secondary">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-gray-secondary" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Total Orders
              </span>
            </div>
            <div className="text-3xl font-black">{stats.totalOrders}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Revenue
              </span>
            </div>
            <div className="text-3xl font-black">₹{stats.totalRevenue.toFixed(0)}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Pending
              </span>
            </div>
            <div className="text-3xl font-black">{stats.pendingOrders}</div>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Support Tickets
              </span>
            </div>
            <div className="text-3xl font-black">{supportTickets.length}</div>
            <a href="/admin/support-tickets" className="text-xs font-bold text-text-black hover:underline mt-2 inline-block">
              View All →
            </a>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Newsletter
              </span>
            </div>
            <div className="text-3xl font-black">{subscribers.filter(s => s.isActive).length}</div>
            <a href="/admin/newsletter-subscribers" className="text-xs font-bold text-text-black hover:underline mt-2 inline-block">
              View All →
            </a>
          </div>

          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-gray-secondary">
                Confirmed
              </span>
            </div>
            <div className="text-3xl font-black">{stats.confirmedOrders}</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm font-bold text-text-black hover:underline">
              View All Orders →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-light border-b border-gray-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-light transition-colors">
                    <td className="px-4 py-3 text-sm font-bold">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.customerName}</td>
                    <td className="px-4 py-3 text-sm font-bold">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-secondary">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <div className="font-bold mb-2">No orders yet</div>
                <div className="text-sm">Orders will appear here once customers place them</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
