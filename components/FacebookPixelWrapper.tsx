'use client'

import { useEffect, useState } from 'react'
import { FacebookPixel } from './FacebookPixel'

export function FacebookPixelWrapper() {
  const [pixelId, setPixelId] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Fetch site settings to get Facebook Pixel ID
    const fetchPixelSettings = async () => {
      try {
        const response = await fetch('/api/site-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.facebookPixelEnabled && data.facebookPixelId) {
            setPixelId(data.facebookPixelId)
            setEnabled(true)
          }
        }
      } catch (error) {
        console.error('Failed to load Facebook Pixel settings:', error)
      }
    }

    fetchPixelSettings()
  }, [])

  if (!enabled || !pixelId) return null

  return <FacebookPixel pixelId={pixelId} />
}
