/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'near-black': '#0A0A0A',
        'text-black': '#111111',
        'gray-light': '#F5F5F5',
        'gray-border': '#E6E6E6',
        'gray-secondary': '#999999',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      letterSpacing: {
        'wider-xl': '0.1em',
      },
    },
  },
  plugins: [],
}
