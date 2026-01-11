// Color mapping for product variants
export const colorMap: Record<string, string> = {
  // Basic colors
  'black': '#000000',
  'white': '#FFFFFF',
  'grey': '#808080',
  'gray': '#808080',
  
  // Blues
  'navy': '#000080',
  'blue': '#0000FF',
  'sky blue': '#87CEEB',
  'royal blue': '#4169E1',
  
  // Reds/Pinks
  'red': '#FF0000',
  'maroon': '#800000',
  'pink': '#FFC0CB',
  'rose': '#FF007F',
  
  // Greens
  'green': '#008000',
  'olive': '#808000',
  'lime': '#00FF00',
  'forest green': '#228B22',
  
  // Purples
  'purple': '#800080',
  'violet': '#EE82EE',
  'lavender': '#E6E6FA',
  
  // Browns/Tans
  'brown': '#A52A2A',
  'tan': '#D2B48C',
  'beige': '#F5F5DC',
  'khaki': '#F0E68C',
  
  // Others
  'orange': '#FFA500',
  'yellow': '#FFFF00',
  'gold': '#FFD700',
  'silver': '#C0C0C0',
  'cream': '#FFFDD0',
}

export function getColorHex(colorName: string, colorCode?: string): string {
  // If colorCode is provided from database, use it
  if (colorCode && colorCode.startsWith('#')) {
    return colorCode
  }
  // Otherwise fallback to color name mapping
  const normalized = colorName.toLowerCase().trim()
  return colorMap[normalized] || '#CCCCCC' // Default to light gray if color not found
}

export function getColorBorderClass(colorName: string): string {
  const normalized = colorName.toLowerCase().trim()
  // White needs a visible border
  if (normalized === 'white' || normalized === 'cream') {
    return 'border-gray-300'
  }
  return 'border-transparent'
}
