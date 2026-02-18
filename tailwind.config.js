/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#0A0E27',
        midnight: '#0D1117',
        'dark-surface': '#1A1F3A',
        'electric-blue': '#00D9FF',
        'cyber-yellow': '#FFD700',
        'neon-purple': '#B026FF',
        'neon-pink': '#FF006E',
        'text-primary': '#F8F9FA',
        'text-secondary': '#B0B8C1',
        'text-muted': '#6C757D',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(10, 14, 39, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.3), inset 0 0 10px rgba(0, 217, 255, 0.2)',
        'glow-yellow': '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.2)',
        'glow-purple': '0 0 20px rgba(176, 38, 255, 0.3), inset 0 0 10px rgba(176, 38, 255, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
