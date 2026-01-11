import { Wind, Droplet, Shield, Maximize2, Feather, Zap } from 'lucide-react'
import { products } from '@/lib/data'

const featureIcons: Record<string, any> = {
  'LuxeSoft': Feather,
  'Air Max': Wind,
  'Odour-free': Shield,
  '4-Way Stretch': Maximize2,
  'Premium Modal': Droplet,
  'Sweat Wicking': Zap,
}

export default function KeyFeatures() {
  const features = products.trunkCore.features

  return (
    <section className="py-20 lg:py-32 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Engineered Excellence</h2>
          <p className="text-lg text-gray-secondary max-w-2xl mx-auto">
            Every feature crafted for maximum comfort and performance
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = featureIcons[feature.name]
            return (
              <div
                key={feature.name}
                className="bg-white p-8 border border-gray-border hover:border-text-black transition-all duration-200 group"
              >
                <div className="mb-4">
                  <Icon className="w-12 h-12 stroke-1 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                <p className="text-gray-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
