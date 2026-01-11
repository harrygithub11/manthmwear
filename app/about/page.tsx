import { brandInfo } from '@/lib/data'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="bg-near-black text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block border border-gray-500 px-4 py-2 text-xs font-bold tracking-wider-xl uppercase mb-6">
            Our Story
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-6">
            {brandInfo.tagline}
          </h1>
          <p className="text-xl text-gray-300">
            A journey of brotherhood, passion, and redefining men's comfort
          </p>
        </div>
      </div>

      {/* The Beginning */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-8">The Beginning</h2>
          <div className="space-y-6 text-lg text-gray-secondary leading-relaxed">
            <p>{brandInfo.story}</p>
            <p>{brandInfo.mission}</p>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section id="story" className="py-20 lg:py-32 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">Meet the Founders</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {brandInfo.founders.map((founder) => (
              <div key={founder.name} className="bg-white border border-gray-border p-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{founder.name}</h3>
                  <p className="text-sm text-gray-secondary tracking-wider-xl uppercase">{founder.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black mb-4">01</div>
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-secondary">
                We use only the finest materials and advanced manufacturing techniques to ensure exceptional quality in every product.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">02</div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-secondary">
                Our IntelliCraft technology and continuous research ensure we're always pushing the boundaries of comfort and performance.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">03</div>
              <h3 className="text-xl font-bold mb-3">Made in India</h3>
              <p className="text-gray-secondary">
                Proudly manufactured in India, supporting local craftsmanship and contributing to the nation's growing textile excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Made in India */}
      <section className="py-20 lg:py-32 bg-near-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl lg:text-8xl font-black mb-8">🇮🇳</div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Proudly Made in {brandInfo.madeIn}
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Every MANTHM product is crafted with pride in India, combining traditional craftsmanship
            with modern technology to deliver world-class quality.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-text-black px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-light transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  )
}
