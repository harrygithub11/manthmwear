'use client'

import { useState } from 'react'
import QuickBuyModal, { QuickBuyProduct } from '@/components/common/QuickBuyModal'

export default function PdpQuickBuy({ product }: { product: QuickBuyProduct }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block bg-black text-white px-6 py-3 font-bold"
      >
        Add to Cart
      </button>
      {open && (
        <QuickBuyModal product={product} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
