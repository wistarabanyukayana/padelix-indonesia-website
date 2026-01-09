import type { Metadata, Viewport } from "next";
import { Lato, Inter } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WAButton } from "@/components/ui/waButton";
import { GLOBAL_SETTINGS } from "@/data/static-content";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"]
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"]
});

const BASE_URL = process.env.NEXT_PUBLIC_URL_PUBLIC || "https://padelix.co.id";

export const metadata: Metadata = {
  metadataBase: new URL(`${BASE_URL}`),
  title: "Padelix Indonesia",
  description: "Padel Starts Here.",

  appleWebApp: {
    capable: true,
    title: "Padelix Indonesia",
    statusBarStyle: "black-translucent",
  },

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

    apple: "/apple-icon-180x180.png",

    other: [
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
  const { header, footer } = GLOBAL_SETTINGS;

  const mappedHeader = {
      backgroundColor: "white" as const,
      logo: { id: 0, logoText: header.logoText, backgroundColor: "white" as const, image: { id: 0, documentId: "logo", url: header.logoUrl, alternativeText: header.logoText } },
      navigation: header.navLinks,
      moreOptionIcon: { id: 0, logoText: "More", backgroundColor: "white" as const, image: { id: 0, documentId: "more", url: header.moreOptionIconUrl, alternativeText: "More" } }
  };

  const mappedFooter = {
      backgroundColor: "white" as const,
      logoText: footer.logoText,
      text: footer.text,
      copy: footer.copy,
      socialLinks: footer.socialLinks
  };

  return (
    <html lang="id">
      <body
        className={`${lato.variable} ${inter.variable} antialiased flex flex-col items-center bg-white`}
      >
        <Header data={mappedHeader} />
        {children}
        <Footer data={mappedFooter} />
        <WAButton />
      </body>
    </html>
  );
}