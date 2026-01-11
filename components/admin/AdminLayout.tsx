'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart3, Mail, MessageSquare, Tag } from 'lucide-react'
import { toast } from '@/components/toast'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    toast.success('Logged out successfully')
    setTimeout(() => router.push('/admin/login'), 500)
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
    { href: '/admin/customers', icon: Users, label: 'Customers' },
    { href: '/admin/support-tickets', icon: MessageSquare, label: 'Support Tickets' },
    { href: '/admin/newsletter-subscribers', icon: Mail, label: 'Newsletter' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-text-black text-white flex-shrink-0 fixed left-0 top-0 h-screen">
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-black">MANTHM</h1>
            <p className="text-xs text-white/60 mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white text-text-black font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Powered By Footer */}
          <div className="p-4 text-center text-xs text-white/40 border-t border-white/10">
            <div className="space-y-1">
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
              <div>
                Developed by{' '}
                <a 
                  href="https://connectharish.online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white underline transition-colors"
                >
                  Harish
                </a>
                {' '}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  )
}
