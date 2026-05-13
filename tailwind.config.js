/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./JS/**/*.js", "!./JS/lib/**/*.js"],
  theme: {
    extend: {
      colors: {
        thm: {
          green: "#80ba24",
          gray: "#4a5c66",
          red: "#b00040",
          yellow: "#ffb300",
          cyan: "#00aeef",
          blue: "#003f7d",
        },
      },
      fontFamily: {
        thm: ['"DIN Pro"', '"DIN 2014"', "Arial", "Helvetica", "sans-serif"],
        sans: ['"DIN Pro"', '"DIN 2014"', "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
