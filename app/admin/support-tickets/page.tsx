'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Download, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

interface SupportTicket {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function SupportTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchTickets()
  }, [router])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/support-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/support-tickets', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Created At']
    const rows = filteredTickets.map(ticket => [
      ticket.id,
      ticket.name,
      ticket.email,
      ticket.subject,
      ticket.message.replace(/"/g, '""'),
      ticket.status,
      new Date(ticket.createdAt).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `support-tickets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading tickets...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">Support Tickets</h1>
            <p className="text-gray-secondary">Manage customer support requests</p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 bg-text-black text-white px-6 py-3 text-sm font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                filter === status
                  ? 'bg-text-black text-white'
                  : 'bg-gray-light text-gray-secondary hover:bg-gray-border'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black">{tickets.length}</div>
            <div className="text-xs font-bold uppercase text-gray-secondary">Total</div>
          </div>
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'NEW').length}</div>
            <div className="text-xs font-bold uppercase text-gray-secondary">New</div>
          </div>
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</div>
            <div className="text-xs font-bold uppercase text-gray-secondary">In Progress</div>
          </div>
          <div className="bg-white border border-gray-border p-4">
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'RESOLVED').length}</div>
            <div className="text-xs font-bold uppercase text-gray-secondary">Resolved</div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white border border-gray-border">
          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-gray-secondary">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <div className="font-bold mb-2">No tickets found</div>
              <div className="text-sm">Support tickets will appear here</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-light border-b border-gray-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-border">
                  {filteredTickets.map((ticket) => (
                    <>
                      <tr key={ticket.id} className="hover:bg-gray-light transition-colors">
                        <td className="px-4 py-3 text-sm font-bold">{ticket.name}</td>
                        <td className="px-4 py-3 text-sm">{ticket.email}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{ticket.subject}</td>
                        <td className="px-4 py-3">
                          <select
                            value={ticket.status}
                            onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                            className="text-xs font-bold px-2 py-1 border border-gray-border focus:outline-none focus:border-text-black"
                          >
                            <option value="NEW">NEW</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-secondary">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${ticket.email}?subject=Re: ${ticket.subject}`}
                              className="text-sm font-bold text-text-black hover:underline"
                            >
                              Reply
                            </a>
                            <button
                              onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                              className="p-1 hover:bg-gray-border rounded transition-colors"
                              title="View message"
                            >
                              {expandedTicket === ticket.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedTicket === ticket.id && (
                        <tr key={`${ticket.id}-message`}>
                          <td colSpan={6} className="px-4 py-4 bg-gray-light">
                            <div className="space-y-2">
                              <div className="text-xs font-bold uppercase text-gray-secondary">Message:</div>
                              <div className="text-sm whitespace-pre-wrap bg-white border border-gray-border p-4 rounded">
                                {ticket.message}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
