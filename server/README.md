# Padelix.co.id CMS (Strapi)

This is the Strapi Content Management System (CMS) backend for the Padelix Indonesia website. It provides all the necessary content and media management for the frontend application.

---

## Table of Contents

-   [About](#about)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Database Setup](#database-setup)
-   [Available Scripts](#available-scripts)
-   [Mux Webhooks (Local Development)](#mux-webhooks-local-development)
-   [Deployment](#deployment)
    *   [Recommended Approach (Dedicated Backend Hosting)](#recommended-approach-dedicated-backend-hosting)
    *   [Deployment on cPanel (with Caution)](#deployment-on-cpanel-with-caution)
-   [Content Types & API](#content-types--api)
-   [Troubleshooting](#troubleshooting)
-   [License](#license)
-   [Changelog](#changelog)

---

## About

This Strapi CMS manages content for the Padelix.co.id website.
It uses MariaDB (production on Rumahweb, local via db-dump) and is configured to send emails as `noreply@padelix.co.id` via SMTP.

---

## Tech Stack

-   **CMS:** Strapi 5 (TypeScript)
-   **Database:** MariaDB/MySQL (Production & Local Development)
-   **Email:** SMTP (configured for `noreply@padelix.co.id` using Nodemailer provider)
-   **Plugins:** `@strapi/plugin-users-permissions`, `strapi-plugin-mux-video-uploader`

---

## Prerequisites

-   **Node.js v20+** (even-numbered LTS releases only)
-   **npm v9+**
-   Access to a MariaDB/MySQL database (for local development and production)

---

## Getting Started

### Install dependencies

```bash
npm install
```

---

## Environment Variables

The Strapi backend relies heavily on environment variables for its configuration. Copy `server/.env.example` to `server/.env` and fill in the required values.

```bash
cp .env.example .env
```

Here's a breakdown of essential variables:

*   **Database Configuration (MariaDB/MySQL is preferred for local & production):**
    *   `DATABASE_CLIENT`: Set to `mysql` for both local development and production.
    *   `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`: These credentials are for connecting to your MariaDB/MySQL instance.
    *   `DATABASE_FILENAME`: (Only for SQLite) Path for SQLite database (e.g., `.tmp/data.db`). Only set if `DATABASE_CLIENT` is `sqlite`.

*   **Application Keys:**
    *   `APP_KEYS`: An array of strong, comma-separated secret keys for security. Generate new ones for production.

*   **Admin Panel:**
    *   `ADMIN_JWT_SECRET`: Secret for the Strapi admin panel.
    *   `ADMIN_EMAIL`, `ADMIN_PASSWORD`: For initial admin user creation (if not using an existing database).

*   **Email (SMTP) Configuration:**
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_NOREPLY_EMAIL`: For sending emails (e.g., password resets, contact form submissions).

*   **CORS (Cross-Origin Resource Sharing):**
    *   `CORS_ORIGINS`: A comma-separated list of allowed origins (your frontend URLs) that can make requests to this Strapi instance. For a split deployment, include your frontend's production URL (e.g., `https://padelix.co.id`).

---

## Database Setup

*   **Local Development (MariaDB/MySQL):**
    *   **Install MariaDB/MySQL:** Ensure you have a local MariaDB or MySQL server running.
    *   **Create Database:** Create a new database for Strapi (e.g., `strapi_dev`).
    *   **Configure `.env`:** Ensure your `server/.env` file is configured with the correct MariaDB/MySQL credentials (`DATABASE_CLIENT=mysql`, `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`).
    *   **Import Data:** If you need pre-populated data, request the latest MariaDB/MySQL database dump from the maintainer and import it into your local instance.
*   **Production (MariaDB/MySQL):**
    *   Ensure your `.env` file is configured with the correct MariaDB/MySQL credentials.
    *   You will typically import a database dump (`.sql` file) into your production MariaDB/MySQL instance to populate it with content.

---

## Available Scripts

In the `server` directory, you can run:

*   `npm run develop`: Starts Strapi in development mode with live reloading. Accessible at `http://localhost:1337/admin`.
*   `npm run build`: Builds the Strapi admin panel for production.
*   `npm run start`: Starts Strapi in production mode.
*   `npm run console`: Opens the Strapi interactive console.
*   `npm run strapi`: Executes Strapi CLI commands.

---

## Mux Webhooks (Local Development)

When working with the `strapi-plugin-mux-video-uploader` in a local development environment, Mux needs to be able to send webhook events to your local Strapi instance. Since Mux cannot directly reach your local server, you need to set up a webhook relay service.

**Recommended Tool: SMEE.io**

1.  **Create a SMEE Channel:** Go to [smee.io](https://smee.io/) and click "Start a new channel". Copy the unique URL provided (e.g., `https://smee.io/your-unique-channel`).

2.  **Install SMEE Client:** Install the SMEE client globally on your machine:
    ```bash
    npm install -g smee-client
    ```

3.  **Run SMEE Client:** In a separate terminal, run the SMEE client to forward webhook events to your local Strapi. Make sure Strapi is running on `http://localhost:1337`.
    ```bash
    smee --url https://smee.io/your-unique-channel --path /mux-video-uploader/webhook-handler --port 1337
    ```
    *   Replace `https://smee.io/your-unique-channel` with the URL you copied from smee.io.
    *   The `--path /mux-video-uploader/webhook-handler` is the default webhook endpoint for the Mux plugin in Strapi.

4.  **Configure Mux Webhook:** In your Mux dashboard, configure the webhook endpoint for your Mux integration to use your SMEE channel URL (e.g., `https://smee.io/your-unique-channel`) instead of your local Strapi URL.

This setup creates a secure tunnel, allowing Mux to send webhook events to your local Strapi environment, enabling proper processing of video uploads and status updates.

---

## Deployment

**Running Strapi on a resource-constrained shared hosting plan (e.g., 2GB RAM, limited processes) is generally NOT recommended.** Strapi is a Node.js application that can be memory-intensive, especially during startup and under load.

### Recommended Approach (Dedicated Backend Hosting)

For optimal performance, stability, and scalability, deploy Strapi to a dedicated backend hosting service.

*   **Examples:** [Render](https://render.com/), [Heroku](https://www.heroku.com/), or a small VPS.
*   **Method:**
    1.  Ensure all environment variables are correctly set in your hosting provider's configuration.
    2.  Build the Strapi admin panel: `npm run build`.
    3.  Upload your project files (excluding `node_modules`, `dist`, `.tmp`) or use Git-based deployment.
    4.  Install dependencies on the server: `npm install`.
    5.  Start Strapi in production mode: `npm run start`.
    6.  Configure a process manager (e.g., PM2) if needed for continuous uptime.

### Deployment on cPanel (with Caution)

If you must deploy to a cPanel Node.js application, proceed with caution and be aware of potential resource limitations.

*   **Steps:**
    1.  Build the admin panel: `npm run build`.
    2.  Upload the project to your cPanel Node.js app directory (e.g., via Git or FTP).
    3.  Ensure your environment variables are correctly set in the cPanel Node.js application configuration.
    4.  Install dependencies: `npm install`.
    5.  Start the Node.js app from cPanel using the `npm run start` command.
    6.  Monitor resource usage closely.

---

## Content Types & API

Content types (e.g., `product`, `home-page`) are defined in the `src/api/` directory. Strapi automatically generates RESTful API endpoints based on these content types.

*   **Example Endpoints:**
    *   `/api/contact-signups`
    *   `/api/globals`
    *   `/api/home-pages`
    *   `/api/products`

*   **Authentication & Permissions:** Ensure public roles are configured in Strapi's admin panel to allow access to necessary API endpoints.

---

## Troubleshooting

-   **Strapi CMS on cPanel:**
    *   As noted in the deployment section, resource constraints are a major concern. You may encounter memory issues during `npm install`. Using a Node.js version below 20 for `npm install` and then running the app with Node.js 20+ might be a workaround if supported by cPanel.
    *   Monitor your cPanel Node.js application logs and resource usage (CPU, RAM, number of processes) closely for any indications of issues.

---

## License

This project is proprietary and not open source.

---

## Changelog

### v1.2.0 - 2026-01-07

*   **Chore:** Upgrade to Strapi 5.33.1 and improve security overall.
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

*   Initial Strapi CMS backend setup.
*   Includes core content types and API configurations.