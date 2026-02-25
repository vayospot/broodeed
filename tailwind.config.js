/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
      },
      colors: {
        // Backgrounds
        deep: "#0D1B12",
        surface: "#162518",
        elevated: "#1E3320",

        // Brand
        "brand-primary": "#4CAF72",
        "brand-amber": "#F5A623",
        "brand-amber-dim": "#C47E0F",

        // Semantic
        danger: "#E05C5C",
        "danger-dim": "#5C1F1F",
        warning: "#F5C542",

        // Text
        primary: "#F0F5F1",
        secondary: "#8BA690",
        disabled: "#4A5E4D",

        // Borders
        border: "#253C29",
      },
    },
  },
  plugins: [],
};
