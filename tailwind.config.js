/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080808',
          2:       '#101010',
          card:    '#161616',
          hover:   '#1e1e1e',
          sidebar: '#0d0d0d',
        },
        accent: {
          DEFAULT: '#c9a84c',
          h:       '#d9bc6e',
        },
        txt: {
          DEFAULT: '#f0ede8',
          muted:   '#6b6b6b',
          sub:     '#999999',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        spin: 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
