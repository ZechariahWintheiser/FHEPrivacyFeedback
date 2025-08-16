/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f8f5',
          100: '#d5f4e6',
          200: '#abebc6',
          300: '#82e0aa',
          400: '#58d68d',
          500: '#27ae60',
          600: '#16a085',
          700: '#0f9b8e',
          800: '#0d7a6d',
          900: '#0a5a52',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
