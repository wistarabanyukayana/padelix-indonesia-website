# Padelix.co.id Monorepo

A fullstack web application for Padelix Indonesia, featuring a Next.js frontend and a Strapi CMS backend.  
The project supports Business-to-Business (B2B), Business-to-Consumer (B2C), and (planned) advertising features.

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

## Tech Stack

- **Frontend:** Next.js (Node.js app, standalone build), React, TypeScript
- **Backend:** Strapi CMS (Node.js, TypeScript, SMTP for email as noreply@padelix.co.id)
- **Database:** MariaDB (production on Rumahweb shared hosting, local via db-dump)
- **Deployment:** cPanel (Node.js app for both frontend and backend)
- **Other:** Google Analytics, Google Meta, Google Ads (planned), direct image hosting on shared hosting

---

## Prerequisites

- **Node.js v20+ (even-numbered LTS releases only, e.g., 20, 22, 24, …)**
- **npm v9+** (comes with Node 20+)
- Access to a MariaDB database (request latest db-dump for local development)

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-org/padelix.co.id.git
cd padelix.co.id
```

### Install dependencies

```bash
# For frontend
cd padelix.co.id
npm install

# For backend (Strapi)
cd ../cms.padelix.co.id
npm install
```

### Environment Variables

Each app requires its own environment variables.  
See `padelix.co.id/.env.example` and `cms.padelix.co.id/.env.example` for required variables.

### Database Setup (Backend)

- Request the latest MariaDB db-dump from the maintainer.
- Import the db-dump into your local MariaDB instance.
- Update your `.env` file with your local database credentials.

---

## Scripts

Each app has its own scripts:

- `npm run dev` — Start in development mode
- `npm run build` — Build for production

---

## Deployment

### Frontend (Next.js)

1. Build the app using `npm run build` (standalone output).
2. Upload the contents of the `.next/standalone` directory to your cPanel Node.js app directory.
3. Ensure your environment variables are set in cPanel.
4. Start the Node.js app from cPanel.

### Backend (Strapi)

1. Build the admin panel using `npm run build`.
2. Upload the project to your cPanel Node.js app directory.
3. Ensure your environment variables are set in cPanel.
4. Start the Node.js app from cPanel.

---

## Contributing

- Use the default code style (double quotes for strings).
- Commit messages should be simple and concise (e.g., "Added X", "Edited Y").
- No issue tracker; contact the maintainer for support.

---

## Contact

Maintainer: wisthara.banyu.kayana@gmail.com

---

## License

This project is proprietary and not open source.

---

## Testing

Testing is planned for the future.

---

## Accessibility & Internationalization

Not implemented yet, but planned for the future.

---

## Known Issues & Troubleshooting

- **Strapi CMS on cPanel:**  
  Use Node.js version below 20 for `npm install` if you encounter memory issues, but run Strapi with Node.js 20+ (Strapi 5 requires Node 20+).
- **Next.js on cPanel:**  
  Use the standalone build to avoid process overload.

---

## Changelog

Changelog is not maintained yet.

---

## 2. Backend README (`cms.padelix.co.id/README.md`)

```markdown:cms.padelix.co.id/README.md
# Padelix.co.id CMS (Strapi)

Backend CMS for Padelix Indonesia, built with Strapi and using MariaDB as the database.

---

## About

This Strapi CMS manages content for the Padelix.co.id website.  
It uses MariaDB (production on Rumahweb, local via db-dump) and is configured to send emails as `noreply@padelix.co.id` via SMTP.

---

## Tech Stack

- **Strapi CMS** (Node.js, TypeScript)
- **Database:** MariaDB
- **Email:** SMTP (noreply@padelix.co.id)

---

## Prerequisites

- **Node.js v20+ (even-numbered LTS releases only)**
- **npm v9+**
- Access to a MariaDB database (request latest db-dump for local development)

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your database, Strapi, and SMTP credentials.

- SMTP is configured for sending emails as `noreply@padelix.co.id`.

```bash
cp .env.example .env
```

### Database Setup

- Request the latest MariaDB db-dump from the maintainer.
- Import the db-dump into your local MariaDB instance.
- Update your `.env` file with your local database credentials.

### Run Strapi in development mode

```bash
npm run develop
```

Strapi will start at [http://localhost:1337](http://localhost:1337) by default.

---

## Available Scripts

- `npm run develop` — Start Strapi in development mode
- `npm run build` — Build the Strapi admin panel
- `npm run start` — Start Strapi in production mode

---

## Deployment

1. Build the admin panel using `npm run build`.
2. Upload the project to your cPanel Node.js app directory.
3. Ensure your environment variables are set in cPanel.
4. Start the Node.js app from cPanel.

---

## Content Types & API

Content types are defined in `src/api/`.  
API endpoints are auto-generated by Strapi based on content types.

### Example Content Types (from codebase):

- **contact-signup**: `/api/contact-signups`
- **global**: `/api/globals`
- **home-page**: `/api/home-pages`
- **product**: `/api/products`

> For more details, see the files in `src/api/`.

---

## Troubleshooting

- **Strapi CMS on cPanel:**  
  Use Node.js version below 20 for `npm install` if you encounter memory issues, but run Strapi with Node.js 20+ (Strapi 5 requires Node 20+).

---

## License

This project is proprietary and not open source.

---
```

---

## 3. Frontend README (`padelix.co.id/README.md`)

```markdown:padelix.co.id/README.md
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
```

---

## 4. Backend `.env.example` (`cms.padelix.co.id/.env.example`)

```env
# Database configuration
DATABASE_CLIENT=mariadb
DATABASE_HOST=your-mariadb-host
DATABASE_PORT=3306
DATABASE_NAME=your-db-name
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password

# Strapi secrets
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# SMTP configuration for sending emails as noreply@padelix.co.id
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=noreply@padelix.co.id
SMTP_PASS=your-smtp-password
```

---

## 5. Frontend `.env.example` (`padelix.co.id/.env.example`)

```env
# API URL for the backend Strapi CMS
NEXT_PUBLIC_API_URL=https://cms.padelix.co.id/api
```

---

## 6. LICENSE (proprietary)

```text:LICENSE
Copyright (c) [Year] Padelix Indonesia

All rights reserved. This software and its source code are proprietary and confidential.
Unauthorized copying, distribution, or use of this code, via any medium, is strictly prohibited.
No open source license is granted.

For inquiries, contact: wisthara.banyu.kayana@gmail.com
```

---

**You can now copy these files directly into your project. If you need further adjustments or want to add more details, just let me know!**
