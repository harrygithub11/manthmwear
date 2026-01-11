export const products = {
  trunkCore: {
    id: 'trunk-core',
    name: 'Trunk Core Series',
    tagline: 'Crafted for the modern gentleman',
    description: "Redefines men's essentials with unmatched comfort, style, and durability. Proudly Made in India.",
    features: [
      { name: 'LuxeSoft', description: 'Luxuriously soft feel on the skin' },
      { name: 'Air Max', description: 'Superior breathability' },
      { name: 'Odour-free', description: 'Anti-microbial finish for long-lasting freshness' },
      { name: '4-Way Stretch', description: 'Flexible fit that moves with you' },
      { name: 'Premium Modal', description: '2× Softer Than Cotton' },
      { name: 'Sweat Wicking', description: 'Cool & Dry Comfort' }
    ],
    fabric: {
      composition: [
        { material: 'Lenzing Modal Micro', percentage: 50 },
        { material: 'Super Combed Cotton', percentage: 45 },
        { material: 'Elastane', percentage: 5 }
      ],
      technology: 'IntelliCraft',
      benefits: [
        'Woven construction allows free circulation of air',
        'Twice as strong as regular cotton',
        'Lightweight for all-day comfort'
      ]
    },
    pricing: [
      { pack: 1, price: 335, label: 'Pack of 1' },
      { pack: 2, price: 546, label: 'Pack of 2' },
      { pack: 3, price: 694, label: 'Pack of 3' }
    ],
    sizes: [
      { size: 'S', waistInches: '28-30', waistCm: '71-76' },
      { size: 'M', waistInches: '32-34', waistCm: '81-86' },
      { size: 'L', waistInches: '36-38', waistCm: '91-96' },
      { size: 'XL', waistInches: '40-42', waistCm: '101-106' }
    ],
    colors: [
      { name: 'Black', value: 'black' },
      { name: 'Royal Blue', value: 'royal-blue' },
      { name: 'Dark Green', value: 'dark-green' },
      { name: 'Maroon', value: 'maroon' },
      { name: 'Grey', value: 'grey' }
    ]
  }
}

export const brandInfo = {
  name: 'MANTHM',
  tagline: 'BE THE MAN. BE THE MYTH.',
  founders: [
    { name: 'Priyanshu Sisodiya', role: 'Co-Founder' },
    { name: 'Ankit Lohia', role: 'Co-Founder' },
    { name: 'Ayush Singh', role: 'Co-Founder' }
  ],
  story: "MANTHM is a men's underwear brand founded by three friends who shared a vision to redefine men's comfort, style, and confidence. Born from a simple idea during an evening of conversation, the brand is built on a foundation of passion and brotherhood.",
  mission: 'The founders blended comfort with modern aesthetics, resulting in underwear designed to inspire confidence in every thread. MANTHM stands today as a symbol of trust, creativity, and the courage to turn an idea into a movement, ensuring every man feels bold, comfortable, and unstoppable.',
  madeIn: 'India'
}
