import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin Dashboard for Padelix Indonesia",
  icons: {
    icon: [
      { url: "/assets/padelix-favicons/green/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/padelix-favicons/green/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/assets/padelix-favicons/green/favicon.ico",
    apple: "/assets/padelix-favicons/green/favicon-180x180.png",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
