# Padelix Production Deployment

## Installation
1. Ensure Node.js v20+ is installed on the server.
2. Run `npm install` in this directory.
3. Environment variables are in `.env`.

## Database Setup
- Import database SQL files from the `database` folder.
- Execute `database/seed_super_admin.sql` to ensure admin access.

## Running the Server
```bash
node server.js
```