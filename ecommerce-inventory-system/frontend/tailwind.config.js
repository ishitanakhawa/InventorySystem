/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        palladian: "#EEE9DF",
        oatmeal: "#C9C1B1",
        blueFantastic: "#2C3B4D",
        burningFlame: "#FFB162",
        truffleTrouble: "#A35139",
        abyssal: "#1B2632",
        primary: {
          DEFAULT: "#2C3B4D",
          hover: "#1B2632",
          active: "#0F1A22",
        },
        secondary: {
          DEFAULT: "#FFB162",
          hover: "#E5A055",
          active: "#CC8F44",
        },
        accent: {
          DEFAULT: "#A35139",
          hover: "#8B4530",
          active: "#733927",
        },
        surface: "#EEE9DF",
        border: "#C9C1B1",
        focus: "#1B2632",
        gray: {
          50: "#EEE9DF",
          100: "#C9C1B1",
          200: "#A8A092",
          300: "#878073",
          400: "#665F54",
          500: "#554E45",
          600: "#443E36",
          700: "#332E28",
          800: "#2C3B4D",
          900: "#1B2632",
        },
        success: "#10B981",
        info: "#3B82F6",
        warning: "#FFB162",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        1: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
        2: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        3: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        4: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        0: "0px",
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
