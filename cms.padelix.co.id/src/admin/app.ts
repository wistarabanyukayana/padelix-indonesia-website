import type { StrapiApp } from "@strapi/strapi/admin";

import favicon from "./extensions/favicon.ico";
import AuthLogo from "./extensions/padelix-rounded.png";
import MenuLogo from "./extensions/padelix-rounded.png";

export default {
  config: {
    head: {
      favicon: favicon,
    },
    auth: {
      logo: AuthLogo,
    },
    menu: {
      logo: MenuLogo,
    },
    locales: ["en", "id"],
    translations: {
      en: {
        "Auth.form.welcome.title": "Welcome to CMS Padelix!",
        "Auth.form.welcome.subtitle": "Log in to your account",
      },
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
