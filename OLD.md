# Padelix Indonesia Website

A fullstack web application for Padelix Indonesia, featuring a Next.js frontend and a Strapi CMS backend. The project supports Business-to-Business (B2B), Business-to-Consumer (B2C), and planned advertising features.

> **Note:** This project was commissioned by Padelix Indonesia and was fully designed, developed, and deployed by Wistara Banyu Kayana. It is featured in my professional portfolio.

---

## Production Status

-   **Live:** [https://padelix.co.id](https://padelix.co.id)
-   **Backend:** [https://cms.padelix.co.id](https://cms.padelix.co.id)
-   **Current Version:** 1.2.0

---

## Table of Contents

-   [Project Purpose](#project-purpose)
-   [About the Developer](#about-the-developer)
-   [Project Structure](#project-structure)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Scripts](#scripts)
-   [Deployment](#deployment)
    *   [Recommended Deployment Strategies (Future)](#recommended-deployment-strategies-future)
    *   [Current Production Deployment (on cPanel)](#current-production-deployment-on-cPanel)
-   [Git & Version Control](#git--version-control)
-   [Contributing](#contributing)
-   [Contact](#contact)
-   [License](#license)
-   [Testing](#testing)
-   [Accessibility & Internationalization](#accessibility--internationalization)
-   [Known Issues & Troubleshooting](#known-issues--troubleshooting)
-   [Changelog](#changelog)

---

## Project Purpose

This project aims to create a website for Padelix Indonesia that supports:

-   **B2B (Business-to-Business):** Information and features for partners and business clients.
-   **B2C (Business-to-Consumer):** Information and engagement for end customers.
-   **Ads:** (Planned) Advertising space and promotional features.

---

## About the Developer

This website was fully designed, developed, and deployed by **Wistara Banyu Kayana**.
It is a commissioned project for Padelix Indonesia and is featured in my professional portfolio as a demonstration of my fullstack web development capabilities.

---

## Project Structure

```
/
├── client/     # Next.js 15 (App Router) Frontend
├── server/     # Strapi 5 CMS Backend
└── README.md   # This file
```

---

## Tech Stack

-   **Frontend:** Next.js (Node.js app, standalone build), React, TypeScript, Tailwind CSS
-   **Backend:** Strapi CMS (Node.js, TypeScript, SMTP for email as noreply@padelix.co.id)
-   **Database:** MariaDB (production on Rumahweb shared hosting, local via db-dump)
-   **Deployment:** Currently on cPanel; see specific sections below for details and recommendations.
-   **Other:** Google Analytics, Google Meta, Google Ads (planned), direct image hosting on shared hosting

---

## Prerequisites

-   **Node.js v20+** (even-numbered LTS releases only, e.g., 20, 22, 24, …)
-   **npm v9+** (comes with Node 20+)
-   **Database:**
    *   For local development, the repository is configured to use SQLite out-of-the-box.
    *   To connect to a production-like database, request a MariaDB database dump from the project maintainer.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/wistarabanyukayana/padelix-indonesia-website.git
cd padelix-indonesia-website
```

### 2. Install Dependencies

This will install dependencies for both the `client` and `server` concurrently using npm workspaces.

```bash
npm install --workspaces
```
*If you prefer to install separately:*
```bash
# For frontend
npm install --prefix client

# For backend
npm install --prefix server
```

### 3. Set Up Environment Variables

Copy the `.env.example` files to `.env` in both the `client` and `server` directories and fill in the required values.

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```
-   The `server/.env` will use SQLite by default. To use MariaDB, update the database variables accordingly.

### 4. Run the Applications

```bash
# Run both client and server in development mode
npm run dev --workspaces

# Or run them separately
npm run dev --prefix client
npm run develop --prefix server
```

-   **Client:** `http://localhost:3000`
-   **Server:** `http://localhost:1337/admin`

---

## Scripts

Each app has its own scripts, which can be run with `npm run <script-name> --prefix <app-name>` or globally if using `npm run <script-name> --workspaces` (if the script name is defined in the root `package.json`).

*   **Client (`client/package.json`):**
    *   `dev`: Start in development mode with Turbopack.
    *   `build`: Build for production.
    *   `start`: Start the Next.js production server.
    *   `lint`: Run ESLint.
*   **Server (`server/package.json`):**
    *   `develop`: Start Strapi in development mode.
    *   `build`: Build the Strapi admin panel.
    *   `start`: Start Strapi in production mode.
    *   `strapi`: Execute Strapi CLI commands.
    *   `console`: Open the Strapi interactive console.

---

## Deployment

**This project currently targets a shared hosting environment with specific resource limitations (e.g., 2GB RAM, 100% CPU limit, 40-process limit). Please read the following carefully.**

### Recommended Deployment Strategies (Future)

For optimal performance, stability, and scalability, it is **strongly recommended** to decouple the frontend and backend hosting. This approach significantly mitigates the risks associated with resource-constrained shared hosting.

1.  **Backend (Strapi CMS):**
    *   **Recommendation:** Deploy Strapi to a dedicated backend hosting service or a Virtual Private Server (VPS). These platforms are designed to run Node.js applications efficiently and provide isolated resources.
    *   **Examples:** [Render](https://render.com/), [Heroku](https://www.heroku.com/), DigitalOcean, Linode.
    *   **Benefits:** Enhanced performance, increased stability, better scalability, and fewer resource constraints.

2.  **Frontend (Next.js Application):**
    *   **Recommendation:** Deploy the Next.js application to a dedicated frontend hosting platform.
    *   **Examples:** [Vercel](https://vercel.com/) (created by the Next.js team), [Netlify](https://www.netlify.com/).
    *   **Benefits:** Seamless Next.js integration, automatic builds and deployments, global Content Delivery Network (CDN) for fast loading times, and often a generous free tier for smaller projects.

### Current Production Deployment (on cPanel)

The project is currently configured to deploy both the Next.js frontend and the Strapi backend as separate Node.js applications on cPanel. This section outlines the process, along with important considerations and refinements based on our analysis.

**Important Considerations for Shared Hosting (cPanel):**

*   **Resource Limitations:** Your shared hosting plan has strict limits on memory (2GB), CPU (100% total), and number of processes (40 total, 20 entry). Running two Node.js applications (Next.js and Strapi) concurrently on these resources is **high-risk**. You may experience frequent performance issues, memory errors, and potential application downtime.
*   **Next.js Output:** The Next.js client uses `output: "standalone"`. This builds a self-contained Next.js server that includes `node_modules` and handles its own serving.
*   **Strapi Resource Use:** Strapi can be memory-intensive, especially during startup, build processes, and under moderate traffic.
*   **`npm install` Memory Issues:** As noted previously, you may encounter memory issues during `npm install` on cPanel. Using a Node.js version below 20 for `npm install` (if supported by Strapi/Next.js) and then running the app with Node.js 20+ might be a workaround.

**Deployment Steps for cPanel:**

1.  **Build Both Applications:**
    ```bash
    npm run build --prefix client
    npm run build --prefix server
    ```
    *   For the Next.js client, this will create a `.next/standalone` directory.
    *   For the Strapi server, this will build the admin panel and compile necessary files.

2.  **Upload to cPanel:**
    *   **Frontend (Next.js):** Upload the contents of the `client/.next/standalone` directory to your designated cPanel Node.js application directory for the frontend.
    *   **Backend (Strapi):** Upload the entire `server` project directory (excluding `node_modules`, `dist`, `.tmp` if they exist locally after build) to your designated cPanel Node.js application directory for the backend. Ensure `.tmp` is ignored (it's now in `server/.gitignore`).

3.  **Install Dependencies on cPanel (for Strapi):**
    *   Navigate to your Strapi app directory in cPanel's terminal or file manager.
    *   Run `npm install`. *Be mindful of memory limits during this step.*

4.  **Set Environment Variables:**
    *   Ensure all required environment variables (`NEXT_PUBLIC_STRAPI_URL` for client, `DATABASE_*`, `APP_KEYS`, `ADMIN_JWT_SECRET`, `SMTP_*`, `CORS_ORIGINS` for server) are properly configured within your cPanel Node.js application settings for both the frontend and backend.

5.  **Configure Content Security Policy (CSP):**
    *   The CSP headers (e.g., `media-src 'self' *.mux.com blob:`) that were previously defined in `client/next.config.ts` must now be configured at the web server level in cPanel. This is typically done in a `.htaccess` file for Apache servers or equivalent configuration for Nginx, located in the root of your domain or the relevant application directory.

6.  **Start Node.js Applications:**
    *   From your cPanel Node.js application manager, start both the frontend (using `npm start` in its directory) and backend (using `npm start` in its directory) applications.

---

## Git & Version Control

### .gitignore

This project has been updated to include a root `.gitignore` file, ignoring common operating system files, IDE-specific files, build artifacts, and sensitive environment variables.

The `server/.gitignore` has also been refined to explicitly ignore the `.tmp/` directory, which is used by Strapi for temporary database files (e.g., SQLite in development).

### Commits

Follow conventional commit guidelines where possible. Commit messages should be simple, concise, and focused on the *what* and *why* of the change.

*   **Examples:**
    *   `feat: Add user login functionality`
    *   `fix: Correct sales tax calculation in checkout`
    *   `docs: Update deployment instructions in README`
    *   `refactor: Improve image loading in carousel`

---

## Contributing

-   Use the default code style (double quotes for strings).
-   No issue tracker; contact the maintainer for support.

---

## Contact

-   **Maintainer & Developer:** Wistara Banyu Kayana
-   **Email:** wisthara.banyu.kayana@gmail.com

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

-   **Strapi CMS on cPanel:** As noted in the deployment section, resource constraints are a major concern.
-   **Next.js on cPanel:** The standalone build can be heavy. Consider static export if performance is critical and server-side features are not strictly needed.
-   **Content Security Policy (CSP) Errors:** If you encounter CSP errors, ensure that all necessary domains (e.g., `*.mux.com`) are correctly whitelisted in your web server's configuration (e.g., `.htaccess` file) as per the Deployment section.

---

## Changelog

### v1.2.0 - 2026-01-07

*   **Fix:** Addressed critical to low-severity CVEs, improved crash handling, and improve security overall.
*   **Feat:** Added support for video and audio in the portfolio section.
*   **Feat:** Added image zoom functionality to the portfolio and enhanced security measures.
*   **Docs:** Comprehensive update and refinement of all `README.md` files (root, client, server) with detailed project analysis, deployment strategies (including cPanel and recommended alternatives), and environment variable guidance.
*   **Feat:** Introduced a root `.gitignore` file for improved version control.
*   **Fix:** Updated `server/.gitignore` to explicitly ignore the `.tmp/` directory.
*   **Fix:** Addressed Largest Contentful Paint (LCP) warning by adding `priority` prop to the first image in `PortofolioContentCarousel`.
*   **Fix:** Updated Content Security Policy in `client/next.config.ts` to allow `*.mux.com` and `blob:` for Mux video streaming.
*   **Docs:** Added `Mux Webhooks (Local Development)` section to `server/README.md` for local Mux integration setup using SMEE.
*   **Refactor:** Streamlined `Getting Started` instructions across all `README.md` files to leverage `npm workspaces`.
*   **Config:** Updated `server/README.md` and `server/.env.example` to prefer MariaDB/MySQL for local development database setup, matching production.

### v1.1.0 - 2026-01-07

*   **Feat:** Added a floating WhatsApp button.
*   **Feat:** Modified CMS Admin for production readiness.
*   **Feat:** Resolved Public Role data fetching issues, enabling successful data reception for media objects.
*   **Docs:** Updated README.md and package.json.
*   **Chore:** Updated .vscode configuration.
*   **Chore:** Updated .gitignore and uploaded initial images.
*   **Refactor:** Renamed folders and adjusted files for improved structure.

### v1.0.0 - Initial Release

*   Initial fullstack web application deployment.
*   Next.js frontend with Strapi CMS backend.
*   Support for B2B, B2C, and planned advertising features.