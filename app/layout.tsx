import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import { SiteSettingsProvider } from '@/components/SiteSettingsProvider'
import { ToastContainer } from '@/components/toast'
import { FacebookPixelWrapper } from '@/components/FacebookPixelWrapper'

export const metadata: Metadata = {
  title: 'MANTHM - Premium Men\'s Underwear | Made in India',
  description: 'Premium men\'s underwear crafted for comfort, style, and confidence. Featuring LuxeSoft, Air Max technology, and IntelliCraft fabric. Made in India.',
  icons: {
    icon: [
      { url: '/favicon_io_manthm/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io_manthm/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io_manthm/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon_io_manthm/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'android-chrome', url: '/favicon_io_manthm/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/favicon_io_manthm/android-chrome-512x512.png', sizes: '512x512' }
    ]
  },
  manifest: '/favicon_io_manthm/site.webmanifest'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Providers>
          <SiteSettingsProvider>
            <FacebookPixelWrapper />
            <Navigation />
            <ToastContainer />
            <main className="overflow-x-hidden">{children}</main>
            <Footer />
          </SiteSettingsProvider>
        </Providers>
      </body>
    </html>
  )
}
