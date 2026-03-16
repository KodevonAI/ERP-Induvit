/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dce9ff',
          200: '#b3d1ff',
          300: '#7ab1ff',
          400: '#3d88ff',
          500: '#1a63f5',
          600: '#0d47e0',
          700: '#0d38b5',
          800: '#112e8f',
          900: '#142b72',
          950: '#0e1c4e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

