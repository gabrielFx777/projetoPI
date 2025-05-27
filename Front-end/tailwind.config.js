export default { content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"] };

// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 6s linear infinite",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
        "slide-in": "slideIn 1.2s ease-out forwards",
        "plane-takeoff": "planeTakeoff 3s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.7" },
        },
        slideIn: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        planeTakeoff: {
          "0%": { transform: "translate(-50%, 0)" },
          "50%": { transform: "translate(-50%, -12px) rotate(-6deg)" },
          "100%": { transform: "translate(-50%, 0)" },
        },
      },
    },
  },
  plugins: [],
};
