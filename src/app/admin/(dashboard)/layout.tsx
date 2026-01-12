import { getSession } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { PERMISSIONS, Permission } from "@/config/permissions";
import { NavSection } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard",
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

interface RawNavSection {
    type: "link" | "group";
    label: string;
    href?: string;
    permission?: Permission;
    items?: { label: string; href: string; permission?: Permission }[];
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { user } = session;

  const navStructure: RawNavSection[] = [
    {
      type: "link",
      label: "Dashboard",
      href: "/admin",
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      type: "group",
      label: "Katalog",
      items: [
        { label: "Produk", href: "/admin/products", permission: PERMISSIONS.MANAGE_PRODUCTS },
        { label: "Kategori", href: "/admin/categories", permission: PERMISSIONS.MANAGE_CATEGORIES },
        { label: "Brand", href: "/admin/brands", permission: PERMISSIONS.MANAGE_BRANDS },
      ],
    },
    {
      type: "group",
      label: "Konten",
      items: [
        { label: "Portofolio", href: "/admin/portfolios", permission: PERMISSIONS.MANAGE_PORTFOLIOS },
        { label: "Media", href: "/admin/media", permission: PERMISSIONS.MANAGE_MEDIA },
      ],
    },
    {
      type: "group",
      label: "Sistem",
      items: [
        { label: "Pengguna", href: "/admin/users", permission: PERMISSIONS.MANAGE_USERS },
        { label: "Audit", href: "/admin/audit-logs", permission: PERMISSIONS.VIEW_AUDIT_LOGS },
      ],
    },
  ];

  // Filter links based on user permissions
  const filteredNav = navStructure
    .map((section): NavSection | null => {
      if (section.type === "link") {
        if (!section.permission || (user.permissions ?? []).includes(section.permission)) {
          return { type: "link", label: section.label, href: section.href! };
        }
        return null;
      }
      if (section.type === "group") {
        const filteredItems = section.items?.filter(
          (item) => !item.permission || (user.permissions ?? []).includes(item.permission as string)
        );
        if (filteredItems && filteredItems.length > 0) {
          return { 
            type: "group", 
            label: section.label, 
            items: filteredItems.map(i => ({ label: i.label, href: i.href })) 
          };
        }
        return null;
      }
      return null;
    })
    .filter((n): n is NavSection => n !== null);

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <AdminHeader user={user} navStructure={filteredNav} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
        </main>

        {/* Admin Footer */}
        <footer className="bg-white border-t border-neutral-200 py-6 flex-none pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Padelix Indonesia Admin Panel.
            </div>
        </footer>
      </div>
    </div>
  );
}