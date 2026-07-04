/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // Disable the preflight base reset so Bootstrap's base styles remain intact.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
