'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Mail, KeyRound, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/toast'

type LoginMode = 'password' | 'otp'

export default function AdminLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('password')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      toast.error('Please enter admin password')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const { token } = await response.json()
        localStorage.setItem('admin_token', token)
        toast.success('Login successful!')
        setTimeout(() => router.push('/admin'), 500)
      } else {
        toast.error('Invalid admin password')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent to your email!')
        setOtpSent(true)
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin_token', data.token)
        toast.success('Login successful!')
        setTimeout(() => router.push('/admin'), 500)
      } else {
        toast.error(data.error || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetOTPFlow = () => {
    setOtpSent(false)
    setOtp('')
    setEmail('')
  }

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode)
    setPassword('')
    setEmail('')
    setOtp('')
    setOtpSent(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-text-black p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-text-black rounded-full mb-4">
              {mode === 'password' ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-black mb-2">Admin Login</h1>
            <p className="text-sm text-gray-secondary">
              {mode === 'password' 
                ? 'Enter your admin password to access the dashboard'
                : otpSent 
                  ? 'Enter the OTP sent to your email'
                  : 'Enter your admin email to receive OTP'}
            </p>
          </div>

          {/* Login Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className={`flex-1 py-3 text-sm font-bold border-2 transition-colors ${
                mode === 'password'
                  ? 'bg-text-black text-white border-text-black'
                  : 'bg-white text-gray-secondary border-gray-border hover:border-text-black'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </button>
            <button
              type="button"
              onClick={() => switchMode('otp')}
              className={`flex-1 py-3 text-sm font-bold border-2 transition-colors ${
                mode === 'otp'
                  ? 'bg-text-black text-white border-text-black'
                  : 'bg-white text-gray-secondary border-gray-border hover:border-text-black'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email OTP
            </button>
          </div>

          {/* Password Login Form */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-bold mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors pr-12"
                    placeholder="Enter password"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {mode === 'otp' && !otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2">
                  Admin Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors"
                  placeholder="Enter your admin email"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {mode === 'otp' && otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="otp" className="block text-sm font-bold">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    onClick={resetOTPFlow}
                    className="text-xs text-gray-secondary hover:text-text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change Email
                  </button>
                </div>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none transition-colors text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                  disabled={loading}
                  maxLength={6}
                />
                <p className="text-xs text-gray-secondary mt-2">
                  OTP sent to: <span className="font-bold">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-sm text-gray-secondary hover:text-text-black underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-border text-center">
            <p className="text-xs text-gray-secondary">
              For security reasons, only authorized personnel can access this area.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-secondary hover:text-text-black underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
