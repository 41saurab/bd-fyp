/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#f93737',
          600: '#e61414',
          700: '#c00d0d',
          800: '#a00f0f',
          900: '#841414',
          950: '#480606',
        },
        crimson: '#c0392b',
        scarlet: '#e74c3c',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Serif 4', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'blood': '0 4px 20px rgba(192, 57, 43, 0.3)',
        'blood-lg': '0 8px 40px rgba(192, 57, 43, 0.4)',
      }
    },
  },
  plugins: [],
}
