require("dotenv").config();

const { createStrapi } = require("@strapi/strapi");

const strapi = createStrapi({
  distDir: "dist",
});

strapi.start();
