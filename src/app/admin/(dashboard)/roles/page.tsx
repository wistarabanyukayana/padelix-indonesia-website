import { db } from "@/lib/db";
import { roles, rolesPermissions } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Plus, ShieldCheck, Users, Key } from "lucide-react";
import { DeleteRoleButton } from "@/components/admin/DeleteRoleButton";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function AdminRolesPage() {
  await checkPermission(PERMISSIONS.MANAGE_USERS);
  const roleList = await db.select().from(roles).orderBy(desc(roles.createdAt));

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
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <h1 className="h2 text-neutral-900">Konfigurasi Peran</h1>
            <p className="text-sm text-neutral-500">Definisikan tingkat akses untuk administrator</p>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/users">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="hidden sm:inline">Daftar Pengguna</span>
                </Button>
            </Link>
        </div>
      </div>

      {rolesWithDetails.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada peran yang dibuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesWithDetails.map((role) => (
                <div key={role.id} className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200 flex flex-col gap-4 relative group">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                <ShieldCheck size={20} className={role.name === 'super_admin' ? "text-brand-green" : "text-neutral-400"} />
                                {role.name}
                            </h3>
                            <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">ID: {role.id}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link href={`/admin/roles/${role.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50">
                                    <Edit size={14} />
                                </Button>
                            </Link>
                            {role.name !== 'super_admin' && <DeleteRoleButton id={role.id} name={role.name} />}
                        </div>
                    </div>

                    <p className="text-sm text-neutral-600 leading-relaxed h-10 line-clamp-2">
                        {role.description || "Tidak ada deskripsi."}
                    </p>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-bold text-xs uppercase tracking-tight">
                            <Key size={14} />
                            {role.permissionCount} Izin Akses
                        </div>
                        {role.name === 'super_admin' && (
                            <span className="text-[10px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">System</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
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