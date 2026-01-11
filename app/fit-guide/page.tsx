import { products } from '@/lib/data'
import Link from 'next/link'

export default function FitGuidePage() {
  const sizes = products.trunkCore.sizes

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="bg-near-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black mb-4">Fit Guide</h1>
          <p className="text-lg text-gray-300">
            Find your perfect size for maximum comfort
          </p>
        </div>
      </div>

      {/* Size Chart */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-black mb-8 text-center">Size Chart</h2>
          
          <div className="overflow-x-auto mb-12">
            <table className="w-full border border-gray-border">
              <thead>
                <tr className="bg-gray-light">
                  <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase border-b border-gray-border">
                    Size
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase border-b border-gray-border">
                    Waist (Inches)
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase border-b border-gray-border">
                    Waist (CM)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, index) => (
                  <tr
                    key={size.size}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-light'}
                  >
                    <td className="py-4 px-6 font-bold text-xl border-b border-gray-border">
                      {size.size}
                    </td>
                    <td className="py-4 px-6 text-gray-secondary border-b border-gray-border">
                      {size.waistInches}
                    </td>
                    <td className="py-4 px-6 text-gray-secondary border-b border-gray-border">
                      {size.waistCm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-light border border-gray-border p-6 mb-12">
            <h3 className="text-lg font-bold mb-3">📏 Sizing Tip</h3>
            <p className="text-gray-secondary">
              Choose your true-to-waist size for the best fit. If you're between sizes, we recommend sizing up
              for a more relaxed fit or sizing down for a snugger fit. Our 4-Way Stretch fabric adapts to your body.
            </p>
          </div>
        </div>
      </section>

      {/* How to Measure */}
      <section className="py-20 lg:py-32 bg-gray-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-black mb-12 text-center">How to Measure</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visual Placeholder */}
            <div className="aspect-square bg-white border border-gray-border flex items-center justify-center">
              <div className="text-center p-8 text-gray-secondary">
                <div className="text-6xl mb-4">📐</div>
                <div className="font-bold">Measurement Diagram</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <div>
                <div className="text-2xl font-black mb-2">01</div>
                <h3 className="text-lg font-bold mb-2">Waist Measurement</h3>
                <p className="text-gray-secondary">
                  Measure around your natural waistline, where you normally wear your pants.
                  Keep the tape measure snug but not tight.
                </p>
              </div>
              <div>
                <div className="text-2xl font-black mb-2">02</div>
                <h3 className="text-lg font-bold mb-2">Use a Flexible Tape</h3>
                <p className="text-gray-secondary">
                  Use a flexible measuring tape for the most accurate measurement. If you don't have one,
                  use a string and then measure it against a ruler.
                </p>
              </div>
              <div>
                <div className="text-2xl font-black mb-2">03</div>
                <h3 className="text-lg font-bold mb-2">Stand Naturally</h3>
                <p className="text-gray-secondary">
                  Stand in a relaxed, natural position. Don't hold your breath or pull your stomach in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fit Types */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-black mb-12 text-center">Understanding Trunk Fit</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-border p-8">
              <h3 className="text-xl font-bold mb-3">Support</h3>
              <p className="text-gray-secondary mb-4">
                Our trunks feature a contoured pouch design for optimal support and comfort throughout the day.
              </p>
              <div className="text-sm font-bold tracking-wider-xl uppercase text-gray-secondary">
                Engineered Support
              </div>
            </div>
            <div className="bg-white border border-gray-border p-8">
              <h3 className="text-xl font-bold mb-3">Coverage</h3>
              <p className="text-gray-secondary mb-4">
                Mid-length leg design provides perfect coverage without bunching, ideal for any activity.
              </p>
              <div className="text-sm font-bold tracking-wider-xl uppercase text-gray-secondary">
                Optimal Length
              </div>
            </div>
            <div className="bg-white border border-gray-border p-8">
              <h3 className="text-xl font-bold mb-3">Waistband</h3>
              <p className="text-gray-secondary mb-4">
                Soft, elastic waistband with the MANTHM logo stays in place without digging or rolling.
              </p>
              <div className="text-sm font-bold tracking-wider-xl uppercase text-gray-secondary">
                No-Roll Design
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-near-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-6">Ready to Find Your Fit?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Shop the Trunk Core Series and experience premium comfort
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
