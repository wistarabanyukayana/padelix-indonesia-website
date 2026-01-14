import { db } from "@/lib/db";
import { users, usersRoles, roles } from "@/db/schema";
import { eq, desc, like, or, asc, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Plus, Shield, Clock } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
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
    filters.push(or(like(users.username, `%${searchQuery}%`), like(users.email, `%${searchQuery}%`)));
  }

  let usersQuery = db.select().from(users);
  if (filters.length) {
    usersQuery = usersQuery.where(and(...filters));
  }

  const userList = await usersQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn)
  );
  const formatDateTime = (value: Date | string | null) => {
    if (!value) return "-";
    const raw = value instanceof Date ? value.toISOString() : value;
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(normalized).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
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
    })
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
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="h2 text-neutral-900">Manajemen Pengguna</h1>
            <p className="text-sm text-neutral-500">Kelola akses administrator dan peran sistem</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/admin/roles">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Shield size={16} />
                <span className="hidden sm:inline">Kelola Peran</span>
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
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
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
                className={`relative rounded-brand border shadow-sm overflow-hidden group ${
                  isCurrentUser
                    ? "bg-brand-green/5 border-brand-green/30"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="absolute top-3 right-3 z-10">
                   <DeleteUserButton id={u.id} username={u.username} />
                </div>

                <Link href={`/admin/users/${u.id}/edit`} className="block p-4 active:bg-neutral-50 transition-colors">
                    <div className="flex gap-4 items-start pr-10">
                        <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-brand-light border border-brand-green/20 flex items-center justify-center text-brand-green font-black text-lg">
                            {u.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-neutral-900 text-base leading-tight truncate">
                                  {u.username}
                              </h3>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {u.roles.map((role, i) => (
                                    <span key={i} className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                        {role}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1">
                                <Clock size={12} />
                                <span>Login: {formatDateTime(u.lastLogin)}</span>
                            </div>
                        </div>
                    </div>
                </Link>
              </div>
            )})}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Pengguna</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Email</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Peran</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Login Terakhir</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {orderedUsers.map((u) => {
                      const isCurrentUser = currentUserId === u.id;
                      return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isCurrentUser ? "bg-brand-green/5" : "hover:bg-neutral-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-light border border-brand-green/20 flex items-center justify-center text-brand-green font-black text-sm">
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">{u.username}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((role, i) => (
                                <span key={i} className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold uppercase border border-neutral-200">
                                    {role}
                                </span>
                            ))}
                            {u.roles.length === 0 && <span className="text-neutral-300 italic text-xs">No roles</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
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
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <DeleteUserButton id={u.id} username={u.username} />
                          </div>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end mt-4">
        <Link href="/admin/users/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah User</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
