'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: 'Sizing',
    questions: [
      {
        q: 'How do I find my size?',
        a: 'Measure your waist where you normally wear your pants and refer to our size chart. If between sizes, size up for relaxed fit or down for snug fit.'
      },
      {
        q: 'Do the trunks shrink after washing?',
        a: 'Our IntelliCraft fabric is pre-shrunk. When washed according to care instructions, shrinkage is minimal (less than 2%).'
      }
    ]
  },
  {
    category: 'Shipping',
    questions: [
      {
        q: 'What is your shipping policy?',
        a: 'Free shipping on orders over ₹999. Standard delivery takes 5-7 business days. Express shipping available at checkout.'
      },
      {
        q: 'Do you accept returns?',
        a: 'Due to hygiene standards, we do not accept returns or exchanges on underwear products. Please choose carefully before purchasing.'
      }
    ]
  },
  {
    category: 'Product Care',
    questions: [
      {
        q: 'How should I wash my MANTHM trunks?',
        a: 'Machine wash cold with similar colors. Do not bleach. Tumble dry low. Do not iron or dry clean.'
      },
      {
        q: 'How long do the trunks last?',
        a: 'With proper care, MANTHM trunks are designed to last 100+ washes while maintaining their shape, softness, and performance.'
      }
    ]
  }
]

export default function SupportPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="bg-near-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black mb-4">Support</h1>
          <p className="text-lg text-gray-300">
            We're here to help. Find answers to common questions or get in touch.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <section id="faqs" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {faqs.map((category) => (
              <div key={category.category}>
                <h3 className="text-2xl font-black mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.questions.map((faq, index) => {
                    const key = `${category.category}-${index}`
                    return (
                      <div key={key} className="border border-gray-border">
                        <button
                          onClick={() => setOpenQuestion(openQuestion === key ? null : key)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold hover:bg-gray-light transition-colors"
                        >
                          {faq.q}
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 transition-transform flex-shrink-0 ml-4',
                              openQuestion === key && 'rotate-180'
                            )}
                          />
                        </button>
                        {openQuestion === key && (
                          <div className="p-4 pt-0 text-gray-secondary">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section id="shipping" className="py-20 lg:py-32 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-black mb-12 text-center">Shipping & Delivery</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-border p-8">
              <div className="text-3xl font-black mb-3">🚚</div>
              <h3 className="text-lg font-bold mb-2">Standard Shipping</h3>
              <p className="text-sm text-gray-secondary mb-2">5-7 business days</p>
              <p className="text-sm text-gray-secondary">Free on orders over ₹999</p>
            </div>
            <div className="bg-white border border-gray-border p-8">
              <div className="text-3xl font-black mb-3">⚡</div>
              <h3 className="text-lg font-bold mb-2">Express Shipping</h3>
              <p className="text-sm text-gray-secondary mb-2">2-3 business days</p>
              <p className="text-sm text-gray-secondary">₹99 flat rate</p>
            </div>
            <div className="bg-white border border-gray-border p-8">
              <div className="text-3xl font-black mb-3">📦</div>
              <h3 className="text-lg font-bold mb-2">Secure Packaging</h3>
              <p className="text-sm text-gray-secondary mb-2">Premium packaging</p>
              <p className="text-sm text-gray-secondary">Discreet delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">Get in Touch</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-light border border-gray-border p-8">
              <h3 className="text-lg font-bold mb-2">Email Support</h3>
              <p className="text-sm text-gray-secondary mb-4">
                Get a response within 24 hours
              </p>
              <a
                href="mailto:contact@manthmwear.com"
                className="text-sm font-bold underline hover:text-gray-secondary"
              >
                contact@manthmwear.com
              </a>
            </div>
            <div className="bg-gray-light border border-gray-border p-8">
              <h3 className="text-lg font-bold mb-2">Phone Support</h3>
              <p className="text-sm text-gray-secondary mb-4">
                Call us during business hours
              </p>
              <div className="space-y-2">
                <a
                  href="tel:+919310061405"
                  className="block text-sm font-bold hover:text-gray-secondary"
                >
                  +91 9310061405
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={async (e) => {
            e.preventDefault()
            setSubmitting(true)
            setSubmitStatus('idle')

            try {
              const response = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              })

              if (response.ok) {
                setSubmitStatus('success')
                setFormData({ name: '', email: '', subject: '', message: '' })
                setTimeout(() => setSubmitStatus('idle'), 5000)
              } else {
                setSubmitStatus('error')
              }
            } catch (error) {
              setSubmitStatus('error')
            } finally {
              setSubmitting(false)
            }
          }} className="space-y-6">
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                <p className="font-bold">Message sent successfully!</p>
                <p className="text-sm">We'll get back to you within 24 hours.</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="font-bold">Failed to send message.</p>
                <p className="text-sm">Please try again or contact us directly.</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold tracking-wider-xl uppercase mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-border focus:outline-none focus:border-text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold tracking-wider-xl uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-border focus:outline-none focus:border-text-black"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold tracking-wider-xl uppercase mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-border focus:outline-none focus:border-text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold tracking-wider-xl uppercase mb-2">
                Message
              </label>
              <textarea
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-border focus:outline-none focus:border-text-black resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-text-black text-white py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
