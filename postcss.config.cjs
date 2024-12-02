const dir = __dirname;

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    require("tailwindcss")(dir + "/tailwind.config.js"),
    require("autoprefixer")({
      path: [dir],
    }),
  ],
};

module.exports = config;
