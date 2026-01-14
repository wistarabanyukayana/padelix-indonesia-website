import { db } from "@/lib/db";
import { users, usersRoles, roles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Plus, Shield, Clock } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function AdminUsersPage() {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
  const userList = await db.select().from(users).orderBy(desc(users.createdAt));
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <h1 className="h2 text-neutral-900">Manajemen Pengguna</h1>
            <p className="text-sm text-neutral-500">Kelola akses administrator dan peran sistem</p>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/roles">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Shield size={16} />
                    <span className="hidden sm:inline">Kelola Peran</span>
                </Button>
            </Link>
        </div>
      </div>

      {usersWithRoles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada pengguna.</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {usersWithRoles.map((u) => (
              <div key={u.id} className="relative bg-white rounded-brand border border-neutral-200 shadow-sm overflow-hidden group">
                <div className="absolute top-3 right-3 z-10">
                   <DeleteUserButton id={u.id} username={u.username} />
                </div>

                <Link href={`/admin/users/${u.id}/edit`} className="block p-4 active:bg-neutral-50 transition-colors">
                    <div className="flex gap-4 items-start pr-10">
                        <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-brand-light border border-brand-green/20 flex items-center justify-center text-brand-green font-black text-lg">
                            {u.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <h3 className="font-bold text-neutral-900 text-base leading-tight truncate">
                                {u.username}
                            </h3>
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
            ))}
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
                    {usersWithRoles.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-light border border-brand-green/20 flex items-center justify-center text-brand-green font-black text-sm">
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-neutral-900">{u.username}</span>
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
                    ))}
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
