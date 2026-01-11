'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        setEmail('')
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      } else {
        setError(data.error || 'Failed to subscribe')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <section className="bg-near-black text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl lg:text-3xl font-black mb-3">
            Get First Access to Drops
          </h3>
          <p className="text-gray-300">
            Join our community for exclusive offers and new product launches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={submitted}
              className="flex-1 px-6 py-4 bg-white text-text-black placeholder:text-gray-secondary focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submitted}
              className="inline-flex items-center justify-center gap-2 bg-white text-text-black px-8 py-4 font-bold tracking-wide uppercase hover:bg-gray-light transition-colors disabled:opacity-50"
            >
              {submitted ? 'Subscribed!' : 'Subscribe'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-300 text-center">{error}</p>
          )}
        </form>
      </div>
    </section>
  )
}
