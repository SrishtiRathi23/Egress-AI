// Tailwind CSS v4 is driven entirely through its PostCSS plugin -- no tailwind.config
// file is required; design tokens live in src/app/globals.css.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
