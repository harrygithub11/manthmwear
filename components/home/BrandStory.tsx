import { brandInfo } from '@/lib/data'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function BrandStory() {
  return (
    <section className="py-20 lg:py-32 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Founders card */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-border p-6">
              <div className="text-xs font-bold tracking-wider-xl uppercase text-gray-secondary mb-4">Founders</div>
              <div className="flex flex-col gap-4">
                {brandInfo.founders.map((founder) => (
                  <div key={founder.name} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <User className="h-4 w-4 text-gray-800" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-black leading-tight">{founder.name}</div>
                      <div className="text-[11px] uppercase tracking-wider-xl text-gray-secondary">{founder.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Story Content */}
          <div>
            <div className="inline-block border border-text-black px-4 py-2 text-xs font-bold tracking-wider-xl uppercase mb-6">
              Our Story
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Built on Brotherhood.<br />
              Driven by Passion.
            </h2>
            
            <div className="space-y-4 text-gray-secondary leading-relaxed mb-8">
              <p>{brandInfo.story}</p>
              <p>{brandInfo.mission}</p>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gray-border" />
              <div className="text-sm font-bold tracking-wider-xl uppercase">
                Made in {brandInfo.madeIn}
              </div>
              <div className="h-px flex-1 bg-gray-border" />
            </div>

            {/* CTA */}
            <Link
              href="/about"
              className="inline-block border-2 border-text-black px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-text-black hover:text-white transition-all"
            >
              Read Our Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
