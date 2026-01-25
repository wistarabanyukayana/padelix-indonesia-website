import { AdminFooter } from "@/components/admin/layout/AdminFooter";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminStickyBarWatcher } from "@/components/admin/layout/AdminStickyBarWatcher";
import { PERMISSIONS, Permission } from "@/config/permissions";
import { verifySession } from "@/lib/dal";
import { NavSection } from "@/types";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard for Padelix Indonesia",
  icons: {
    icon: [
      {
        url: "/assets/padelix-favicons/green/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/padelix-favicons/green/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/assets/padelix-favicons/green/favicon.ico",
    apple: "/assets/padelix-favicons/green/favicon-180x180.png",
  },
};

async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  const { user } = session;

  const navStructure: {
    type: "link" | "group";
    label: string;
    href?: string;
    permission?: Permission;
    items?: { label: string; href: string; permission?: Permission }[];
  }[] = [
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
        {
          label: "Produk",
          href: "/admin/products",
          permission: PERMISSIONS.MANAGE_PRODUCTS,
        },
        {
          label: "Kategori",
          href: "/admin/categories",
          permission: PERMISSIONS.MANAGE_CATEGORIES,
        },
        {
          label: "Brand",
          href: "/admin/brands",
          permission: PERMISSIONS.MANAGE_BRANDS,
        },
      ],
    },
    {
      type: "group",
      label: "Konten",
      items: [
        {
          label: "Portofolio",
          href: "/admin/portfolios",
          permission: PERMISSIONS.MANAGE_PORTFOLIOS,
        },
        {
          label: "Media",
          href: "/admin/media",
          permission: PERMISSIONS.MANAGE_MEDIA,
        },
      ],
    },
    {
      type: "group",
      label: "Sistem",
      items: [
        {
          label: "Pengguna",
          href: "/admin/users",
          permission: PERMISSIONS.MANAGE_USERS,
        },
        {
          label: "Audit",
          href: "/admin/audit-logs",
          permission: PERMISSIONS.VIEW_AUDIT_LOGS,
        },
      ],
    },
  ];

  const filteredNav = navStructure
    .map((section): NavSection | null => {
      if (section.type === "link") {
        if (
          !section.permission ||
          (user.permissions ?? []).includes(section.permission)
        ) {
          return { type: "link", label: section.label, href: section.href! };
        }
        return null;
      }
      if (section.type === "group") {
        const filteredItems = section.items?.filter(
          (item) =>
            !item.permission ||
            (user.permissions ?? []).includes(item.permission as string),
        );
        if (filteredItems && filteredItems.length > 0) {
          return {
            type: "group",
            label: section.label,
            items: filteredItems.map((i) => ({ label: i.label, href: i.href })),
          };
        }
        return null;
      }
      return null;
    })
    .filter((n): n is NavSection => n !== null);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AdminStickyBarWatcher />
      <AdminHeader user={user} navStructure={filteredNav} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
