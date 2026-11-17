/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070B16',
          900: '#0A1020',
          850: '#0E1528',
          800: '#121B32',
          700: '#1B2742',
        },
        royal: {
          50: '#FFF0F8',
          100: '#FFD6EC',
          200: '#FFADD8',
          300: '#FF7CBE',
          400: '#F94AA3',
          500: '#E4007C',
          600: '#C20068',
          700: '#980052',
        },
        gold: {
          400: '#E8C97A',
          500: '#D4AF37',
          600: '#B8932B',
        },
        teal: {
          400: '#2DD4BF',
          500: '#00A6A6',
          600: '#008787',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(228, 0, 124, 0.18)',
        card: '0 18px 50px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'royal-radial': 'radial-gradient(circle at 15% 0%, rgba(228,0,124,0.16), transparent 42%), radial-gradient(circle at 85% 10%, rgba(0,166,166,0.10), transparent 36%)',
      },
    },
  },
  plugins: [],
}
