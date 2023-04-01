const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
      },
    },
  },
  safelist: [
    {
      pattern:
        /bg-(red|orange|amber|emerald|teal|sky|blue|indigo|violet|purple|fuchsia|rose)-300/,
    },
    {
      pattern:
        /(from|via|to)-(red|orange|amber|emerald|teal|sky|blue|indigo|violet|purple|fuchsia|rose)-(200|300)/,
    },
  ],
  plugins: [require("@tailwindcss/forms")],
};
