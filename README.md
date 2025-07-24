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

See the individual app READMEs for deployment instructions.

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