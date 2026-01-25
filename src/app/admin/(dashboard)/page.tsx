import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { auditLogs, portfolios, products, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { count, desc } from "drizzle-orm";
import {
  Activity,
  GalleryHorizontal,
  Package,
  Plus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) return null;
  if (!(session.user.permissions ?? []).includes(PERMISSIONS.VIEW_DASHBOARD)) {
    return <AccessDenied />;
  }

  const { user } = session;

  // Quick Stats
  const [productCount] = await db.select({ count: count() }).from(products);
  const [portfolioCount] = await db.select({ count: count() }).from(portfolios);
  const [userCount] = await db.select({ count: count() }).from(users);

  const quickActions = [
    {
      href: "/admin/products/new",
      label: "Produk Baru",
      permission: PERMISSIONS.MANAGE_PRODUCTS,
    },
    {
      href: "/admin/portfolios/new",
      label: "Portofolio Baru",
      permission: PERMISSIONS.MANAGE_PORTFOLIOS,
    },
    {
      href: "/admin/categories/new",
      label: "Kategori Baru",
      permission: PERMISSIONS.MANAGE_CATEGORIES,
    },
    {
      href: "/admin/brands/new",
      label: "Brand Baru",
      permission: PERMISSIONS.MANAGE_BRANDS,
    },
  ];

  const allowedActions = quickActions.filter((a) =>
    (user.permissions ?? []).includes(a.permission),
  );
  const canViewAudit = (user.permissions ?? []).includes(
    PERMISSIONS.VIEW_AUDIT_LOGS,
  );
  const recentAuditLogs = canViewAudit
    ? await db.select().from(auditLogs).orderBy(desc(auditLogs.id)).limit(6)
    : [];

  const formatDateTime = (value: Date | string | null) => {
    if (!value) return "-";
    const raw = value instanceof Date ? value.toISOString() : value;
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(normalized).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="h2 text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500">
          Selamat datang kembali,{" "}
          <span className="font-bold text-brand-green">{user.username}</span>!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-green">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs font-black tracking-wider text-neutral-500 uppercase">
              Total Produk
            </p>
            <p className="text-3xl font-black text-neutral-900 sm:text-4xl">
              {productCount.count}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-green">
            <GalleryHorizontal size={22} />
          </div>
          <div>
            <p className="text-xs font-black tracking-wider text-neutral-500 uppercase">
              Total Portofolio
            </p>
            <p className="text-3xl font-black text-neutral-900 sm:text-4xl">
              {portfolioCount.count}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-green">
            <UsersRound size={22} />
          </div>
          <div>
            <p className="text-xs font-black tracking-wider text-neutral-500 uppercase">
              Total Users
            </p>
            <p className="text-3xl font-black text-neutral-900 sm:text-4xl">
              {userCount.count}
            </p>
          </div>
        </div>
      </div>

      {(canViewAudit || allowedActions.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-brand-green" />
                <h2 className="text-lg font-black text-neutral-900">
                  {canViewAudit ? "Aktivitas Terbaru" : "Ringkasan Admin"}
                </h2>
              </div>
              {canViewAudit && (
                <Link
                  href="/admin/audit-logs"
                  className="text-xs font-bold text-brand-green hover:underline"
                >
                  Lihat Semua
                </Link>
              )}
            </div>
            {canViewAudit ? (
              recentAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-400">
                  Belum ada aktivitas.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-neutral-100">
                  {recentAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
                            {log.action}
                          </span>
                          <span className="truncate text-sm font-bold text-neutral-900">
                            {log.usernameSnapshot}
                          </span>
                        </div>
                        <p className="truncate text-xs text-neutral-500">
                          {log.details || "Tanpa detail."}
                        </p>
                      </div>
                      <div className="font-mono text-[11px] whitespace-nowrap text-neutral-400">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
                  Anda belum memiliki akses ke log audit. Hubungi admin untuk
                  mendapatkan izin tambahan.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <p className="text-[11px] font-black tracking-wider text-neutral-500 uppercase">
                      Total Izin
                    </p>
                    <p className="text-2xl font-black text-neutral-900">
                      {user.permissions?.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <p className="text-[11px] font-black tracking-wider text-neutral-500 uppercase">
                      Akses Cepat
                    </p>
                    <p className="text-2xl font-black text-neutral-900">
                      {allowedActions.length}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(user.permissions ?? []).slice(0, 6).map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-neutral-500 uppercase"
                    >
                      {permission.replace(/_/g, " ")}
                    </span>
                  ))}
                  {(user.permissions ?? []).length === 0 && (
                    <span className="text-xs text-neutral-400">
                      Tidak ada izin aktif.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {allowedActions.length > 0 && (
            <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-neutral-900">
                Akses Cepat
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {allowedActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button
                      variant="outline"
                      className="flex h-16 w-full items-center justify-between border-2 border-dashed px-4 text-sm hover:border-brand-green hover:bg-brand-light hover:text-brand-green sm:text-base"
                    >
                      <span>{action.label}</span>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
