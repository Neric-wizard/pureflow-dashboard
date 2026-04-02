/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient-flow': 'gradient-flow 4s linear infinite',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        scan: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(100vw) translateY(100vh) rotate(45deg)' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
animation: {
  'scanline': 'scanline 3s linear infinite',
},
keyframes: {
  scanline: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(100%)' },
  },
},