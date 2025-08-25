import type { Metadata, Viewport } from "next";
import { Lato, Inter } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { getGlobalSettings } from "@/data/loaders";
import { Footer } from "@/components/layout/Footer";
import { getClientUrl } from "@/utils/get-client-url";
import { WAButton } from "@/components/ui/waButton";

const BASE_URL = getClientUrl();

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

async function loader() {
  const { data } = await getGlobalSettings();
  if (!data) throw new Error("Failed to fetch global settings");
  return {
    title: data?.title,
    description: data?.description,
    header: data?.header,
    footer: data?.footer,
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(`${BASE_URL}`),
  title: "Padelix Indonesia",
  description: "Padel Starts Here.",

  appleWebApp: {
    capable: true, // turns on standalone mode in iOS
    title: "Padelix Indonesia", // label under the icon
    statusBarStyle: "black-translucent", // optional styling of iOS status bar
  },

  // 1. Favicon + shortcut icon is directly in /app folder
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],

    shortcut: [
      {
        rel: "shortcut icon",
        url: "/favicon.ico",
        type: "image/x-icon",
        sizes: "16x16 32x32 48x48",
      },
    ],

    // 2. Apple touch icon (fallback if you just want one)
    apple: "/apple-icon-180x180.png",

    // 3. The “other” array is where you list _every_ custom link:
    other: [
      // Apple
      { rel: "apple-touch-icon", url: "/apple-icon-57x57.png", sizes: "57x57" },
      { rel: "apple-touch-icon", url: "/apple-icon-60x60.png", sizes: "60x60" },
      { rel: "apple-touch-icon", url: "/apple-icon-72x72.png", sizes: "72x72" },
      { rel: "apple-touch-icon", url: "/apple-icon-76x76.png", sizes: "76x76" },
      {
        rel: "apple-touch-icon",
        url: "/apple-icon-114x114.png",
        sizes: "114x114",
      },
      {
        rel: "apple-touch-icon",
        url: "/apple-icon-120x120.png",
        sizes: "120x120",
      },
      {
        rel: "apple-touch-icon",
        url: "/apple-icon-144x144.png",
        sizes: "144x144",
      },
      {
        rel: "apple-touch-icon",
        url: "/apple-icon-152x152.png",
        sizes: "152x152",
      },
      {
        rel: "apple-touch-icon",
        url: "/apple-icon-180x180.png",
        sizes: "180x180",
      },

      // Android / general PNG icons
      {
        rel: "icon",
        url: "/android-icon-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        rel: "icon",
        url: "/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        rel: "icon",
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
  },

  // 4. Web App Manifest
  manifest: "/manifest.json",

  openGraph: {
    title: "Padelix Indonesia",
    description: "Padel Starts Here.",
    url: "https://padelix.co.id",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { header, footer } = await loader();

  return (
    <html lang="id">
      <body
        className={`${lato.variable} ${inter.variable} antialiased flex flex-col items-center bg-white`}
      >
        <Header data={header} />
        {children}
        <Footer data={footer} />
        <WAButton />
      </body>
    </html>
  );
}
