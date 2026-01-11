export default function ShopHero() {
  return (
    <div className="relative bg-near-black overflow-hidden">
      {/* Background Image Container with correct aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '44%' }}>
        <div className="absolute inset-0">
          <img 
            src="/mantham banner.png" 
            alt="Shop Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-white drop-shadow-lg">Shop</h1>
            <p className="text-base sm:text-lg text-white max-w-2xl mx-auto drop-shadow-md">
              Premium men's underwear engineered for comfort and style
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
