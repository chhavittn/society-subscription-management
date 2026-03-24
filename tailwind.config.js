/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#0F4C5C",
        navbar: "#1B3A4B",
        mainbg: "#E6F7F5",

        primary: "#00A8E8",
        accent: "#7ED9C4",

        textPrimary: "#1F2937",
        textSecondary: "#6B7280",

        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EC4899",
      },
    },
  },
  plugins: [],
};