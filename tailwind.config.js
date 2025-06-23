/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
        strong:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [],
  // Safelist dynamic classes that might be purged
  safelist: [
    // Color variations for StatCard
    "bg-teal-50",
    "bg-teal-100",
    "bg-teal-500",
    "text-teal-600",
    "border-teal-200",
    "bg-emerald-50",
    "bg-emerald-100",
    "bg-emerald-500",
    "text-emerald-600",
    "border-emerald-200",
    "bg-purple-50",
    "bg-purple-100",
    "bg-purple-500",
    "text-purple-600",
    "border-purple-200",
    "bg-indigo-50",
    "bg-indigo-100",
    "bg-indigo-500",
    "text-indigo-600",
    "border-indigo-200",
    "bg-amber-50",
    "bg-amber-100",
    "bg-amber-500",
    "text-amber-600",
    "border-amber-200",
    "bg-rose-50",
    "bg-rose-100",
    "bg-rose-500",
    "text-rose-600",
    "border-rose-200",
    // Animation classes
    "animate-pulse",
    "animate-spin",
    "animate-fade-in",
    "animate-slide-up",
    "animate-slide-down",
    // Responsive classes
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "xl:grid-cols-5",
  ],
};
