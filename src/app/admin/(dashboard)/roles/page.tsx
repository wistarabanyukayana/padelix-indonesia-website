import { db } from "@/lib/db";
import { roles, rolesPermissions } from "@/db/schema";
import { eq, desc, count, like, or, asc, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Plus, ShieldCheck, Users, Key } from "lucide-react";
import { DeleteRoleButton } from "@/components/admin/DeleteRoleButton";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminRolesPage({ searchParams }: PageProps) {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
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
    filters.push(or(like(roles.name, `%${searchQuery}%`), like(roles.description, `%${searchQuery}%`)));
  }

  let rolesQuery = db.select().from(roles);
  if (filters.length) {
    rolesQuery = rolesQuery.where(and(...filters));
  }

  const roleList = await rolesQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn)
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
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="h2 text-neutral-900">Konfigurasi Peran</h1>
            <p className="text-sm text-neutral-500">Definisikan tingkat akses untuk administrator</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Users size={16} />
                <span className="hidden sm:inline">Daftar Pengguna</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div
        className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-neutral-50/95 backdrop-blur border-b border-neutral-200"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada peran yang dibuat.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {rolesWithDetails.map((role) => (
              <div key={role.id} className="relative bg-white rounded-brand border border-neutral-200 shadow-sm overflow-hidden group">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                  <Link href={`/admin/roles/${role.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50">
                      <Edit size={16} />
                    </Button>
                  </Link>
                  {role.name !== "super_admin" && <DeleteRoleButton id={role.id} name={role.name} />}
                </div>
                <Link href={`/admin/roles/${role.id}/edit`} className="block p-4 pr-14">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                      <ShieldCheck className={`h-5 w-5 ${role.name === "super_admin" ? "text-brand-green" : "text-neutral-400"}`} />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-neutral-900 truncate">{role.name}</h3>
                        {role.name === "super_admin" && (
                          <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">System</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">ID: {role.id}</p>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {role.description || "Tidak ada deskripsi."}
                      </p>
                      <div className="flex items-center gap-1.5 text-neutral-500 font-bold text-xs uppercase tracking-tight mt-1">
                        <Key size={13} />
                        {role.permissionCount} Izin Akses
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-black text-neutral-900 uppercase tracking-wider text-xs w-20">ID</th>
                    <th className="px-6 py-4 font-black text-neutral-900 uppercase tracking-wider text-xs">Nama Peran</th>
                    <th className="px-6 py-4 font-black text-neutral-900 uppercase tracking-wider text-xs">Deskripsi</th>
                    <th className="px-6 py-4 font-black text-neutral-900 uppercase tracking-wider text-xs">Izin</th>
                    <th className="px-6 py-4 font-black text-neutral-900 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rolesWithDetails.map((role) => (
                    <tr key={role.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-black text-neutral-900 font-mono">
                        {role.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`h-4 w-4 ${role.name === "super_admin" ? "text-brand-green" : "text-neutral-400"}`} />
                          {role.name}
                          {role.name === "super_admin" && (
                            <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">System</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {role.description || "Tidak ada deskripsi."}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-bold text-xs uppercase tracking-tight">
                          <Key size={13} />
                          {role.permissionCount} Izin
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/roles/${role.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50">
                              <Edit size={16} />
                            </Button>
                          </Link>
                          {role.name !== "super_admin" && <DeleteRoleButton id={role.id} name={role.name} />}
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

      <div className="flex justify-end mt-4">
        <Link href="/admin/roles/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah Peran</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
