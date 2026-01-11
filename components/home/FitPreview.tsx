import Link from 'next/link'
import { products } from '@/lib/data'

export default function FitPreview() {
  const sizes = products.trunkCore.sizes

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Find Your Perfect Fit</h2>
          <p className="text-lg text-gray-secondary max-w-2xl mx-auto">
            Our sizing is designed to provide the ideal fit for maximum comfort
          </p>
        </div>

        {/* Size Table */}
        <div className="max-w-3xl mx-auto mb-12 overflow-x-auto">
          <table className="w-full border border-gray-border">
            <thead>
              <tr className="bg-gray-light">
                <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase">Size</th>
                <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase">Waist (Inches)</th>
                <th className="py-4 px-6 text-left text-sm font-bold tracking-wider-xl uppercase">Waist (CM)</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size, index) => (
                <tr
                  key={size.size}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-light'}
                >
                  <td className="py-4 px-6 font-bold text-lg">{size.size}</td>
                  <td className="py-4 px-6 text-gray-secondary">{size.waistInches}</td>
                  <td className="py-4 px-6 text-gray-secondary">{size.waistCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/fit-guide"
            className="inline-block bg-text-black text-white px-8 py-4 text-sm font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Complete Fit Guide
          </Link>
        </div>
      </div>
    </section>
  )
}
