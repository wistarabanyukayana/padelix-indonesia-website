// config/plugins.ts

export default ({ env }: any) => ({
  "mux-video-uploader": {
    enabled: true,
    config: {
      accessTokenId: env('ACCESS_TOKEN_ID'),
      secretKey: env('ACCESS_TOKEN_SECRET'),
      webhookSigningSecret: env('WEBHOOK_SIGNING_SECRET'),
      playbackSigningId: env('SIGNING_KEY_ID'),
      playbackSigningSecret: env('SIGNING_KEY_PRIVATE_KEY'),
    }
  },
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
