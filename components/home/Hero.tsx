"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const slides = [
    '/Banner/DSC09292.jpg',
    '/Banner/DSC09293.jpg',
    '/Banner/DSC09310%20BW.jpg',
    '/Banner/DSC09310.jpg',
    '/Banner/DSC09312%20BW.jpg',
    '/Banner/DSC09312.jpg',
  ]
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)


  const start = () => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, 5000)
  }

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Start slider
    start()
    

    
    return () => {
      stop()
      window.removeEventListener('resize', checkMobile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white"
    >
      {/* Background slider */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {slides.map((src, i) => (
          <div
            key={src}
            className={
              'absolute inset-0 bg-center bg-cover bg-no-repeat transition-opacity duration-700 ' +
              (i === active ? 'opacity-100' : 'opacity-0')
            }
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}

      </div>
      {/* Overlay */}
      <div className="absolute inset-0 -z-0 bg-near-black/40" />
      {/* Vignette gradients for readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 -z-0 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 -z-0 bg-gradient-to-t from-black/70 to-transparent" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/90">IntelliCraft Fabric • Made in India</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-[40px] sm:text-[56px] lg:text-[76px] xl:text-[88px] leading-[1.05] font-black tracking-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
          Premium Trunks.
          
           Engineered for Comfort.
        </h1>
        
        {/* Subheading */}
        <p className="text-base sm:text-lg lg:text-xl text-white/85 mb-8 max-w-3xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
          LuxeSoft. Air Max. 4‑Way Stretch. Odour‑free. 2× Softer Than Cotton.
        </p>

        {/* Feature chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {['Breathable', '4‑Way Stretch', 'Sweat Wicking', 'Lightweight'].map((chip) => (
            <span key={chip} className="text-xs sm:text-[13px] font-semibold tracking-wide uppercase text-white/90 border border-white/30 bg-white/5 px-3 py-1.5 backdrop-blur-[2px]">
              {chip}
            </span>
          ))}
        </div>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-none bg-white text-text-black px-8 py-4 text-sm sm:text-base font-extrabold tracking-[0.18em] uppercase hover:bg-gray-light transition-all duration-200 shadow-[0_6px_0_0_#111] active:translate-y-[2px] active:shadow-[0_4px_0_0_#111]"
          >
            Shop Trunk Core
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/fit-guide"
            className="inline-flex items-center gap-2 rounded-none border-2 border-white/80 text-white px-8 py-4 text-sm sm:text-base font-extrabold tracking-[0.18em] uppercase hover:bg-white hover:text-text-black transition-all duration-200 backdrop-blur-[2px]"
          >
            Find Your Size
          </Link>
        </div>
        
        {/* Tagline */}
        <div className="inline-block border-t border-b border-white/40 py-2 px-6 backdrop-blur-[2px]">
          <p className="text-xs sm:text-sm font-extrabold tracking-[0.28em] uppercase text-white/90">
            BE THE MAN. BE THE MYTH.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-[11px] tracking-[0.2em] uppercase"></span>
          <div className="animate-bounce w-6 h-10 border-2 border-white/80 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/90 rounded-full" />
          </div>
        </div>
      </div>

      
    </section>
  )
}
