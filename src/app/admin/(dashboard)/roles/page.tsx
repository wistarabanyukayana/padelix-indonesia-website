import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { DeleteRoleButton } from "@/components/admin/roles/DeleteRoleButton";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { roles, rolesPermissions } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { Edit, Key, Plus, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminRolesPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "id";
  const rawDir = typeof params.dir === "string" ? params.dir : "asc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const sortMap = {
    id: roles.id,
    updated: roles.updatedAt,
    created: roles.createdAt,
    name: roles.name,
  };
  const sortColumn = sortMap[sortKey as keyof typeof sortMap] ?? roles.id;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        ilike(roles.name, `%${searchQuery}%`),
        ilike(roles.description, `%${searchQuery}%`),
      ),
    );
  }

  let rolesQuery = db.select().from(roles).$dynamic();
  if (filters.length) {
    rolesQuery = rolesQuery.where(and(...filters));
  }

  const roleList = await rolesQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn),
  );

  // Fetch permissions count for each role
  const rolesWithDetails = await Promise.all(
    roleList.map(async (role) => {
      const [permCount] = await db
        .select({ value: count() })
        .from(rolesPermissions)
        .where(eq(rolesPermissions.rolesId, role.id));

      return {
        ...role,
        permissionCount: permCount.value,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="h2 text-neutral-900">Konfigurasi Peran</h1>
            <p className="text-sm text-neutral-500">
              Definisikan tingkat akses untuk administrator
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/admin/users">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Daftar Pengguna</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div
        className="sticky z-30 -mx-4 border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari peran..."
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm"
            />
            <Button type="submit" variant="outline" size="sm">
              Cari
            </Button>
          </div>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sortKey}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="id">ID</option>
              <option value="updated">Terakhir Diubah</option>
              <option value="created">Tanggal Dibuat</option>
              <option value="name">Nama</option>
            </select>
            <select
              name="dir"
              defaultValue={sortDir}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </form>
      </div>

      {rolesWithDetails.length === 0 ? (
        <div className="rounded-brand border border-neutral-200 bg-white py-12 text-center">
          <p className="text-neutral-400">Belum ada peran yang dibuat.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {rolesWithDetails.map((role) => (
              <div
                key={role.id}
                className="group relative overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm"
              >
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                  <Link href={`/admin/roles/${role.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 border-blue-100 p-0 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={16} />
                    </Button>
                  </Link>
                  {role.name !== "super_admin" && (
                    <DeleteRoleButton id={role.id} name={role.name} />
                  )}
                </div>
                <Link
                  href={`/admin/roles/${role.id}/edit`}
                  className="block p-4 pr-14"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100">
                      <ShieldCheck
                        className={`h-5 w-5 ${role.name === "super_admin" ? "text-brand-green" : "text-neutral-400"}`}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-black text-neutral-900">
                          {role.name}
                        </h3>
                        {role.name === "super_admin" && (
                          <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-black text-white uppercase">
                            System
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-neutral-400">
                        ID: {role.id}
                      </p>
                      <p className="line-clamp-2 text-sm text-neutral-600">
                        {role.description || "Tidak ada deskripsi."}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold tracking-tight text-neutral-500 uppercase">
                        <Key size={13} />
                        {role.permissionCount} Izin Akses
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="w-20 px-6 py-4 text-xs font-black tracking-wider text-neutral-900 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-black tracking-wider text-neutral-900 uppercase">
                      Nama Peran
                    </th>
                    <th className="px-6 py-4 text-xs font-black tracking-wider text-neutral-900 uppercase">
                      Deskripsi
                    </th>
                    <th className="px-6 py-4 text-xs font-black tracking-wider text-neutral-900 uppercase">
                      Izin
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black tracking-wider text-neutral-900 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rolesWithDetails.map((role) => (
                    <tr
                      key={role.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4 font-mono font-black text-neutral-900">
                        {role.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            className={`h-4 w-4 ${role.name === "super_admin" ? "text-brand-green" : "text-neutral-400"}`}
                          />
                          {role.name}
                          {role.name === "super_admin" && (
                            <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-black text-white uppercase">
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {role.description || "Tidak ada deskripsi."}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-neutral-500 uppercase">
                          <Key size={13} />
                          {role.permissionCount} Izin
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/roles/${role.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 border-blue-100 p-0 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Button>
                          </Link>
                          {role.name !== "super_admin" && (
                            <DeleteRoleButton id={role.id} name={role.name} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex justify-end">
        <Link href="/admin/roles/new">
          <Button
            variant="dark"
            size="sm"
            className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base"
          >
            <Plus size={16} />
            <span>Tambah Peran</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
