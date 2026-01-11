'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

interface FacebookPixelProps {
  pixelId: string
}

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views on route change
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  if (!pixelId) return null

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Helper functions for tracking events
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data)
  }
}

export const trackViewContent = (data: {
  content_name: string
  content_ids: string[]
  content_type: string
  value: number
  currency: string
}) => {
  trackEvent('ViewContent', data)
}

export const trackAddToCart = (data: {
  content_name: string
  content_ids: string[]
  content_type: string
  value: number
  currency: string
}) => {
  trackEvent('AddToCart', data)
}

export const trackInitiateCheckout = (data: {
  content_ids: string[]
  contents: Array<{ id: string; quantity: number }>
  value: number
  currency: string
  num_items: number
}) => {
  trackEvent('InitiateCheckout', data)
}

export const trackPurchase = (data: {
  content_ids: string[]
  contents: Array<{ id: string; quantity: number }>
  value: number
  currency: string
  num_items: number
}) => {
  trackEvent('Purchase', data)
}

export const trackSearch = (data: {
  search_string: string
  content_ids?: string[]
}) => {
  trackEvent('Search', data)
}

export const trackAddToWishlist = (data: {
  content_name: string
  content_ids: string[]
  value: number
  currency: string
}) => {
  trackEvent('AddToWishlist', data)
}

export const trackLead = (data?: Record<string, any>) => {
  trackEvent('Lead', data)
}

export const trackCompleteRegistration = (data?: Record<string, any>) => {
  trackEvent('CompleteRegistration', data)
}
