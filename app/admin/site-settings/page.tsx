'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Globe, Mail, DollarSign, Share2, Settings as SettingsIcon, Key, Lock } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'

export default function SiteSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [settings, setSettings] = useState({
    siteName: '',
    siteTagline: '',
    logoUrl: '',
    faviconUrl: '',
    domain: '',
    contactEmail: '',
    contactPhone: '',
    currency: 'INR',
    currencySymbol: '₹',
    shippingFee: 5000,
    freeShippingThreshold: 99900,
    taxRate: 0,
    prepaidDiscount: 0,
    emailFrom: '',
    adminNotificationEmail: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    facebookPixelId: '',
    facebookPixelEnabled: false,
    maintenanceMode: false,
    maintenanceMessage: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/site-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Site settings saved successfully!')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Failed to save site settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully! Please login again.')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          localStorage.removeItem('admin_token')
          router.push('/admin/login')
        }, 1500)
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading settings...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Site Settings</h1>
          <p className="text-gray-secondary">Manage your website configuration</p>
        </div>

        <div className="space-y-6">
          {/* Branding */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6" />
              <h2 className="text-xl font-black">Branding & Domain</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Site Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline || ''}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Domain</label>
                <input
                  type="text"
                  value={settings.domain || ''}
                  onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="example.com"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Favicon URL</label>
                  <input
                    type="text"
                    value={settings.faviconUrl || ''}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6" />
              <h2 className="text-xl font-black">Contact Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone || ''}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Email From Address</label>
                  <input
                    type="email"
                    value={settings.emailFrom || ''}
                    onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="noreply@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Admin Notification Email</label>
                  <input
                    type="email"
                    value={settings.adminNotificationEmail || ''}
                    onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Store Settings */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6" />
              <h2 className="text-xl font-black">Store Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.shippingFee / 100}
                    onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) * 100 })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold / 100}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) * 100 })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Prepaid Discount (₹)</label>
                <input
                  type="number"
                  value={settings.prepaidDiscount / 100}
                  onChange={(e) => setSettings({ ...settings, prepaidDiscount: Number(e.target.value) * 100 })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Discount applied when user selects Online Payment.</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6" />
              <h2 className="text-xl font-black">Social Media Links</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagramUrl || ''}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://www.instagram.com/manthmwear"
                />
                <p className="text-xs text-gray-500 mt-1">Enter full URL including https://</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Facebook URL</label>
                <input
                  type="text"
                  value={settings.facebookUrl || ''}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://www.facebook.com/manthmwear"
                />
                <p className="text-xs text-gray-500 mt-1">Enter full URL including https://</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Twitter URL</label>
                <input
                  type="text"
                  value={settings.twitterUrl || ''}
                  onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://twitter.com/manthmwear"
                />
                <p className="text-xs text-gray-500 mt-1">Enter full URL including https://</p>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6" />
              <h2 className="text-xl font-black">SEO Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle || ''}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Meta Description</label>
                <textarea
                  value={settings.metaDescription || ''}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Meta Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={settings.metaKeywords || ''}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Razorpay Configuration */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-6 h-6" />
              <h2 className="text-xl font-black">Razorpay Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId || ''}
                  onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none font-mono text-sm"
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={settings.razorpayKeySecret || ''}
                  onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none font-mono text-sm"
                  placeholder="Enter key secret"
                />
              </div>
              <div className="text-xs text-gray-500">
                💡 Note: Razorpay keys are stored securely and used for payment processing.
              </div>
            </div>
          </div>

          {/* Facebook Pixel */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6" />
              <h2 className="text-xl font-black">Facebook Pixel</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.facebookPixelEnabled}
                  onChange={(e) => setSettings({ ...settings, facebookPixelEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">Enable Facebook Pixel</div>
                  <div className="text-sm text-gray-secondary">Track conversions and optimize ads</div>
                </div>
              </label>

              {settings.facebookPixelEnabled && (
                <div>
                  <label className="block text-sm font-bold mb-2">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={settings.facebookPixelId || ''}
                    onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none font-mono text-sm"
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Find your Pixel ID in Facebook Events Manager → Data Sources → Pixels
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📊 Tracked Events:</strong>
                </p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li><strong>PageView</strong> - Every page visit</li>
                  <li><strong>ViewContent</strong> - Product page views</li>
                  <li><strong>AddToCart</strong> - Items added to cart</li>
                  <li><strong>InitiateCheckout</strong> - Checkout started</li>
                  <li><strong>Purchase</strong> - Order completed</li>
                  <li><strong>Search</strong> - Product searches</li>
                  <li><strong>Lead</strong> - Newsletter signups, support tickets</li>
                  <li><strong>CompleteRegistration</strong> - Account creation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6" />
              <h2 className="text-xl font-black">Maintenance Mode</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">Enable Maintenance Mode</div>
                  <div className="text-sm text-gray-secondary">Display maintenance message to visitors</div>
                </div>
              </label>

              {settings.maintenanceMode && (
                <div>
                  <label className="block text-sm font-bold mb-2">Maintenance Message</label>
                  <textarea
                    value={settings.maintenanceMessage || ''}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    rows={3}
                    placeholder="We're currently performing maintenance. Please check back soon."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Change Admin Password */}
          <div className="bg-white border border-gray-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-black">Change Admin Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Lock className="w-5 h-5" />
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Warning:</strong> Changing your password will log you out. You'll need to login again with your new password.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={loadSettings}
              className="px-6 py-3 border-2 border-gray-border hover:border-text-black font-bold transition-colors"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-text-black text-white rounded font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
