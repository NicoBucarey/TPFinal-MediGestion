/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4DD0E1',
          DEFAULT: '#00796B',
          dark: '#00695C',
        },
        secondary: {
          light: '#F5F5F5',
          DEFAULT: '#E0E0E0',
          dark: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 28px
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],     // 24px
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px
        'base': ['1rem', { lineHeight: '1.5rem' }],                      // 16px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],                   // 14px
      },
      spacing: {
        'header': '4rem',      // 64px for header height
        'sidebar': '16rem',    // 256px for sidebar width
      },
    },
  },
  plugins: [],
}