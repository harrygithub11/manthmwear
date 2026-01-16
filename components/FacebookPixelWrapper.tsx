'use client'

import { useEffect, useState } from 'react'
import { FacebookPixel } from './FacebookPixel'

export function FacebookPixelWrapper() {
  const [pixelId, setPixelId] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // 1) Immediate fallback from env or default ID so pixel loads without backend settings
    const envId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1395089012068157'
    if (envId) {
      setPixelId(envId)
      setEnabled(true)
    }

    // 2) If site-settings API exists, prefer its dynamic config
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
        // Silently ignore; fallback already applied
        console.warn('Facebook Pixel settings API unavailable, using fallback ID')
      }
    }

    fetchPixelSettings()
  }, [])

  if (!enabled || !pixelId) return null

  return <FacebookPixel pixelId={pixelId} />
}
