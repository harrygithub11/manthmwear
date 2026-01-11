'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, Phone } from 'lucide-react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-2 border-green-600 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-black mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-secondary mb-8">
            Thank you for your order. We've received your order and will process it shortly.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-light border border-gray-border p-6 mb-8 text-left">
              <h2 className="text-xl font-black mb-4">Order Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Order ID</div>
                    <div className="text-gray-secondary font-mono">{orderId}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Order Confirmation</div>
                    <div className="text-gray-secondary">
                      A confirmation email has been sent to your registered email address.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 p-6 mb-8 text-left">
            <h3 className="text-lg font-black mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• We'll process your order within 24 hours</li>
              <li>• You'll receive tracking information via email once shipped</li>
              <li>• Estimated delivery: 5-7 business days</li>
              <li>• For any queries, contact our support team</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-block bg-text-black text-white px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/support"
              className="inline-block border-2 border-text-black text-text-black px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-light transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-border">
            <p className="text-xs text-gray-secondary mb-2">Need help with your order?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="mailto:contact@manthmwear.com" className="hover:underline flex items-center gap-2">
                <Mail className="w-4 h-4" />
                contact@manthmwear.com
              </a>
              <span className="hidden sm:inline text-gray-border">|</span>
              <a href="tel:+918882478024" className="hover:underline flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91 8882478024
              </a>
              <span className="hidden sm:inline text-gray-border">|</span>
              <a href="tel:+919266522527" className="hover:underline flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91 92665 22527
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
