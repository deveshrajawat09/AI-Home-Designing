/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        night: "#0f172a",
        teal: "#14b8a6",
        coral: "#fb7185",
      },
    },
    fontFamily: {
      sans: ['"Space Grotesk"', "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
    },
  },
  plugins: [],
};