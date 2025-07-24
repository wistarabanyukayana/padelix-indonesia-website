# Padelix.co.id Monorepo

A fullstack web application for Padelix Indonesia, featuring a Next.js frontend and a Strapi CMS backend.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)
- [Testing](#testing)
- [Accessibility & Internationalization](#accessibility--internationalization)
- [Known Issues & Troubleshooting](#known-issues--troubleshooting)
- [Changelog](#changelog)

---

## Project Purpose

This project aims to create a website for Padelix Indonesia that supports:
- **B2B (Business-to-Business):** Information and features for partners and business clients.
- **B2C (Business-to-Consumer):** Information and engagement for end customers.
- **Ads:** (Planned) Advertising space and promotional features.

---

## Project Structure

```
/
├── padelix.co.id/         # Next.js frontend (Node.js app, standalone build)
├── cms.padelix.co.id/     # Strapi CMS backend (Node.js app)
```

---

## 2. Frontend README.md (at `padelix.co.id/README.md`)

```markdown
# Padelix.co.id Frontend (Next.js)

Frontend for Padelix Indonesia, built with Next.js and deployed as a Node.js app on cPanel.

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

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

---

## Environment Variables

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
```

---

## 3. Backend README.md (at `cms.padelix.co.id/README.md`)

```markdown
# Padelix.co.id CMS (Strapi)

Backend CMS for Padelix Indonesia, built with Strapi and using MariaDB as the database.

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Prerequisites](