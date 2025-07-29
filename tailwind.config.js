/** @type {import('tailwindcss').Config} */
const PrimeUI = require("tailwindcss-primeui");

module.exports = {
  content: [
    "./src/**/*.{html,ts,pug}",
    "./node_modules/primeng/**/*.{esm.js,mjs}",
  ],
  darkMode: ["selector", '[class="p-dark"]'],
  theme: {
    screens: {
      xs: "320px",
      sm: "576px",
      md: "768px",
      lg: "1440px",
      xl: "1200px",
      "2xl": "1920px",
      "3xl": "2560px",
    },
  },
  plugins: [require("@tailwindcss/forms"), PrimeUI],
};
