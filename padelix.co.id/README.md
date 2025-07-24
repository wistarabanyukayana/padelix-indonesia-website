# Padelix.co.id Frontend (Next.js)

Frontend for Padelix Indonesia, built with Next.js and deployed as a Node.js app on cPanel.

---

## About

This is the main website for Padelix Indonesia, supporting B2B and B2C information.  
Ads and additional features are planned for the future.

---

## Tech Stack

- **Next.js** (Node.js app, standalone build)
- **React, TypeScript**

---

## Prerequisites

- **Node.js v20+ (even-numbered LTS releases only)**
- **npm v9+**

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your required variables.

- Only the API URL is required for the frontend.

```bash
cp .env.example .env
```

---

## Available Scripts

- `npm run dev` — Start in development mode
- `npm run build` — Build for production

---

## Deployment

1. Build the app using `npm run build` (standalone output).
2. Upload the contents of the `.next/standalone` directory to your cPanel Node.js app directory.
3. Ensure your environment variables are set in cPanel.
4. Start the Node.js app from cPanel.

---

## Troubleshooting

- **Next.js on cPanel:**  
  Use the standalone build to avoid process overload.

---

## License

This project is proprietary and not open source.

---
