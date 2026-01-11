import { products } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'
import { Wind, Droplet, Shield, Maximize2, Feather, Zap } from 'lucide-react'

export default function FabricTechPage() {
  const fabric = products.trunkCore.fabric
  const features = products.trunkCore.features

  return (
    <div className="min-h-screen pt-20">
      {/* Factory Hero */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <Image
          src="/factoryhero.png"
          alt="Factory manufacturing facility"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-block border border-white/70 px-4 py-2 text-xs font-bold tracking-wider-xl uppercase mb-6">
              {fabric.technology}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-6">
              Fabric Technology
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto">
              Superior sophistication, craftsmanship, and comfort engineered into every thread
            </p>
          </div>
        </div>
      </section>

      {/* IntelliCraft */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                What is IntelliCraft?
              </h2>
              <p className="text-lg text-gray-secondary leading-relaxed mb-8">
                IntelliCraft is our proprietary fabric technology that combines the world's finest materials
                with advanced weaving techniques. The result is a garment that delivers unmatched comfort,
                durability, and performance.
              </p>
              <div className="space-y-4">
                {fabric.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-text-black rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-secondary">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square border border-gray-border overflow-hidden">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: "url('/Fabric/Fabric.jpg')" }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-black/25" />
            </div>
          </div>
        </div>
      </section>

      {/* Fabric Composition */}
      <section className="py-20 lg:py-32 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">Fabric Composition</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-text-black p-8 lg:p-12 space-y-6">
              {fabric.composition.map((comp) => (
                <div key={comp.material}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold">{comp.material}</span>
                    <span className="text-4xl font-black">{comp.percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-light overflow-hidden">
                    <div
                      className="h-full bg-text-black transition-all duration-500"
                      style={{ width: `${comp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white border border-gray-border p-6">
                <h3 className="text-lg font-bold mb-2">Lenzing Modal Micro</h3>
                <p className="text-sm text-gray-secondary">
                  Premium Austrian fiber that's 2× softer than cotton, highly breathable, and eco-friendly.
                </p>
              </div>
              <div className="bg-white border border-gray-border p-6">
                <h3 className="text-lg font-bold mb-2">Super Combed Cotton</h3>
                <p className="text-sm text-gray-secondary">
                  Long-staple cotton that's combed for smoothness, strength, and durability.
                </p>
              </div>
              <div className="bg-white border border-gray-border p-6">
                <h3 className="text-lg font-bold mb-2">Elastane</h3>
                <p className="text-sm text-gray-secondary">
                  High-quality stretch fiber that provides 4-way stretch and shape retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Features */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center">Technology Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const icons: Record<string, any> = {
                'LuxeSoft': Feather,
                'Air Max': Wind,
                'Odour-free': Shield,
                '4-Way Stretch': Maximize2,
                'Premium Modal': Droplet,
                'Sweat Wicking': Zap,
              }
              const Icon = icons[feature.name]
              
              return (
                <div key={feature.name} className="bg-white border border-gray-border p-8 hover:border-text-black transition-all">
                  <Icon className="w-12 h-12 stroke-1 mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.name}</h3>
                  <p className="text-gray-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Woven Construction */}
      <section className="py-20 lg:py-32 bg-near-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">Woven Construction</h2>
            <p className="text-lg text-gray-300">
              Our unique woven construction allows free circulation of air for superior breathability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black mb-4">∞</div>
              <h3 className="text-lg font-bold mb-2">All-Day Comfort</h3>
              <p className="text-sm text-gray-300">
                Lightweight design that you'll forget you're wearing
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">○</div>
              <h3 className="text-lg font-bold mb-2">Breathability</h3>
              <p className="text-sm text-gray-300">
                Open weave structure for maximum airflow
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black mb-4">◇</div>
              <h3 className="text-lg font-bold mb-2">Durability</h3>
              <p className="text-sm text-gray-300">
                Engineered to withstand daily wear and washing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Experience IntelliCraft Technology
          </h2>
          <p className="text-lg text-gray-secondary mb-8">
            Feel the difference that premium fabric makes
          </p>
          <Link
            href="/shop"
            className="inline-block bg-text-black text-white px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Shop Trunk Core Series
          </Link>
        </div>
      </section>
    </div>
  )
}
