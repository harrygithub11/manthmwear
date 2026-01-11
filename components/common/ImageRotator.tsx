'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  images: string[]
  className?: string
  showArrows?: boolean
}

export default function ImageRotator({ images, className, showArrows }: Props) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (safeImages.length <= 1) return
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % safeImages.length)
    }, 3000)
    return () => clearInterval(t)
  }, [safeImages.length])

  if (safeImages.length === 0) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${className || ''}`}>No Image</div>
    )
  }

  const bump = (delta: number) => {
    setIdx((i) => (i + delta + safeImages.length) % safeImages.length)
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className || ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeImages[idx]}
        alt="Product image"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {showArrows && safeImages.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); bump(-1) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 border border-gray-border"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); bump(1) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 border border-gray-border"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}
