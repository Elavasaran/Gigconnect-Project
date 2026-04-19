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
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c7d6ff',
          300: '#a3b8ff',
          400: '#7a8fff',
          500: '#5c6cfa',
          600: '#4a53ee',
          700: '#3e41d8',
          800: '#3537b0',
          900: '#2f328c',
          950: '#1b1c52',
        },
      },
    },
  },
  plugins: [],
}
