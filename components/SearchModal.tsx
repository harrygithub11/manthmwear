'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  slug: string
  name: string
  tagline: string | null
  category: string
  image: string | null
  url: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  isHome: boolean
  isScrolled: boolean
}

export function SearchModal({ isOpen, onClose, isHome, isScrolled }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
      setSelectedIndex(-1)
    }
  }, [isOpen])

  // Search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      router.push(results[selectedIndex].url)
      onClose()
    }
  }

  // Handle result click
  const handleResultClick = (url: string) => {
    router.push(url)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl animate-in slide-in-from-top duration-300">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-border">
            <Search className="w-5 h-5 text-gray-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for products..."
              className="flex-1 text-lg outline-none placeholder:text-gray-secondary"
            />
            {loading && <Loader2 className="w-5 h-5 text-gray-secondary animate-spin" />}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-light rounded-full transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="p-8 text-center text-gray-secondary">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Type at least 2 characters to search</p>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="p-8 text-center text-gray-secondary">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold mb-1">No results found</p>
                <p className="text-sm">Try different keywords</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 hover:bg-gray-light transition-colors text-left',
                      selectedIndex === index && 'bg-gray-light'
                    )}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-light border border-gray-border flex-shrink-0 overflow-hidden">
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-secondary">
                          <Search className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-black mb-1 truncate">
                        {result.name}
                      </h3>
                      {result.tagline && (
                        <p className="text-sm text-gray-secondary truncate">
                          {result.tagline}
                        </p>
                      )}
                      <p className="text-xs text-gray-secondary uppercase mt-1">
                        {result.category}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-secondary">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Hint */}
          {results.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-border bg-gray-light text-xs text-gray-secondary flex items-center justify-between">
              <span>Use ↑↓ to navigate</span>
              <span>Press Enter to select</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
