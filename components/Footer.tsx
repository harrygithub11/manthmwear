'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSiteSettings } from '@/lib/use-site-settings'

export default function Footer() {
  const pathname = usePathname()
  const { settings } = useSiteSettings()

  // Hide footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-near-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Trunk Core Series
                </Link>
              </li>
              <li>
                <Link href="/shop?pack=2" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Pack of 2
                </Link>
              </li>
              <li>
                <Link href="/shop?pack=3" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Pack of 3
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/support#shipping" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/support#contact" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/fit-guide" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/fabric-tech" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Fabric Technology
                </Link>
              </li>
              <li>
                <Link href="/about#story" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-gray-secondary hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold tracking-wider-xl uppercase mb-4">Social</h3>
            <ul className="space-y-3">
              {settings.instagramUrl && (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-secondary hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
              )}
              {settings.facebookUrl && (
                <li>
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-secondary hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
              )}
              {settings.twitterUrl && (
                <li>
                  <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-secondary hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-secondary">
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved. Proudly Made in India.
            </div>
            <div className="text-sm text-gray-secondary">
              {settings.siteTagline || 'Premium Men\'s Underwear'} • IntelliCraft Technology
            </div>
          </div>
          
          {/* Powered By */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs text-gray-secondary">
              <div>
                Powered by{' '}
                <a 
                  href="https://blinkrmedia.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white underline transition-colors"
                >
                  BlinkrMedia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
