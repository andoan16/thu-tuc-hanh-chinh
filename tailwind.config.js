/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        mono: ['"Courier New"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        // Community project palette: đỏ-vàng truyền thống
        gov: {
          red: '#b91c1c',
          'red-dark': '#991b1b',
          'red-light': '#fef2f2',
          gold: '#a16207',
          'gold-light': '#fefce8',
        },
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card': '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}