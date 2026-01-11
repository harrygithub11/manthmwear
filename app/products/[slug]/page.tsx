import ProductDetailClient from '@/components/pdp/ProductDetailClient'
import { notFound, redirect } from 'next/navigation'

const LEGACY_REDIRECTS: Record<string, string> = {
  'trunk-core-series': '/shop/trunk-core',
}

async function fetchProduct(slug: string) {
  try {
    const internalBase = `http://localhost:${process.env.PORT || '3005'}`
    const publicBase = process.env.NEXT_PUBLIC_APP_URL || ''
    const base = internalBase || publicBase

    const res = await fetch(`${base}/api/products/${slug}`, {
      cache: 'no-store',
      headers: { 'x-pdp': '1' },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Failed to load product: ${res.status}`)
    return await res.json()
  } catch {
    return null
  }
}

export default async function ProductPage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { pack?: string }
}) {
  const legacy = LEGACY_REDIRECTS[params.slug]
  if (legacy) redirect(legacy)

  const product = await fetchProduct(params.slug)
  if (!product) return notFound()

  // Parse pack parameter
  const initialPack = searchParams.pack ? parseInt(searchParams.pack) : undefined

  return <ProductDetailClient product={product} initialPack={initialPack} />
}
