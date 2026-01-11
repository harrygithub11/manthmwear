'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SiteSettings } from '@/lib/use-site-settings'

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

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    // Fetch settings on mount
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => {
        console.error('Failed to load site settings:', err)
        // Keep defaults on error
      })
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext)
}
