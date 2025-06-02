/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#646cff',
          hover: '#747bff'
        },
        'background': {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          hover: '#334155'
        },
        'border': {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.2)'
        },
        'text': {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          disabled: '#475569'
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      },
      keyframes: {
        'toast-enter': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(100%) scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          }
        },
        'toast-exit': {
          '0%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateY(-100%) scale(0.9)' 
          }
        }
      },
      animation: {
        'toast-enter': 'toast-enter 0.15s ease-out forwards', // 更快的进入动画
        'toast-exit': 'toast-exit 0.15s ease-in forwards'     // 更快的退出动画
      }
    }
  },
  plugins: [],
}
