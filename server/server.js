require("dotenv").config();

const { createStrapi } = require("@strapi/strapi");

const strapi = createStrapi({
  distDir: "prod",
});

strapi.start();
