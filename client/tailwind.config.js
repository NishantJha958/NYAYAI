/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nyaya: {
          navy: '#0f2744',
          blue: '#1e3a5f',
          gold: '#c9a227',
          light: '#f4f6f9',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        creditsScroll: {
          '0%': { transform: 'translateY(120px)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out both',
        'fade-in-up-delay-1': 'fadeInUp 0.7s ease-out 0.15s both',
        'fade-in-up-delay-2': 'fadeInUp 0.7s ease-out 0.3s both',
        'fade-in-up-delay-3': 'fadeInUp 0.7s ease-out 0.45s both',
        'fade-in-up-delay-4': 'fadeInUp 0.7s ease-out 0.6s both',
        'fade-in-down': 'fadeInDown 0.7s ease-out both',
        'slide-in-left': 'slideInLeft 0.7s ease-out both',
        'slide-in-right': 'slideInRight 0.7s ease-out both',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'ticker': 'ticker 25s linear infinite',
        'scale-in': 'scaleIn 0.5s ease-out both',
        'pulse2': 'pulse2 2s ease-in-out infinite',
        'credits-scroll': 'creditsScroll 12s linear infinite',
      },
    },
  },
  plugins: [],
};
