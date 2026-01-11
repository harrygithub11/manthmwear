'use client'

import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Package, MapPin, Settings, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">My Account</h1>
          <p className="text-gray-secondary">Manage your account and orders</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-text-black text-white p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1">Welcome back, {user.name}!</h2>
              <p className="text-white/80">{user.email}</p>
              {user.phone && <p className="text-white/60 text-sm mt-1">{user.phone}</p>}
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/account/orders"
            className="bg-white border-2 border-gray-border hover:border-text-black p-6 transition-all group shadow-sm hover:shadow-md"
          >
            <Package className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-sm text-gray-secondary">View and track your orders</p>
          </Link>

          <Link
            href="/shop"
            className="bg-white border-2 border-gray-border hover:border-text-black p-6 transition-all group shadow-sm hover:shadow-md"
          >
            <ShoppingBag className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Shop</h3>
            <p className="text-sm text-gray-secondary">Continue shopping</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
