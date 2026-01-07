# Padelix.co.id Frontend (Next.js)

This is the Next.js frontend application for Padelix Indonesia, designed to work with the Strapi CMS backend.

---

## Table of Contents

-   [About](#about)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Available Scripts](#available-scripts)
-   [Deployment](#deployment)
    *   [Recommended Deployment Strategies (Future)](#recommended-deployment-strategies-future)
    *   [Current Production Deployment (on cPanel)](#current-production-deployment-on-cPanel)
-   [Troubleshooting](#troubleshooting)
-   [License](#license)
-   [Changelog](#changelog)

---

## About

This is the main website for Padelix Indonesia, supporting B2B and B2C information.
Ads and additional features are planned for the future.

---

## Tech Stack

-   **Framework:** Next.js 14 (App Router)
-   **Language:** React, TypeScript
-   **Styling:** Tailwind CSS
-   **Video Playback:** `hls.js` for Mux HLS streaming

---

## Prerequisites

-   **Node.js v20+** (even-numbered LTS releases only)
-   **npm v9+**

---

## Getting Started

### Install dependencies

```bash
npm install
```

---

## Environment Variables

The frontend primarily requires the `NEXT_PUBLIC_STRAPI_URL` environment variable to connect to the Strapi backend.

*   Copy `.env.example` to `.env` in the `client` directory.
*   Set the value of `NEXT_PUBLIC_STRAPI_URL`.

```bash
cp .env.example client/.env
```

**Example Values:**
*   **Local Development:** `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`
*   **Production (Split Deployment):** `NEXT_PUBLIC_STRAPI_URL=https://cms.padelix.co.id`
*   **Production (Shared Hosting - Static Export):** If using a static export on shared hosting, `NEXT_PUBLIC_STRAPI_URL` should point directly to your Strapi backend's domain (e.g., `https://cms.padelix.co.id`). Ensure CORS is properly configured on the Strapi backend to allow requests from the frontend's domain.

---

## Available Scripts

In the `client` directory, you can run:

*   `npm run dev`: Starts the application in development mode with Turbopack. Accessible at `http://localhost:3000`.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the Next.js production server after building.
*   `npm run lint`: Runs ESLint for code quality checks.

---

## Deployment

### Recommended Deployment Strategies (Future)

For optimal performance, stability, and scalability, it is **strongly recommended** to deploy the Next.js application to a dedicated frontend hosting platform.

*   **Examples:** [Vercel](https://vercel.com/) (created by the Next.js team), [Netlify](https://www.netlify.com/).
*   **Benefits:** These platforms offer seamless Next.js integration, automatic builds and deployments, global Content Delivery Network (CDN) for fast loading times, and often a generous free tier for smaller projects.
*   **Configuration:** When deploying, ensure `NEXT_PUBLIC_STRAPI_URL` is set to your live Strapi backend URL in the platform's environment settings.

### Current Production Deployment (on cPanel)

The project is currently configured for a `standalone` output, intended to run as a Node.js application on cPanel.

**Important Considerations:**

*   **Resource Usage:** Running a Next.js `standalone` application can be resource-intensive. On shared hosting, this may lead to performance issues, slower response times, and potential application restarts if resource limits are frequently exceeded.
*   **Content Security Policy (CSP):** The CSP headers (e.g., `media-src 'self' *.mux.com blob:`) are not configured via `next.config.ts` when deployed on cPanel. These must be configured at the web server level (e.g., in a `.htaccess` file for Apache) to properly secure your application and allow necessary resources.

**Deployment Steps for cPanel:**

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This will create a `.next/standalone` directory containing a self-contained Next.js server.

2.  **Upload to cPanel:**
    *   Upload the entire contents of the `client/.next/standalone` directory to your designated cPanel Node.js application directory.

3.  **Set Environment Variables:**
    *   Ensure `NEXT_PUBLIC_STRAPI_URL` is correctly configured within your cPanel Node.js application settings, pointing to your Strapi backend (e.g., `https://cms.padelix.co.id`).

4.  **Configure CSP on Web Server:**
    *   Implement the necessary Content Security Policy directives in your web server's configuration (e.g., in `.htaccess` for Apache). This is crucial for security and to allow resources like Mux videos to load.

5.  **Start the Node.js App:**
    *   From your cPanel Node.js application manager, start the application. It will automatically run the `npm start` command.

---

## Troubleshooting

-   **Next.js on cPanel:**
    *   The `standalone` build is designed to avoid process overload compared to traditional `next start`, but resource limits on shared hosting can still cause issues. Monitor performance and consider the "Static Export" option if problems persist.
-   **Content Security Policy (CSP) Errors:** If you encounter errors related to blocked content (e.g., Mux videos), double-check your web server's CSP configuration (e.g., `.htaccess` file) to ensure all necessary domains are whitelisted.

---

## License

This project is proprietary and not open source.

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

*   Initial Next.js frontend application.
*   Includes core pages, components, and data fetching logic.
