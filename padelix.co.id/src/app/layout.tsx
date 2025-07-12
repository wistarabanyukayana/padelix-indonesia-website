import type { Metadata } from "next";
import { Lato, Inter } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { getGlobalSettings } from "@/data/loaders";
import { Footer } from "@/components/layout/Footer";

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

export async function generateMetadata(): Promise<Metadata> {
  // fetch post information
  const { title, description } = await loader();

  return {
    title: title,
    description: description,
  };
}

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
      </body>
    </html>
  );
}
