/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#10b981",
        dark: "#0f172a",
        darker: "#020617",
        surface: "#1e293b",
        glass: "rgba(30, 41, 59, 0.8)",
      },
    },
  },
  plugins: [],
};
