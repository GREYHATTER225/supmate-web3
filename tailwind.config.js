const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    maxWidth: {
      "7xl": "90rem",
    },
    extend: {
      fontFamily: {
        sans: ["Circular", "Helvetica", "Arial", "sans-serif"],
      },
      // Fine-grained opacity steps used by the Supmate design system's
      // translucent surfaces (e.g. bg-white/4, bg-white/6). Tailwind's default
      // scale only ships 5% increments, so register the in-between values.
      opacity: {
        2: "0.02",
        4: "0.04",
        6: "0.06",
        8: "0.08",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
});
