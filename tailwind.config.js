/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        der: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#1d4ed8'
        },
        die: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#b91c1c'
        },
        das: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#047857'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
