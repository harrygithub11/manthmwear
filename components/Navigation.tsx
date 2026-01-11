'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Search, User, ShoppingCart, Menu, X, LogOut, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { guestCart } from '@/lib/guest-cart'
import { useUser } from '@/lib/user-context'
import { AuthModal } from './AuthModal'
import { SearchModal } from './SearchModal'

export default function Navigation() {
  const { user, logout } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const startXRef = useRef<number | null>(null)
  const [dragX, setDragX] = useState(0)

  // Hide navigation on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Update cart count from guest cart
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(guestCart.getCount())
    }
    
    updateCartCount() // Initial count
    window.addEventListener('cart-updated', updateCartCount)
    return () => window.removeEventListener('cart-updated', updateCartCount)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusables = drawer.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
    focusables[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const list = Array.from(focusables)
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          ;(last as HTMLElement).focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          ;(first as HTMLElement).focus()
        }
      }
    }
    drawer.addEventListener('keydown', onKeyDown)
    return () => drawer.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        isScrolled
          ? 'bg-white border-b border-gray-border shadow-sm'
          : isOpen && isHome
          ? 'bg-near-black/95'
          : isOpen && !isHome
          ? 'bg-white border-b border-gray-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              'text-2xl lg:text-3xl font-black tracking-tight transition-opacity',
              isScrolled
                ? 'text-text-black hover:opacity-70'
                : isHome
                ? 'text-white hover:opacity-90'
                : 'text-text-black hover:opacity-70'
            )}
          >
            MANTHM
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors',
                isScrolled
                  ? 'text-text-black hover:text-gray-secondary'
                  : isHome
                  ? 'text-white/90 hover:text-white'
                  : 'text-text-black hover:text-gray-secondary'
              )}
            >
              Shop
            </Link>
            <Link
              href="/fabric-tech"
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors',
                isScrolled
                  ? 'text-text-black hover:text-gray-secondary'
                  : isHome
                  ? 'text-white/90 hover:text-white'
                  : 'text-text-black hover:text-gray-secondary'
              )}
            >
              Fabric Tech
            </Link>
            <Link
              href="/fit-guide"
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors',
                isScrolled
                  ? 'text-text-black hover:text-gray-secondary'
                  : isHome
                  ? 'text-white/90 hover:text-white'
                  : 'text-text-black hover:text-gray-secondary'
              )}
            >
              Fit Guide
            </Link>
            <Link
              href="/about"
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors',
                isScrolled
                  ? 'text-text-black hover:text-gray-secondary'
                  : isHome
                  ? 'text-white/90 hover:text-white'
                  : 'text-text-black hover:text-gray-secondary'
              )}
            >
              About
            </Link>
            <Link
              href="/support"
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors',
                isScrolled
                  ? 'text-text-black hover:text-gray-secondary'
                  : isHome
                  ? 'text-white/90 hover:text-white'
                  : 'text-text-black hover:text-gray-secondary'
              )}
            >
              Support
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Mobile Menu Toggle */}
            <button
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'md:hidden p-2 rounded-full transition-colors',
                isScrolled
                  ? 'text-text-black hover:bg-gray-light'
                  : isHome && !isOpen
                  ? 'text-white hover:bg-white/10'
                  : 'text-text-black hover:bg-gray-light'
              )}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              aria-label="Search"
              className={cn(
                'p-2 rounded-full transition-colors',
                isScrolled
                  ? 'text-text-black hover:bg-gray-light'
                  : isHome
                  ? 'text-white hover:bg-white/10'
                  : 'text-text-black hover:bg-gray-light'
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            {/* Account Button/Menu */}
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                aria-label="Account"
                className={cn(
                  'p-2 rounded-full transition-colors',
                  isScrolled
                    ? 'text-text-black hover:bg-gray-light'
                    : isHome
                    ? 'text-white hover:bg-white/10'
                    : 'text-text-black hover:bg-gray-light'
                )}
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    isScrolled
                      ? 'text-text-black hover:bg-gray-light'
                      : isHome
                      ? 'text-white hover:bg-white/10'
                      : 'text-text-black hover:bg-gray-light'
                  )}
                >
                  <User className="w-5 h-5" />
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-gray-border shadow-xl z-50">
                    <div className="p-4 border-b border-gray-border bg-gray-50">
                      <div className="font-bold text-text-black">{user.name}</div>
                      <div className="text-sm text-gray-secondary">{user.email}</div>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-light transition-colors text-text-black font-bold"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-light transition-colors text-text-black font-bold"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <Package className="w-5 h-5" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowAccountMenu(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left font-bold text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className={cn(
                'relative p-2 rounded-full transition-colors',
                isScrolled
                  ? 'text-text-black hover:bg-gray-light'
                  : isHome
                  ? 'text-white hover:bg-white/10'
                  : 'text-text-black hover:bg-gray-light'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className={cn(
                  'absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full',
                  isScrolled
                    ? 'bg-text-black text-white'
                    : isHome
                    ? 'bg-white text-text-black'
                    : 'bg-text-black text-white'
                )}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer + Backdrop */}
      {/* Backdrop */}
      <button
        aria-label="Close menu"
        onClick={() => setIsOpen(false)}
        className={cn(
          'fixed inset-0 bg-black/40 transition-opacity md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-screen w-72 md:hidden shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          isHome && !isScrolled ? 'bg-near-black text-white' : 'bg-white text-text-black'
        )}
        ref={drawerRef}
        tabIndex={-1}
        onTouchStart={(e) => {
          startXRef.current = e.touches[0].clientX
          setDragX(0)
        }}
        onTouchMove={(e) => {
          if (startXRef.current == null) return
          const delta = Math.max(0, startXRef.current - e.touches[0].clientX)
          setDragX(delta)
        }}
        onTouchEnd={() => {
          if (dragX > 80) setIsOpen(false)
          setDragX(0)
          startXRef.current = null
        }}
        style={{ transform: isOpen ? `translateX(${Math.min(dragX, 288)}px)` : undefined }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: isHome && !isScrolled ? 'rgba(255,255,255,0.12)' : 'var(--gray-border, #e5e7eb)' }}>
          <span className="text-sm font-bold tracking-wider-xl uppercase">Menu</span>
        </div>
        <div className="px-5 py-2">
          {/* Shop - Direct link without dropdown */}
          <Link
            href="/shop"
            onClick={() => setIsOpen(false)}
            className={cn(
              'block py-4 text-sm font-bold tracking-wider-xl uppercase border-b',
              isHome && !isScrolled ? 'border-white/10 hover:text-gray-200' : 'border-gray-border hover:text-gray-secondary'
            )}
          >
            Shop
          </Link>

          {/* Other links */}
          {[
            { href: '/fabric-tech', label: 'Fabric Tech' },
            { href: '/fit-guide', label: 'Fit Guide' },
            { href: '/about', label: 'About' },
            { href: '/support', label: 'Support' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'block py-4 text-sm font-bold tracking-wider-xl uppercase border-b',
                isHome && !isScrolled ? 'border-white/10 hover:text-gray-200' : 'border-gray-border hover:text-gray-secondary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)}
        isHome={isHome}
        isScrolled={isScrolled}
      />
    </nav>
  )
}
