import { useState, useEffect } from 'react'

export interface SiteSettings {
  siteName: string
  siteTagline?: string
  logoUrl?: string
  faviconUrl?: string
  domain?: string
  contactEmail?: string
  contactPhone?: string
  currency: string
  currencySymbol: string
  shippingFee: number
  freeShippingThreshold: number
  taxRate: number
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  metaTitle?: string
  metaDescription?: string
  maintenanceMode: boolean
  maintenanceMessage?: string
}

const defaultSettings: SiteSettings = {
  siteName: 'MANTHM',
  siteTagline: 'Premium Men\'s Underwear',
  currency: 'INR',
  currencySymbol: '₹',
  shippingFee: 5000,
  freeShippingThreshold: 99900,
  taxRate: 0,
  maintenanceMode: false,
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      // Use defaults on error
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, error, refresh: fetchSettings }
}
