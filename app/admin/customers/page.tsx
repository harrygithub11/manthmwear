'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Mail, Phone, ShoppingBag, MapPin, DollarSign } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchCustomers()
  }, [router])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading customers...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Customers</h1>
          <p className="text-gray-secondary">View and manage your customer base</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-bold tracking-wider uppercase text-gray-secondary">Total Customers</span>
            </div>
            <div className="text-3xl font-black">{customers.length}</div>
          </div>
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-6 h-6 text-green-600" />
              <span className="text-sm font-bold tracking-wider uppercase text-gray-secondary">Total Orders</span>
            </div>
            <div className="text-3xl font-black">{customers.reduce((sum, c) => sum + c.totalOrders, 0)}</div>
          </div>
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-bold tracking-wider uppercase text-gray-secondary">Total Revenue</span>
            </div>
            <div className="text-3xl font-black">₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)}</div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white border border-gray-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-light border-b border-gray-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Orders</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Total Spent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Last Order</th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-light transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{customer.name || 'Guest'}</div>
                      <div className="text-sm text-gray-secondary">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-gray-secondary" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-secondary" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{customer.totalOrders}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{customer.totalSpent.toFixed(0)}</td>
                    <td className="px-6 py-4 text-sm text-gray-secondary">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-secondary">
                      {new Date(customer.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="py-12 text-center text-gray-secondary">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <div className="font-bold mb-2">No customers yet</div>
                <div className="text-sm">Customers will appear here after placing orders</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
