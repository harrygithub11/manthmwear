'use client'

import { cn } from '@/lib/utils'

interface ColorDotProps {
  color: string
  colorCode?: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function ColorDot({ 
  color, 
  colorCode = '#CCCCCC', 
  selected = false, 
  onClick, 
  size = 'md',
  showLabel = false,
  className
}: ColorDotProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const isLightColor = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luma > 200
  }

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative rounded-full transition-all duration-200 flex-shrink-0",
          sizeClasses[size],
          selected 
            ? size === 'sm' 
              ? "ring-2 ring-text-black ring-offset-1" 
              : "ring-2 ring-text-black ring-offset-2 scale-110"
            : "ring-1 ring-gray-300 hover:ring-gray-400" + (size !== 'sm' ? " hover:scale-105" : "")
        )}
        title={color}
        aria-label={`Select ${color}`}
      >
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: colorCode }}
        />
        {/* Border for light colors */}
        {isLightColor(colorCode) && (
          <div className="absolute inset-0 rounded-full border border-gray-300" />
        )}
        {/* Checkmark for selected */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
      {showLabel && (
        <span className="text-xs text-center capitalize text-gray-600 max-w-[60px] truncate">
          {color}
        </span>
      )}
    </div>
  )
}
