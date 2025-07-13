async function main() {
  const { createStrapi, compileStrapi } = require("@strapi/strapi");

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).start();

  app.log.level = "error";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
