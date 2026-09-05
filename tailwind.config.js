/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f2f6f5',
          100: '#dde8e5',
          200: '#b9d1cb',
          300: '#8fb4ac',
          400: '#5f8f85',
          500: '#3f716a',
          600: '#2e5b54',
          700: '#254944',
          800: '#1c3733',
          900: '#122522',
          950: '#0b1615',
        },
        income: {
          DEFAULT: '#0f9d70',
          light: '#e3f7ee',
          dark: '#0b7a58',
        },
        expense: {
          DEFAULT: '#e0603f',
          light: '#fdece6',
          dark: '#b8482c',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f7f8f7',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 37, 34, 0.06), 0 4px 16px rgba(18, 37, 34, 0.06)',
      },
    },
  },
  plugins: [],
}
