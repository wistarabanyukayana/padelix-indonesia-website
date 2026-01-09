# Padelix Indonesia Website

This is the official website for Padelix Indonesia, built with **Next.js 15**, **Tailwind CSS**, and **Firebase**.

## 🚀 Technology Stack

*   **Frontend:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS 4
*   **Database:** Firebase Firestore (NoSQL)
*   **Storage:** Firebase Storage
*   **Icons:** Lucide React / Custom SVGs
*   **Package Manager:** pnpm

## 🛠️ Project Structure

The project has been refactored from a Strapi-monorepo to a clean Next.js architecture.

```
/ 
├── public/              # Static assets (favicons, manifest, etc.)
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   │   ├── general/     # Generic wrappers (Card, AppImage, etc.)
│   │   ├── layout/      # Header, Footer
│   │   ├── sections/    # Page sections (Hero, Info, Product, etc.)
│   │   └── ui/          # Shadcn-like primitives (Button, Input, Sheet)
│   ├── data/            # Data layer
│   │   ├── static-content.ts  # Hardcoded text/links for static pages
│   │   └── loaders.ts         # Data fetchers (Firebase adapters)
│   └── lib/db/          # Firebase configuration and repositories
├── next.config.ts       # Next.js config
└── tailwind.config.ts   # (Inline in globals.css for v4)
```

## 🏁 Getting Started

### 1. Prerequisites

*   Node.js 18+ installed.
*   `pnpm` installed (`npm install -g pnpm`).

### 2. Installation

```bash
pnpm install
```

### 3. Firebase Setup

This project requires a Firebase project for **Products** and **Contact Form submissions**.

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (e.g., `padelix-web`).
3.  **Enable Firestore:** Build > Firestore Database > Create Database (Start in Production mode).
4.  **Enable Storage:** Build > Storage > Get Started.
5.  **Get Client Credentials:**
    *   Project Settings > General > Your apps > Add App (Web).
    *   Copy the `firebaseConfig`.

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Client-side (Public) - Required for Contact Form & Product List
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side (Admin) - Optional (Only if running admin scripts/SSG builds locally)
# If missing, the build will use mock data.
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 5. Running Locally

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

### 6. Building for Production

```bash
pnpm build
pnpm start
```

---

## 📦 Migration Guide (Moving away from Strapi)

Since the original Strapi CMS is being deprecated, you must migrate dynamic data and static assets.

### 1. Migrating Static Images (Logo, Hero, Icons)

Currently, `src/data/static-content.ts` points to `cms.padelix.co.id/uploads/...`. You must move these to this repo.

**Steps:**
1.  **Identify Images:** Check `src/data/static-content.ts` for all URLs.
2.  **Download:** Save these images to `public/assets/`.
3.  **Update Code:**
    *   Change `"https://cms.padelix.co.id/uploads/logo.png"`
    *   To `"/assets/logo.png"`
4.  **Clean Config:** Remove `cms.padelix.co.id` from `next.config.ts` once done.

### 2. Migrating Products (To Firestore)

The "Produk" section is empty until you populate Firebase.

**Steps:**
1.  Go to Firebase Console > Firestore.
2.  Create a collection named **`products`**.
3.  Add documents with these fields:
    *   `name` (string): e.g. "Padelix Panorama"
    *   `slug` (string): e.g. "padelix-panorama"
    *   `featured` (boolean): `true`
    *   `description` (string): "High quality court..."
    *   `price` (string): "150000000"
    *   `image` (map):
        *   `url` (string): "https://firebasestorage.googleapis.com/..." (Upload image to Firebase Storage first)
        *   `alt` (string): "Product Name"

### 3. Migrating Portfolio

Currently, Portfolio items are hardcoded in `src/data/static-content.ts`.
*   **To keep it static:** Download images to `public/assets/portfolio/` and update the paths.
*   **To make it dynamic:** Move the data to a `portfolios` Firestore collection and update `loaders.ts` to fetch it (similar to products).

---

## 🎨 Style Guide

*   **Border Radius:** Use `rounded-brand` (30px/1.875rem) for consistent pill shapes.
*   **Colors:**
    *   Primary: `bg-lime-400` (Green)
    *   Secondary: `bg-red-500` (Red)
    *   Dark: `bg-neutral-900` (Black)
    *   Light: `bg-slate-50` (White)
*   **Icons:** Use standard SVGs or `lucide-react`. Ensure external SVGs are allowed in `next.config.ts`.