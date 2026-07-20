/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#059669", // Premium Emerald Green
          dark: "#047857", // Deep Emerald
          light: "#ECFDF5", // Soft Mint Tint
        },
        secondary: {
          DEFAULT: "#0F172A",
          dark: "#020617",
          light: "#1E293B",
        },
        background: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E5E7EB",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      }
    },
  },
  plugins: [],
}
