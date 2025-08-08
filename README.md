# Padelix Indonesia Website

A fullstack web application for Padelix Indonesia, featuring a Next.js frontend and a Strapi CMS backend.  
The project supports Business-to-Business (B2B), Business-to-Consumer (B2C), and (planned) advertising features.

> **Note:** This project was commissioned by Padelix Indonesia and was fully designed, developed, and deployed by me, Wistara Banyu Kayana.  
> It is featured in my professional portfolio as a demonstration of my fullstack web development capabilities.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [About the Developer](#about-the-developer)
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

## About the Developer

This website was fully designed, developed, and deployed by me, **Wistara Banyu Kayana**.  
It is a commissioned project for Padelix Indonesia and is featured in my professional portfolio as a demonstration of my fullstack web development capabilities.

---

## Project Structure

```
/
├── client/     # Next.js frontend (Node.js app, standalone build)
├── server/     # Strapi CMS backend (Node.js app)
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
git clone https://github.com/wistarabanyukayana/padelix-indonesia-website
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
See `client/.env.example` and `server/.env.example` for required variables.

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

See the individual app READMEs for deployment instructions.

---

## Contributing

- Use the default code style (double quotes for strings).
- Commit messages should be simple and concise (e.g., "Added X", "Edited Y").
- No issue tracker; contact the maintainer for support.

---

## Contact

Maintainer & Developer: **Wistara Banyu Kayana**  
Email: wisthara.banyu.kayana@gmail.com

This project is part of my professional portfolio. For inquiries or references, feel free to reach out.

---

## License

This project is proprietary, delivered to Padelix Indonesia, and not open source.

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

Changelog is not maintained
