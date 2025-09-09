/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInOut: {
          '0%, 100%': { opacity: '0.2' },
          '10%, 90%': { opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        fadeInOut: 'fadeInOut 6s ease-in-out infinite',
      },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    fadeOut: {
      '0%': { opacity: '1', transform: 'scale(1)' },
      '100%': { opacity: '0', transform: 'scale(0.95)' },
    },
  },
  animation: {
    fadeIn: 'fadeIn 0.3s ease-out forwards',
    fadeOut: 'fadeOut 0.2s ease-out forwards',
  },
      keyframes: {
        fromTop: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fromLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fromRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fromBottom: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        rotateIn: {
          "0%": { transform: "rotate(-10deg)", opacity: "0" },
          "100%": { transform: "rotate(0deg)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounceY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10%)" },
        },
      },
      animation: {
        fromTop: "fromTop 1s ease-out forwards",
        fromLeft: "fromLeft 1s ease-out forwards",
        fromRight: "fromRight 1s ease-out forwards",
        fromBottom: "fromBottom 1s ease-out forwards",
        scaleUp: "scaleUp 0.5s ease-out forwards",
        rotateIn: "rotateIn 0.7s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-in forwards",
        pulseSlow: "pulseSlow 3s ease-in-out infinite",
        bounceY: "bounceY 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
