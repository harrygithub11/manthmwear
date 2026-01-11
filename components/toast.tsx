'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

let toastQueue: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

export const toast = {
  success: (message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type: 'success',
    }
    toastQueue = [...toastQueue, newToast]
    listeners.forEach((listener) => listener(toastQueue))
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== newToast.id)
      listeners.forEach((listener) => listener(toastQueue))
    }, 3000)
  },
  error: (message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type: 'error',
    }
    toastQueue = [...toastQueue, newToast]
    listeners.forEach((listener) => listener(toastQueue))
    
    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== newToast.id)
      listeners.forEach((listener) => listener(toastQueue))
    }, 3000)
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(toastQueue))
  }

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg border-2 min-w-[300px] animate-slide-in ${
            t.type === 'success'
              ? 'bg-green-50 border-green-600 text-green-900'
              : 'bg-red-50 border-red-600 text-red-900'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="flex-shrink-0 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
