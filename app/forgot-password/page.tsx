'use client'

import { useState } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
        toast.success('Password reset link sent to your email')
      } else {
        toast.error(data.error || 'Failed to send reset link')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-light px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-text-black p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-black mb-4">Check Your Email</h1>
            <p className="text-gray-secondary mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-secondary mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="w-full px-6 py-3 border-2 border-gray-border hover:border-text-black font-bold transition-colors"
              >
                Send Another Link
              </button>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-text-black text-white text-center font-bold hover:bg-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-text-black p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-text-black rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
            <p className="text-sm text-gray-secondary">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 pt-6 border-t border-gray-border text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-secondary hover:text-text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
