'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'
import { Settings, CreditCard, DollarSign, Truck, Package, Lock, Share2, AlertTriangle, Store, Mail, Search } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'shipping' | 'social' | 'seo' | 'email' | 'security' | 'maintenance'>('general')
  const [settings, setSettings] = useState({
    // General/Branding
    siteName: 'MANTHM',
    siteTagline: 'Premium Men\'s Underwear',
    logoUrl: '',
    faviconUrl: '',
    domain: 'manthmwear.com',
    contactEmail: 'contact@manthmwear.com',
    contactPhone: '',
    // Payment Settings
    codEnabled: true,
    onlinePaymentEnabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    // Shipping & Store Settings
    shippingFee: 50,
    freeShippingThreshold: 999,
    taxRate: 0,
    prepaidDiscount: 0,
    currency: 'INR',
    currencySymbol: '₹',
    // Social Media
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    // SEO
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    // Email
    emailFrom: '',
    adminNotificationEmail: '',
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      console.log('[SETTINGS] Fetching with token:', token ? 'exists' : 'missing')

      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('[SETTINGS] Response status:', response.status)

      if (response.status === 401) {
        console.log('[SETTINGS] Unauthorized, redirecting to login')
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('[SETTINGS] Data loaded:', data)
        setSettings({
          siteName: data.siteName || 'MANTHM',
          siteTagline: data.siteTagline || 'Premium Men\'s Underwear',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          domain: data.domain || 'manthmwear.com',
          contactEmail: data.contactEmail || 'contact@manthmwear.com',
          contactPhone: data.contactPhone || '',
          codEnabled: data.codEnabled ?? true,
          onlinePaymentEnabled: data.onlinePaymentEnabled ?? true,
          razorpayKeyId: data.razorpayKeyId || '',
          razorpayKeySecret: data.razorpayKeySecret || '',
          shippingFee: data.shippingFee || 50,
          freeShippingThreshold: data.freeShippingThreshold || 999,
          taxRate: data.taxRate || 0,
          prepaidDiscount: data.prepaidDiscount || 0,
          currency: data.currency || 'INR',
          currencySymbol: data.currencySymbol || '₹',
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          twitterUrl: data.twitterUrl || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          metaKeywords: data.metaKeywords || '',
          emailFrom: data.emailFrom || '',
          adminNotificationEmail: data.adminNotificationEmail || '',
          maintenanceMode: data.maintenanceMode || false,
          maintenanceMessage: data.maintenanceMessage || '',
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[SETTINGS] Error response:', errorData)
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('[SETTINGS] Exception:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!settings.codEnabled && !settings.onlinePaymentEnabled) {
      toast.error('At least one payment method must be enabled')
      return
    }

    if (settings.onlinePaymentEnabled && (!settings.razorpayKeyId || !settings.razorpayKeySecret)) {
      toast.error('Razorpay credentials are required for online payments')
      return
    }

    if (settings.shippingFee < 0) {
      toast.error('Shipping fee cannot be negative')
      return
    }

    if (settings.freeShippingThreshold < 0) {
      toast.error('Free shipping threshold cannot be negative')
      return
    }

    if (settings.taxRate < 0 || settings.taxRate > 100) {
      toast.error('Tax rate must be between 0 and 100')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
        fetchSettings() // Reload to confirm
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="p-6 sm:p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" />
            <h1 className="text-3xl font-black">Settings</h1>
          </div>
          <p className="text-gray-secondary">Manage store configuration, payment methods, and shipping settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-border overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Store },
            { id: 'payment', label: 'Payment', icon: CreditCard },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'social', label: 'Social', icon: Share2 },
            { id: 'seo', label: 'SEO', icon: Search },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id
                    ? 'text-text-black'
                    : 'text-gray-secondary hover:text-text-black'
                  }`}
              >
                <Icon className="w-4 h-4 inline mr-1" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-black" />
                )}
              </button>
            )
          })}
        </div>

        {/* General/Branding Tab */}
        {activeTab === 'general' && (
          <>
            {/* Branding */}
            <div className="bg-white border border-gray-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Store className="w-6 h-6" />
                <h2 className="text-xl font-black">Branding & Identity</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Site Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="MANTHM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Site Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.siteTagline}
                      onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="Premium Men's Underwear"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Full URL to your logo image
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Favicon URL
                    </label>
                    <input
                      type="url"
                      value={settings.faviconUrl}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="https://example.com/favicon.ico"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Full URL to your favicon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6" />
                <h2 className="text-xl font-black">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={settings.domain}
                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="manthmwear.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Contact Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="contact@manthmwear.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <>
            {/* Payment Methods */}
            <div className="bg-white border border-gray-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6" />
                <h2 className="text-xl font-black">Payment Methods</h2>
              </div>

              <div className="space-y-6">
                {/* COD Toggle */}
                <div className="flex items-start justify-between p-4 border border-gray-border rounded">
                  <div className="flex-1">
                    <div className="font-bold mb-1">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-secondary">
                      Allow customers to pay with cash when they receive their order
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {/* Online Payment Toggle */}
                <div className="flex items-start justify-between p-4 border border-gray-border rounded">
                  <div className="flex-1">
                    <div className="font-bold mb-1">Online Payment</div>
                    <div className="text-sm text-gray-secondary">
                      Accept payments via UPI, Cards, Net Banking through Razorpay
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.onlinePaymentEnabled}
                      onChange={(e) => setSettings({ ...settings, onlinePaymentEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* Prepaid Discount Settings */}
              {settings.onlinePaymentEnabled && (
                <div className="bg-white border border-gray-border p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-6 h-6" />
                    <h2 className="text-xl font-black">Discount Configuration</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Prepaid Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.prepaidDiscount}
                      onChange={(e) => setSettings({ ...settings, prepaidDiscount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Discount amount applied when customer chooses Online Payment
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Razorpay Configuration */}
            {settings.onlinePaymentEnabled && (
              <div className="bg-white border border-gray-border p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6" />
                  <h2 className="text-xl font-black">Razorpay Configuration</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Razorpay Key ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="rzp_test_xxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Your Razorpay Key ID from the dashboard
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Razorpay Key Secret <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      value={settings.razorpayKeySecret}
                      onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Your Razorpay Key Secret (keep this confidential)
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> Get your Razorpay credentials from{' '}
                      <a
                        href="https://dashboard.razorpay.com/app/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold"
                      >
                        Razorpay Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            {!settings.codEnabled && !settings.onlinePaymentEnabled && (
              <div className="p-4 bg-red-50 border border-red-200 rounded mb-6">
                <div className="text-sm text-red-800 font-bold">
                  ⚠️ Warning: At least one payment method must be enabled
                </div>
              </div>
            )}
          </>
        )}

        {/* Shipping & Store Settings Tab */}
        {activeTab === 'shipping' && (
          <>
            {/* Shipping Settings */}
            <div className="bg-white border border-gray-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6" />
                <h2 className="text-xl font-black">Shipping Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.shippingFee}
                      onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="50"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Standard shipping charge per order
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="999"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Orders above this amount get free shipping
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-blue-800">
                    <strong>Example:</strong> With shipping fee ₹{settings.shippingFee} and threshold ₹{settings.freeShippingThreshold},
                    orders below ₹{settings.freeShippingThreshold} will be charged ₹{settings.shippingFee} for shipping.
                  </div>
                </div>
              </div>
            </div>

            {/* Store Settings */}
            <div className="bg-white border border-gray-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6" />
                <h2 className="text-xl font-black">Store Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="INR"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      ISO currency code (e.g., INR, USD, EUR)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={settings.currencySymbol}
                      onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                      placeholder="₹"
                    />
                    <p className="text-xs text-gray-secondary mt-1">
                      Symbol displayed with prices
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-secondary mt-1">
                    Tax percentage applied to orders (0 for no tax)
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-border rounded">
                  <div className="text-sm">
                    <strong>Preview:</strong> Prices will be displayed as {settings.currencySymbol}100
                    {settings.taxRate > 0 && ` (+ ${settings.taxRate}% tax)`}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="bg-white border border-gray-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6" />
              <h2 className="text-xl font-black">Social Media Links</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://instagram.com/yourbrand"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://facebook.com/yourbrand"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={settings.twitterUrl}
                  onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="https://twitter.com/yourbrand"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> These links will appear in your website footer and other social media sections.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="bg-white border border-gray-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6" />
              <h2 className="text-xl font-black">SEO Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="MANTHM - Premium Men's Underwear"
                  maxLength={60}
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Recommended: 50-60 characters ({settings.metaTitle.length}/60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Meta Description
                </label>
                <textarea
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="Shop premium quality men's underwear at MANTHM. Comfortable, stylish, and durable."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Recommended: 150-160 characters ({settings.metaDescription.length}/160)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={settings.metaKeywords}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="men's underwear, premium underwear, comfortable underwear"
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Comma-separated keywords for search engines
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="text-sm text-blue-800">
                  <strong>SEO Tips:</strong> Use relevant keywords, keep titles under 60 characters,
                  and descriptions under 160 characters for best search engine results.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="bg-white border border-gray-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6" />
              <h2 className="text-xl font-black">Email Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Email From Address
                </label>
                <input
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="noreply@manthmwear.com"
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Email address used for sending automated emails
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  value={settings.adminNotificationEmail}
                  onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="admin@manthmwear.com"
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Email address to receive order and system notifications
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Make sure these email addresses are properly configured
                  in your email service provider to ensure delivery.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white border border-gray-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-black">Change Admin Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  New Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-secondary mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={saving || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-text-black text-white font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm text-yellow-800">
                  <strong>⚠️ Warning:</strong> After changing your password, you will need to log in again with the new password.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Mode Tab */}
        {activeTab === 'maintenance' && (
          <div className="bg-white border border-gray-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-black">Maintenance Mode</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border-2 border-gray-border rounded">
                <div className="flex-1">
                  <div className="font-bold mb-1">Enable Maintenance Mode</div>
                  <div className="text-sm text-gray-secondary">
                    When enabled, visitors will see a maintenance page instead of your store
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  placeholder="We're currently performing maintenance. Please check back soon!"
                  rows={4}
                />
                <p className="text-xs text-gray-secondary mt-1">
                  This message will be displayed to visitors during maintenance
                </p>
              </div>

              {settings.maintenanceMode && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm text-red-800 font-bold">
                    ⚠️ Warning: Your store is currently in maintenance mode. Visitors cannot access the site.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || (activeTab === 'payment' && !settings.codEnabled && !settings.onlinePaymentEnabled)}
            className="px-8 py-3 bg-text-black text-white font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-8 py-3 border-2 border-gray-border font-bold tracking-wide uppercase hover:bg-gray-light transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
