/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-in': '#00a040',
        'red-out': '#e53935',
        'yellow-report': '#ffc107',
        'cyan-view': '#17a2b8',
        'orange-calc': '#ff9800',
        'blue-time': '#00aff0',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.counter-button': {
          '@apply select-none': {},
          'touch-action': 'manipulation',
          '-ms-touch-action': 'manipulation',
          '-webkit-touch-callout': 'none',
        },
        '.large-counter-button': {
          height: '32vh',
          'min-height': '200px',
        },
        '.small-counter-button': {
          height: '20vh',
          'min-height': '120px',
        },
      })
    }
  ],
};
