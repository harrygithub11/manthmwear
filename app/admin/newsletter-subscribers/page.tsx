'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Download, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
}

export default function NewsletterSubscribersPage() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchSubscribers()
  }, [router])

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/newsletter-subscribers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setSubscribers(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Status']
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      new Date(sub.subscribedAt).toLocaleString(),
      sub.isActive ? 'Active' : 'Inactive'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportEmails = () => {
    const emails = filteredSubscribers
      .filter(sub => sub.isActive)
      .map(sub => sub.email)
      .join(', ')

    const blob = new Blob([emails], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-emails-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredSubscribers = subscribers.filter(sub => {
    if (filter === 'active') return sub.isActive
    if (filter === 'inactive') return !sub.isActive
    return true
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading subscribers...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">Newsletter Subscribers</h1>
            <p className="text-gray-secondary">Manage your email subscribers</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportEmails}
              className="inline-flex items-center gap-2 bg-gray-light text-text-black px-6 py-3 text-sm font-bold uppercase hover:bg-gray-border transition-colors"
            >
              <Mail className="w-4 h-4" />
              Export Emails
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 bg-text-black text-white px-6 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'inactive'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                filter === status
                  ? 'bg-text-black text-white'
                  : 'bg-gray-light text-gray-secondary hover:bg-gray-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black">{subscribers.length}</div>
            <div className="text-xs font-bold uppercase text-gray-secondary">Total Subscribers</div>
          </div>
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black text-green-600">
              {subscribers.filter(s => s.isActive).length}
            </div>
            <div className="text-xs font-bold uppercase text-gray-secondary">Active</div>
          </div>
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black text-gray-400">
              {subscribers.filter(s => !s.isActive).length}
            </div>
            <div className="text-xs font-bold uppercase text-gray-secondary">Inactive</div>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white border border-gray-border">
          {filteredSubscribers.length === 0 ? (
            <div className="py-12 text-center text-gray-secondary">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <div className="font-bold mb-2">No subscribers found</div>
              <div className="text-sm">Newsletter subscribers will appear here</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-light border-b border-gray-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Subscribed At</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-light transition-colors">
                      <td className="px-4 py-3 text-sm font-bold">{subscriber.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-secondary">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          subscriber.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
