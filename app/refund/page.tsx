export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="bg-near-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl font-black mb-4">Refund Policy</h1>
          <p className="text-lg text-gray-300">
            Last updated: November 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Our Commitment</h2>
              <p className="text-gray-secondary mb-4">
                At MANTHM, we stand behind the quality of our products. We are committed to delivering premium quality underwear that meets the highest standards. All our products undergo strict quality checks before shipping.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">No Return Policy</h2>
              <p className="text-gray-secondary mb-4">
                Due to the nature of our products and hygiene standards, we do not accept returns or offer refunds on any items once the order has been placed and shipped.
              </p>
              <p className="text-gray-secondary mb-4">
                We encourage you to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Carefully review product descriptions and size charts before ordering</li>
                <li>Check our <a href="/fit-guide" className="underline hover:text-text-black">Fit Guide</a> for accurate sizing</li>
                <li>Contact us at <a href="mailto:contact@manthmwear.com" className="underline hover:text-text-black">contact@manthmwear.com</a> if you have any questions before purchasing</li>
              </ul>
              
              <div className="bg-gray-light border-l-4 border-text-black p-6 mt-6">
                <p className="font-bold mb-2">⚠️ Important</p>
                <p className="text-gray-secondary">
                  All sales are final. Please ensure you select the correct size, color, and quantity before completing your purchase.
                </p>
              </div>
            </section>


            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Damaged or Defective Items</h2>
              <p className="text-gray-secondary mb-4">
                If you receive a damaged or defective item:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Contact us immediately (within 48 hours of delivery)</li>
                <li>Provide photos of the defect or damage</li>
                <li>We'll send a replacement or full refund at no cost to you</li>
                <li>We provide a prepaid return label for defective items</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Wrong Item Shipped</h2>
              <p className="text-gray-secondary mb-4">
                If we shipped the wrong item:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Contact us immediately with your order number</li>
                <li>We'll send the correct item at no additional cost</li>
                <li>We provide a prepaid return label for the wrong item</li>
                <li>You can keep the wrong item or return it (no charge)</li>
              </ul>
            </section>


            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Cancellations</h2>
              
              <h3 className="text-2xl font-bold mb-3 mt-6">Before Shipment</h3>
              <p className="text-gray-secondary mb-4">
                You can cancel your order before it ships:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Contact us immediately at <a href="mailto:contact@manthmwear.com" className="underline">contact@manthmwear.com</a></li>
                <li>Full refund processed within 3-5 business days</li>
                <li>No cancellation fees</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6">After Shipment</h3>
              <p className="text-gray-secondary mb-4">
                Once your order has been shipped, it cannot be cancelled or returned except in cases of defective or wrong items as outlined above.
              </p>
              <p className="text-gray-secondary mb-4">
                Please double-check your order details before completing your purchase as all sales are final once shipped.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Questions or Issues?</h2>
              <p className="text-gray-secondary mb-4">
                If you have any questions about our policy or need to report a defective/damaged item, our customer support team is here to help:
              </p>
              <div className="bg-gray-light border border-gray-border p-6 mt-4">
                <p className="font-bold mb-2">Contact MANTHM Support</p>
                <p className="text-gray-secondary mb-1">Email: <a href="mailto:contact@manthmwear.com" className="underline hover:text-text-black">contact@manthmwear.com</a></p>
                <p className="text-gray-secondary mb-1">Phone: <a href="tel:+918882478024" className="underline hover:text-text-black">+91 8882478024</a></p>
                <p className="text-gray-secondary mb-3">Phone: <a href="tel:+919266522527" className="underline hover:text-text-black">+91 92665 22527</a></p>
                <p className="text-sm text-gray-secondary">Customer support hours: Monday-Saturday, 10 AM - 6 PM IST</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Policy Updates</h2>
              <p className="text-gray-secondary mb-4">
                We reserve the right to update this refund policy at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <div className="bg-text-black text-white p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4">Our Quality Promise</h3>
              <p className="text-white/80">
                At MANTHM, we stand behind the quality of our products. Every item undergoes rigorous quality checks before shipping. If you receive a defective or damaged product, we'll replace it immediately at no cost to you. We encourage you to review size guides and product details carefully before ordering to ensure complete satisfaction.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
