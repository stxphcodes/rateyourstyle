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
        "custom-grey-brown": "#b5ada2",
        "custom-lime": "#d8e303",
        "custom-pink": "#fa7be1",
        "custom-tan": "#e6cfab",
      },
        backgroundImage: {
          "gradient": "linear-gradient(90deg, rgba(216,227,3,1) 0%, rgba(230,207,171,1) 53%, rgba(250,123,225,1) 100%)",

      },
      maxHeight: {
        card: "400px",
        table: "500px"
      },
      keyframes: {
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }  
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "white"
          }  
        }
      },
      animation: {
        typing: "typing 2s steps(20) infinite alternate, blink .7s infinite"
      },
    },
  },
  plugins: [],
};
