'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/toast'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setValidating(false)
      toast.error('Invalid reset link')
    }
  }, [searchParams])

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToValidate }),
      })

      if (response.ok) {
        setTokenValid(true)
      } else {
        toast.error('This reset link has expired or is invalid')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      toast.error('Failed to validate reset link')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password reset successfully!')
        setTimeout(() => router.push('/'), 1500)
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-light">
        <div className="text-lg font-bold">Validating reset link...</div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-light px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-red-500 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-black mb-4">Invalid Reset Link</h1>
            <p className="text-gray-secondary mb-6">
              This password reset link has expired or is invalid.
            </p>
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full px-6 py-3 bg-text-black text-white text-center font-bold hover:bg-gray-800 transition-colors"
              >
                Request New Link
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 border-2 border-gray-border hover:border-text-black text-center font-bold transition-colors"
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Reset Password</h1>
            <p className="text-sm text-gray-secondary">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2">
                New Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors pr-12"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-secondary hover:text-text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-secondary mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors pr-12"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-secondary hover:text-text-black transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-border text-center">
            <Link
              href="/"
              className="text-sm text-gray-secondary hover:text-text-black underline transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-light">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
