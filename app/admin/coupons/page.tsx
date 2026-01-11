'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Edit2, Trash2, Copy, Check, X } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minOrderValue: number
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  oneTimePerUser: boolean
  expiryDate: string | null
  isActive: boolean
  createdAt: string
  _count?: {
    couponusage: number
  }
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
    maxDiscount: '',
    usageLimit: '',
    oneTimePerUser: false,
    expiryDate: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons'
      
      const method = editingCoupon ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseInt(formData.discountValue),
          minOrderValue: parseInt(formData.minOrderValue) * 100, // Convert to paise
          maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) * 100 : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
        })
      })

      if (res.ok) {
        alert(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!')
        setShowModal(false)
        resetForm()
        fetchCoupons()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save coupon')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert('Failed to save coupon')
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: (coupon.minOrderValue / 100).toString(),
      maxDiscount: coupon.maxDiscount ? (coupon.maxDiscount / 100).toString() : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      oneTimePerUser: coupon.oneTimePerUser,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      isActive: coupon.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        alert('Coupon deleted successfully!')
        fetchCoupons()
      } else {
        alert('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !coupon.isActive })
      })

      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error toggling coupon:', error)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '0',
      maxDiscount: '',
      usageLimit: '',
      oneTimePerUser: false,
      expiryDate: '',
      isActive: true
    })
    setEditingCoupon(null)
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No coupons found. Create your first coupon!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className={!coupon.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{coupon.code}</span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === 'PERCENTAGE' ? (
                        <span>{coupon.discountValue}% off</span>
                      ) : (
                        <span>₹{coupon.discountValue / 100} off</span>
                      )}
                      {coupon.maxDiscount && (
                        <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount / 100}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      ₹{coupon.minOrderValue / 100}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {coupon.usageCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                      {coupon.oneTimePerUser && (
                        <div className="text-xs text-blue-600">One-time per user</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.expiryDate ? (
                        <span className={new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : ''}>
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full border rounded px-3 py-2 font-mono"
                        placeholder="WELCOME10"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows={2}
                      placeholder="Welcome discount for new customers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '100'}
                        min="0"
                        max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.discountType === 'PERCENTAGE' ? 'Enter percentage (0-100)' : 'Enter amount in rupees'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Min Order Value (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.minOrderValue}
                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Max Discount (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Leave empty for no limit"
                        min="0"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        For percentage discounts only
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Leave empty for unlimited"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Leave empty for no expiry
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.oneTimePerUser}
                        onChange={(e) => setFormData({ ...formData, oneTimePerUser: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">One-time use per user</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                    >
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-6 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
