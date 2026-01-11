export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="bg-near-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl font-black mb-4">Terms of Service</h1>
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
              <h2 className="text-3xl font-black mb-4">Agreement to Terms</h2>
              <p className="text-gray-secondary mb-4">
                Welcome to MANTHM. By accessing or using our website manthmwear.com ("Website") and purchasing our products, you agree to be bound by these Terms of Service ("Terms"). Please read these Terms carefully before using our services.
              </p>
              <p className="text-gray-secondary mb-4">
                If you do not agree to these Terms, you may not access or use our Website or purchase our products.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Eligibility</h2>
              <p className="text-gray-secondary mb-4">
                By using this Website, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into binding contracts</li>
                <li>You will use the Website in compliance with these Terms and all applicable laws</li>
                <li>All information you provide is accurate and current</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Account Registration</h2>
              <p className="text-gray-secondary mb-4">
                To make purchases, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Update your information to keep it current</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Products and Services</h2>
              
              <h3 className="text-2xl font-bold mb-3 mt-6">Product Information</h3>
              <p className="text-gray-secondary mb-4">
                We strive to display our products as accurately as possible. However:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Colors may vary slightly due to device screen settings</li>
                <li>Product descriptions are provided for general information</li>
                <li>We reserve the right to modify product specifications without notice</li>
                <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6">Pricing</h3>
              <p className="text-gray-secondary mb-4">
                All prices displayed on our Website are subject to change without notice. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Modify prices at any time</li>
                <li>Correct pricing errors even after order placement</li>
                <li>Limit quantities available for purchase</li>
                <li>Discontinue products at our discretion</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6">Availability</h3>
              <p className="text-gray-secondary mb-4">
                Product availability is not guaranteed. If an ordered item becomes unavailable, we will notify you and offer a refund or alternative product.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Orders and Payment</h2>
              
              <h3 className="text-2xl font-bold mb-3 mt-6">Order Placement</h3>
              <p className="text-gray-secondary mb-4">
                When you place an order:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>You are making an offer to purchase the selected products</li>
                <li>We send an order confirmation email (this is not acceptance)</li>
                <li>We reserve the right to accept or decline your order</li>
                <li>Contract is formed when we ship the products</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6">Payment</h3>
              <p className="text-gray-secondary mb-4">
                We accept payment through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Credit/Debit Cards (Visa, Mastercard, Rupay)</li>
                <li>UPI</li>
                <li>Net Banking</li>
                <li>Cash on Delivery (where available)</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                All payments are processed securely through Razorpay. We do not store your complete payment card information.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6">Order Cancellation</h3>
              <p className="text-gray-secondary mb-4">
                We reserve the right to cancel orders if:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Products are unavailable</li>
                <li>Pricing or product information is incorrect</li>
                <li>We suspect fraudulent activity</li>
                <li>Shipping address is invalid or unserviceable</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Shipping and Delivery</h2>
              <p className="text-gray-secondary mb-4">
                Shipping terms:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li><strong>Standard Shipping:</strong> 5-7 business days</li>
                <li><strong>Express Shipping:</strong> 2-3 business days (where available)</li>
                <li><strong>Free Shipping:</strong> On orders over ₹999</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>You are responsible for providing accurate shipping information</li>
                <li>Risk of loss passes to you upon delivery to the carrier</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                For more details, see our Shipping Policy on the Support page.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Returns and Refunds</h2>
              <p className="text-gray-secondary mb-4">
                Due to the nature of our products and hygiene standards, we do not accept returns or offer refunds on any items once the order has been placed and shipped. Please choose carefully before purchasing. For complete details, please refer to our <a href="/refund" className="underline hover:text-text-black">Refund Policy</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Intellectual Property</h2>
              <p className="text-gray-secondary mb-4">
                All content on this Website, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Text, graphics, logos, images, and designs</li>
                <li>Product names and descriptions</li>
                <li>Software and code</li>
                <li>The "MANTHM" name and logo</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                are the property of MANTHM or our licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-secondary mb-4">
                You may not:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Reproduce, distribute, or display our content without permission</li>
                <li>Use our trademarks without written authorization</li>
                <li>Modify or create derivative works from our content</li>
                <li>Use automated systems to access or scrape our Website</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Prohibited Uses</h2>
              <p className="text-gray-secondary mb-4">
                You may not use our Website to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Interfere with the Website's operation or security</li>
                <li>Collect user information without consent</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm others</li>
                <li>Post offensive, illegal, or inappropriate content</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">User Content</h2>
              <p className="text-gray-secondary mb-4">
                If you submit reviews, comments, or other content to our Website, you grant us:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>A non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content</li>
                <li>The right to use your content for marketing and promotional purposes</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                You represent that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>You own or have rights to the content you submit</li>
                <li>Your content does not violate any third-party rights</li>
                <li>Your content complies with these Terms</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Disclaimers</h2>
              <p className="text-gray-secondary mb-4">
                OUR WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties regarding accuracy, reliability, or availability</li>
                <li>Warranties that the Website will be uninterrupted or error-free</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>The Website will meet your specific requirements</li>
                <li>All errors will be corrected</li>
                <li>The Website is free from viruses or harmful components</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Limitation of Liability</h2>
              <p className="text-gray-secondary mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MANTHM SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Personal injury or property damage</li>
                <li>Damages arising from unauthorized access to our systems</li>
              </ul>
              <p className="text-gray-secondary mb-4">
                Our total liability shall not exceed the amount you paid for the product giving rise to the claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Indemnification</h2>
              <p className="text-gray-secondary mb-4">
                You agree to indemnify, defend, and hold harmless MANTHM and its officers, directors, employees, and agents from any claims, damages, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-secondary space-y-2">
                <li>Your use of the Website</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your content or submissions</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Governing Law</h2>
              <p className="text-gray-secondary mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our Website shall be subject to the exclusive jurisdiction of the courts in [Your City/State], India.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Dispute Resolution</h2>
              <p className="text-gray-secondary mb-4">
                If you have a dispute with us, we encourage you to contact us first at <a href="mailto:contact@manthmwear.com" className="underline hover:text-text-black">contact@manthmwear.com</a> to seek resolution.
              </p>
              <p className="text-gray-secondary mb-4">
                If we cannot resolve the dispute informally, any legal action must be brought within one (1) year after the claim arose.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Changes to Terms</h2>
              <p className="text-gray-secondary mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Website. Your continued use of the Website after changes constitutes acceptance of the modified Terms.
              </p>
              <p className="text-gray-secondary mb-4">
                We encourage you to review these Terms periodically.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Severability</h2>
              <p className="text-gray-secondary mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Entire Agreement</h2>
              <p className="text-gray-secondary mb-4">
                These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and MANTHM regarding your use of the Website and supersede all prior agreements.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black mb-4">Contact Information</h2>
              <p className="text-gray-secondary mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-light border border-gray-border p-6 mt-4">
                <p className="font-bold mb-2">MANTHM</p>
                <p className="text-gray-secondary mb-1">Email: <a href="mailto:contact@manthmwear.com" className="underline hover:text-text-black">contact@manthmwear.com</a></p>
                <p className="text-gray-secondary mb-1">Phone: <a href="tel:+918882478024" className="underline hover:text-text-black">+91 8882478024</a></p>
                <p className="text-gray-secondary">Phone: <a href="tel:+919266522527" className="underline hover:text-text-black">+91 92665 22527</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
