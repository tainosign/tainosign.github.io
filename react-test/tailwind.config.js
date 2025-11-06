/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        'green-in': '#00a040',
        'red-out': '#e53935',
        'yellow-report': '#ffc107',
        'cyan-view': '#17a2b8',
        'orange-calc': '#ff9800',
        'blue-time':'#00aff0',        
      }
    }
  },
  plugins: [],
}

