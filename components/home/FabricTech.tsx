import Link from 'next/link'
import { products } from '@/lib/data'
import { ArrowRight } from 'lucide-react'

export default function FabricTech() {
  const fabric = products.trunkCore.fabric

  return (
    <section className="py-20 lg:py-32 bg-near-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-block border border-gray-500 px-4 py-2 text-xs font-bold tracking-wider-xl uppercase mb-6">
              IntelliCraft Technology
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Fabric That<br />Works With You
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Our proprietary IntelliCraft fabric technology combines the world's finest materials
              for superior sophistication, craftsmanship, and all-day comfort.
            </p>

            {/* Composition */}
            <div className="space-y-4 mb-8">
              {fabric.composition.map((comp) => (
                <div key={comp.material} className="flex items-center justify-between border-b border-gray-700 pb-3">
                  <span className="font-medium">{comp.material}</span>
                  <span className="text-2xl font-black">{comp.percentage}%</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {fabric.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/fabric-tech"
              className="inline-flex items-center gap-2 text-sm font-bold tracking-wider-xl uppercase border-b-2 border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-all"
            >
              Learn More About Our Fabric
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative aspect-square border border-gray-700 overflow-hidden">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: "url('/Fabric/Fabric.jpg')" }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
            {/* Callout Box */}
            <div className="absolute -bottom-8 -right-8 bg-white text-text-black p-6 max-w-xs border-4 border-near-black">
              <div className="text-sm font-bold tracking-wider-xl uppercase mb-2">
                Premium Pownal Modal
              </div>
              <p className="text-sm text-gray-secondary">
                Luxuriously soft, breathable, and twice as strong as regular cotton.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
