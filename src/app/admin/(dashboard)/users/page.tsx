import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { DeleteUserButton } from "@/components/admin/users/DeleteUserButton";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { roles, users, usersRoles } from "@/db/schema";
import { getSession, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { Clock, Edit, Plus, Shield } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_USERS);
  if (!allowed) return <AccessDenied />;
  const session = await getSession();
  const currentUserId = session?.user?.id ?? null;

  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "id";
  const rawDir = typeof params.dir === "string" ? params.dir : "asc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "desc" ? "desc" : "asc";

  const sortMap = {
    id: users.id,
    username: users.username,
    email: users.email,
    lastLogin: users.lastLogin,
    created: users.createdAt,
  };
  const sortColumn = sortMap[sortKey as keyof typeof sortMap] ?? users.id;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        ilike(users.username, `%${searchQuery}%`),
        ilike(users.email, `%${searchQuery}%`),
      ),
    );
  }

  let usersQuery = db.select().from(users).$dynamic();
  if (filters.length) {
    usersQuery = usersQuery.where(and(...filters));
  }

  const userList = await usersQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn),
  );
  const formatDateTime = (value: Date | string | null) => {
    if (!value) return "-";
    const raw = value instanceof Date ? value.toISOString() : value;
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(normalized).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
  };

  // Fetch roles for each user
  const usersWithRoles = await Promise.all(
    userList.map(async (user) => {
      const userRolesList = await db
        .select({
          name: roles.name,
        })
        .from(usersRoles)
        .leftJoin(roles, eq(usersRoles.rolesId, roles.id))
        .where(eq(usersRoles.usersId, user.id));

      return {
        ...user,
        roles: userRolesList.map((r) => r.name),
      };
    }),
  );
  const orderedUsers = [...usersWithRoles];
  if (currentUserId) {
    orderedUsers.sort((a, b) => {
      const aIsCurrent = a.id === currentUserId;
      const bIsCurrent = b.id === currentUserId;
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      return 0;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="h2 text-neutral-900">Manajemen Pengguna</h1>
            <p className="text-sm text-neutral-500">
              Kelola akses administrator dan peran sistem
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/admin/roles">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield size={16} />
                <span className="hidden sm:inline">Kelola Peran</span>
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
              placeholder="Cari pengguna..."
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
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="lastLogin">Login Terakhir</option>
              <option value="created">Tanggal Dibuat</option>
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

      {orderedUsers.length === 0 ? (
        <div className="rounded-brand border border-neutral-200 bg-white py-12 text-center">
          <p className="text-neutral-400">Belum ada pengguna.</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orderedUsers.map((u) => {
              const isCurrentUser = currentUserId === u.id;
              return (
                <div
                  key={u.id}
                  className={`group relative overflow-hidden rounded-brand border shadow-sm ${
                    isCurrentUser
                      ? "border-brand-green/30 bg-brand-green/5"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="absolute top-3 right-3 z-10">
                    <DeleteUserButton id={u.id} username={u.username} />
                  </div>

                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="block p-4 transition-colors active:bg-neutral-50"
                  >
                    <div className="flex items-start gap-4 pr-10">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-green/20 bg-brand-light text-lg font-black text-brand-green">
                        {u.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base leading-tight font-bold text-neutral-900">
                            {u.username}
                          </h3>
                          {isCurrentUser && (
                            <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-black text-white uppercase">
                              Akun Anda
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-neutral-400">
                          {u.email}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {u.roles.map((role, i) => (
                            <span
                              key={i}
                              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-400">
                          <Clock size={12} />
                          <span>Login: {formatDateTime(u.lastLogin)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Pengguna
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Peran
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Login Terakhir
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orderedUsers.map((u) => {
                    const isCurrentUser = currentUserId === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? "bg-brand-green/5"
                            : "hover:bg-neutral-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-green/20 bg-brand-light text-sm font-black text-brand-green">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">
                                {u.username}
                              </span>
                              {isCurrentUser && (
                                <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((role, i) => (
                              <span
                                key={i}
                                className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase"
                              >
                                {role}
                              </span>
                            ))}
                            {u.roles.length === 0 && (
                              <span className="text-xs text-neutral-300 italic">
                                No roles
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              u.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-400">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDateTime(u.lastLogin)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${u.id}/edit`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 border-blue-200 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <DeleteUserButton id={u.id} username={u.username} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex justify-end">
        <Link href="/admin/users/new">
          <Button
            variant="dark"
            size="sm"
            className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base"
          >
            <Plus size={16} />
            <span>Tambah User</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
