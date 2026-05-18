/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Action - Dark teal/blue
        primary: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          active: '#115E59',
        },
        // Surface - Light off-white/beige
        surface: '#FAFAF9',
        // Border - Light grey
        border: '#E5E7EB',
        // Focus Ring - Slightly darker teal/blue
        focus: '#0F766E',
        // Grays
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Alert colors
        success: '#10B981',
        info: '#3B82F6',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        '1': '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        '2': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '3': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '4': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        '0': '0px',
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        'full': '24px',
      },
    },
  },
  plugins: [],
}
