'use client'

import { useState } from 'react'
import { X, Mail, Lock, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/user-context'
import { toast } from './toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [loading, setLoading] = useState(false)
  const { login, signup } = useUser()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
        toast.success('Welcome back!')
      } else {
        await signup(formData.name, formData.email, formData.password, formData.phone)
        toast.success('Account created successfully!')
      }
      onClose()
      setFormData({ name: '', email: '', password: '', phone: '' })
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setFormData({ name: '', email: '', password: '', phone: '' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-border">
          <h2 className="text-2xl font-black">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-secondary mt-1">
            {mode === 'login' 
              ? 'Sign in to access your account' 
              : 'Join us for exclusive benefits'}
          </p>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold">Password *</label>
              {mode === 'login' && (
                <a
                  href="/forgot-password"
                  className="text-xs font-bold text-gray-secondary hover:text-text-black transition-colors"
                  onClick={onClose}
                >
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-secondary mt-1">
                Must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-text-black text-white py-4 text-sm font-bold tracking-wider uppercase transition-colors",
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
            )}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 pt-0">
          <div className="text-center">
            <span className="text-sm text-gray-secondary">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={switchMode}
              className="text-sm font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
