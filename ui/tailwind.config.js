/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      xs: ".7rem",
      sm: ".75rem",
      tiny: ".8rem",
      base: ".85rem",
      lg: "1rem",
      xl: "1.15rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "4rem",
      "7xl": "5rem",
    },
    extend: {
      colors: {
        "background": "#f2f1eb",
        "primary": "#aa3c16",
        "background-2": "#b5ada2",
      },
      maxHeight: {
        card: "400px",
        table: "500px"
      },
    },
  },
  plugins: [],
};
