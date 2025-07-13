// config/plugins.ts

export default ({ env }: any) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "mail.padelix.co.id"),
        port: env.int("SMTP_PORT", 465),
        secure: env.bool("SMTP_SECURE", true),
        auth: {
          user: env("SMTP_USER"),
          pass: env("SMTP_PASS"),
        },
      },
      settings: {
        defaultFrom: "noreply@padelix.co.id",
        defaultReplyTo: "noreply@padelix.co.id",
      },
    },
  },
});
