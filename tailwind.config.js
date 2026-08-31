/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090D16',
          800: '#111827',
          700: '#1A2332',
          600: '#243044',
          500: '#2D3E56',
        },
        neon: {
          teal: '#00F0FF',
          emerald: '#00FF88',
          amber: '#FFB800',
          pink: '#FF006E',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xl: '24px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'aurora': 'aurora 12s ease-in-out infinite alternate',
        'marquee': 'marquee 40s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3), 0 0 10px rgba(0, 240, 255, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6), 0 0 50px rgba(0, 240, 255, 0.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'aurora': {
          '0%': { opacity: '1', transform: 'scale(1) translate(0, 0)' },
          '33%': { opacity: '0.8', transform: 'scale(1.05) translate(2%, 1%)' },
          '66%': { opacity: '0.9', transform: 'scale(0.97) translate(-1%, 2%)' },
          '100%': { opacity: '1', transform: 'scale(1.02) translate(1%, -1%)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}