import { db } from "@/lib/db";
import { products, portfolios, users } from "@/db/schema";
import { count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function AdminDashboard() {
  await checkPermission(PERMISSIONS.VIEW_DASHBOARD);
  const session = await getSession();
  if (!session) return null;

  const { user } = session;
  
  // Quick Stats
  const [productCount] = await db.select({ count: count() }).from(products);
  const [portfolioCount] = await db.select({ count: count() }).from(portfolios);
  const [userCount] = await db.select({ count: count() }).from(users);

  const quickActions = [
    { href: "/admin/products/new", label: "Produk Baru", permission: PERMISSIONS.MANAGE_PRODUCTS },
    { href: "/admin/portfolios/new", label: "Portofolio Baru", permission: PERMISSIONS.MANAGE_PORTFOLIOS },
    { href: "/admin/categories/new", label: "Kategori Baru", permission: PERMISSIONS.MANAGE_CATEGORIES },
    { href: "/admin/brands/new", label: "Brand Baru", permission: PERMISSIONS.MANAGE_BRANDS },
  ];

  const allowedActions = quickActions.filter(a => (user.permissions ?? []).includes(a.permission));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="h2 text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500">Selamat datang kembali, <span className="font-bold text-brand-green">{user.username}</span>!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Produk</h3>
          <p className="text-4xl font-black text-brand-green">{productCount.count}</p>
        </div>
        <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Portofolio</h3>
          <p className="text-4xl font-black text-brand-green">{portfolioCount.count}</p>
        </div>
        <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-4xl font-black text-brand-green">{userCount.count}</p>
        </div>
      </div>

      {allowedActions.length > 0 && (
        <div className="bg-white p-8 rounded-brand shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Akses Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allowedActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Button variant="outline" className="w-full h-24 flex-col gap-2 border-dashed border-2 hover:border-brand-green hover:text-brand-green hover:bg-brand-light">
                            <Plus size={24} />
                            <span>{action.label}</span>
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
