import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nexum brand palette
        accent: '#F239FF',          // Highlighter Pink (acento principal)
        primary: '#8943E3',         // Purple Glitter
        'purple-deep': '#6024AD',
        'purple-dark': '#6A32B3',
        'purple-soft': '#A46BED',
        'purple-pale': '#C9A4F7',
        snow: '#FFFFFF',
        ink: '#000000',
        fog: '#949798',
        success: '#00e676',
        error: '#ff5252',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'nexum-gradient': 'linear-gradient(135deg, #8943E3 0%, #000000 50%, #F239FF 100%)',
        'nexum-pink-ink': 'linear-gradient(135deg, #F239FF 0%, #000000 100%)',
        'nexum-hero': 'linear-gradient(135deg, #F239FF 0%, #8943E3 40%, #000000 70%, #949798 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'count-up': 'countUp 1s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'fill-bar': 'fillBar 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(242, 57, 255, 0.35)' },
          '50%': { boxShadow: '0 0 40px rgba(242, 57, 255, 0.65)' },
        },
        fillBar: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [],
}

export default config
