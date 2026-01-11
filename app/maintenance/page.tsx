'use client'

import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

export default function MaintenancePage() {
  const [message, setMessage] = useState('We\'re currently performing maintenance. Please check back soon.')

  useEffect(() => {
    // Fetch maintenance message
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.maintenanceMessage) {
          setMessage(data.maintenanceMessage)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Settings className="w-20 h-20 text-gray-400 animate-spin-slow" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 rounded-full blur-xl"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-black mb-4 text-gray-900">Under Maintenance</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>We'll be back shortly</span>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Thank you for your patience
          </p>
        </div>
      </div>
    </div>
  )
}
